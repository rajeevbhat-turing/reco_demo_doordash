"""LightFM sidecar.

Hybrid CF + content recommender. Reads the Dashdoor SQLite at startup,
trains a WARP-loss LightFM model over orders × restaurant features,
exposes the /recommend wire contract.

Reference: docs/reco-http-contract.md
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import numpy as np
from fastapi import FastAPI, HTTPException
from lightfm import LightFM

# Allow `from common.contract import ...` when the file runs in-container.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.contract import RecoContext, RecoItem, RecommendationResponse  # noqa: E402
from common.db import (  # noqa: E402
    Catalog,
    haversine_miles,
    load_catalog,
    restrict_indices,
)

VERSION = "1.17-warp"
ENGINE_NAME = "lightfm"

EPOCHS = int(os.environ.get("LIGHTFM_EPOCHS", "30"))
LOSS = os.environ.get("LIGHTFM_LOSS", "warp")  # warp | bpr | warp-kos | logistic
COMPONENTS = int(os.environ.get("LIGHTFM_COMPONENTS", "32"))
DISTANCE_FILTER_MI = float(os.environ.get("RECO_DISTANCE_MI", "10"))

app = FastAPI(title="reco-lightfm")


class _State:
    catalog: Catalog | None = None
    model: LightFM | None = None
    trained_at: float | None = None


state = _State()


@app.on_event("startup")
def _train() -> None:
    print(f"[{ENGINE_NAME}] loading catalog...", flush=True)
    state.catalog = load_catalog()
    cat = state.catalog
    n_users, n_items = cat.interactions.shape
    print(
        f"[{ENGINE_NAME}] catalog: {n_users} users × {n_items} items, "
        f"{int(cat.interactions.nnz)} interactions, "
        f"{len(cat.feature_names)} item features",
        flush=True,
    )

    state.model = LightFM(no_components=COMPONENTS, loss=LOSS)
    t0 = time.time()
    state.model.fit(
        cat.interactions,
        item_features=cat.item_features,
        epochs=EPOCHS,
        num_threads=4,
    )
    state.trained_at = time.time()
    print(
        f"[{ENGINE_NAME}] trained in {state.trained_at - t0:.1f}s "
        f"(loss={LOSS}, epochs={EPOCHS}, components={COMPONENTS})",
        flush=True,
    )


@app.get("/health")
def health() -> dict:
    if state.model is None or state.catalog is None:
        raise HTTPException(status_code=503, detail="not trained yet")
    return {"ok": True, "engine": ENGINE_NAME, "version": VERSION}


@app.post("/recommend", response_model=RecommendationResponse)
def recommend(ctx: RecoContext) -> RecommendationResponse:
    if state.model is None or state.catalog is None:
        raise HTTPException(status_code=503, detail="not trained yet")
    cat = state.catalog
    model = state.model
    start = time.perf_counter()

    debug: dict = {}

    # restrict the score window to (a) candidatePool, then (b) 10mi radius
    item_idxs = restrict_indices(ctx.candidatePool, cat.item_id_to_idx, len(cat.item_idx_to_id))
    if item_idxs.size == 0:
        return _empty(ctx, start, error="no candidates after pool filter")

    dists = haversine_miles(ctx.lat, ctx.lng, cat.item_lat[item_idxs], cat.item_lng[item_idxs])
    keep = dists <= DISTANCE_FILTER_MI
    item_idxs = item_idxs[keep]
    if item_idxs.size == 0:
        return _empty(ctx, start, error="no candidates within radius")

    # known user → personalized; unknown → popularity fallback (debug.fallback)
    user_idx = cat.user_id_to_idx.get(ctx.userId or "")
    if user_idx is None:
        scores = cat.popularity[item_idxs]
        debug["fallback"] = "popularity (unknown user)"
    else:
        scores = model.predict(
            user_ids=user_idx,
            item_ids=item_idxs,
            item_features=cat.item_features,
            num_threads=2,
        )
        debug["fallback"] = False

    # top-k by score desc
    top = np.argsort(-scores)[: ctx.k]
    ranked_idxs = item_idxs[top]
    ranked_scores = scores[top]

    surface_kind = "item" if ctx.surface == "store_items" else "restaurant"
    items = [
        RecoItem(
            id=cat.item_idx_to_id[int(i)],
            score=float(s),
            kind=surface_kind,
        )
        for i, s in zip(ranked_idxs, ranked_scores)
    ]

    return RecommendationResponse(
        items=items,
        engine=ENGINE_NAME,
        version=VERSION,
        latencyMs=(time.perf_counter() - start) * 1000.0,
        debug={
            **debug,
            "candidates_considered": int(item_idxs.size),
            "loss": LOSS,
            "components": COMPONENTS,
        },
    )


def _empty(ctx: RecoContext, start: float, error: str) -> RecommendationResponse:
    return RecommendationResponse(
        items=[],
        engine=ENGINE_NAME,
        version=VERSION,
        latencyMs=(time.perf_counter() - start) * 1000.0,
        debug={"error": error},
    )
