"""Implicit sidecar.

Pure CF on implicit feedback (orders). Two backends configurable via
env: ALS (default) and BPR. For the `store_items` surface, returns
item-to-item neighbors instead of user-to-item predictions.

Reference: docs/reco-http-contract.md
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import numpy as np
import scipy.sparse as sp
from fastapi import FastAPI, HTTPException

# Allow `from common.contract import ...` when the file runs in-container.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.contract import RecoContext, RecoItem, RecommendationResponse  # noqa: E402
from common.db import (  # noqa: E402
    Catalog,
    haversine_miles,
    load_catalog,
    restrict_indices,
)

ENGINE_NAME = "implicit"
MODEL = os.environ.get("IMPLICIT_MODEL", "als")  # als | bpr
FACTORS = int(os.environ.get("IMPLICIT_FACTORS", "64"))
ITERATIONS = int(os.environ.get("IMPLICIT_ITERATIONS", "15"))
DISTANCE_FILTER_MI = float(os.environ.get("RECO_DISTANCE_MI", "10"))

VERSION = f"0.7.2-{MODEL}-f{FACTORS}"

app = FastAPI(title="reco-implicit")


class _State:
    catalog: Catalog | None = None
    model = None
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
        f"{int(cat.interactions.nnz)} interactions",
        flush=True,
    )

    if MODEL == "bpr":
        from implicit.bpr import BayesianPersonalizedRanking

        state.model = BayesianPersonalizedRanking(
            factors=FACTORS, iterations=ITERATIONS, verify_negative_samples=True
        )
    else:
        from implicit.als import AlternatingLeastSquares

        # implicit's ALS expects a confidence-weighted matrix; double for stronger signal.
        state.model = AlternatingLeastSquares(
            factors=FACTORS, iterations=ITERATIONS, regularization=0.01
        )

    t0 = time.time()
    # `implicit` wants users-rows for fit; also wants CSR.
    state.model.fit(cat.interactions.astype(np.float32))
    state.trained_at = time.time()
    print(
        f"[{ENGINE_NAME}] trained in {state.trained_at - t0:.1f}s "
        f"(model={MODEL}, factors={FACTORS}, iterations={ITERATIONS})",
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

    item_idxs = restrict_indices(ctx.candidatePool, cat.item_id_to_idx, len(cat.item_idx_to_id))
    if item_idxs.size == 0:
        return _empty(ctx, start, "no candidates after pool filter")

    # store_items surface: item-to-item neighbors of the most recent ordered item
    if ctx.surface == "store_items":
        anchor_idx: int | None = None
        if ctx.recentOrderIds:
            for oid in ctx.recentOrderIds:
                if oid in cat.item_id_to_idx:
                    anchor_idx = cat.item_id_to_idx[oid]
                    break
        if anchor_idx is None:
            anchor_idx = int(np.argmax(cat.popularity))
        nn_ids, nn_scores = model.similar_items(anchor_idx, N=max(ctx.k * 4, 20))
        # filter to allowed pool, then top-k
        allow = set(item_idxs.tolist())
        picked: list[tuple[int, float]] = [
            (int(i), float(s)) for i, s in zip(nn_ids, nn_scores) if int(i) in allow
        ][: ctx.k]
        items = [
            RecoItem(id=cat.item_idx_to_id[i], score=s, kind="item")
            for i, s in picked
        ]
        return RecommendationResponse(
            items=items,
            engine=ENGINE_NAME,
            version=VERSION,
            latencyMs=(time.perf_counter() - start) * 1000.0,
            debug={"mode": "item-to-item", "anchor_idx": anchor_idx},
        )

    # home_feed / search: user-personalized, 10mi radius filter
    dists = haversine_miles(ctx.lat, ctx.lng, cat.item_lat[item_idxs], cat.item_lng[item_idxs])
    keep = dists <= DISTANCE_FILTER_MI
    item_idxs = item_idxs[keep]
    if item_idxs.size == 0:
        return _empty(ctx, start, "no candidates within radius")

    user_idx = cat.user_id_to_idx.get(ctx.userId or "")
    debug: dict = {}
    if user_idx is None:
        scores = cat.popularity[item_idxs]
        debug["fallback"] = "popularity (unknown user)"
    else:
        # implicit's `recommend()` returns its own top-k from the *whole* catalog;
        # we want scores over a custom subset, so use `user_factors @ item_factors.T`
        # directly via the model's internal vectors.
        uf = model.user_factors[user_idx]
        ifac = model.item_factors[item_idxs]
        scores = ifac @ uf
        debug["fallback"] = False

    top = np.argsort(-scores)[: ctx.k]
    ranked_idxs = item_idxs[top]
    ranked_scores = scores[top]

    items = [
        RecoItem(
            id=cat.item_idx_to_id[int(i)],
            score=float(s),
            kind="restaurant",
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
            "model": MODEL,
            "factors": FACTORS,
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
