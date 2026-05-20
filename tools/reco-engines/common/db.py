"""Thin SQLite reader for the Dashdoor catalog.

Shared by both sidecars. Returns numpy arrays + id mappings so each
engine can build its interaction / feature matrices without rewriting
SQL.

Env:
    LIBSQL_URL — sqlite path, e.g. file:./data/db/dashdoor.db or
                 a bare path like /data/dashdoor.db
"""

from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from typing import Iterable

import numpy as np
import scipy.sparse as sp


@dataclass(frozen=True)
class Catalog:
    """Everything an engine needs to train + serve."""

    # id ↔ index mappings
    user_id_to_idx: dict[str, int]
    item_id_to_idx: dict[str, int]
    user_idx_to_id: list[str]
    item_idx_to_id: list[str]

    # interactions: shape (n_users, n_items), binary (order = 1)
    interactions: sp.csr_matrix

    # optional content features for hybrid engines: shape (n_items, n_features)
    item_features: sp.csr_matrix
    feature_names: list[str]

    # per-item lat/lng for distance filtering at serve time
    item_lat: np.ndarray
    item_lng: np.ndarray

    # popularity prior (sum of interactions per item) — for cold-start fallback
    popularity: np.ndarray


def _resolve_path(url: str) -> str:
    """Accept either libsql-style `file:./path` or bare paths."""
    if url.startswith("file:"):
        return url[len("file:") :]
    return url


def load_catalog(libsql_url: str | None = None) -> Catalog:
    url = libsql_url or os.environ.get("LIBSQL_URL", "file:./data/db/dashdoor.db")
    path = _resolve_path(url)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"sqlite db not found at {path!r} (LIBSQL_URL={url!r})"
        )

    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # --- items: restaurants
    items = cur.execute(
        """
        SELECT r.id, r.cuisine, r.price_range, r.dash_pass, r.latitude, r.longitude,
               (SELECT GROUP_CONCAT(rc.category_name, ',')
                  FROM restaurant_categories rc
                 WHERE rc.restaurant_id = r.id) AS categories
          FROM restaurants r
        """
    ).fetchall()

    item_idx_to_id = [str(row["id"]) for row in items]
    item_id_to_idx = {iid: i for i, iid in enumerate(item_idx_to_id)}
    n_items = len(item_idx_to_id)

    item_lat = np.array([row["latitude"] or 0.0 for row in items], dtype=np.float64)
    item_lng = np.array([row["longitude"] or 0.0 for row in items], dtype=np.float64)

    # --- users
    users = cur.execute("SELECT id FROM users").fetchall()
    user_idx_to_id = [str(row["id"]) for row in users]
    user_id_to_idx = {uid: i for i, uid in enumerate(user_idx_to_id)}
    n_users = len(user_idx_to_id)

    # --- interactions: one row per order
    rows = []
    cols = []
    for row in cur.execute(
        "SELECT user_id, store_id FROM orders WHERE store_id IS NOT NULL"
    ):
        uid, sid = str(row["user_id"]), str(row["store_id"])
        if uid in user_id_to_idx and sid in item_id_to_idx:
            rows.append(user_id_to_idx[uid])
            cols.append(item_id_to_idx[sid])
    data = np.ones(len(rows), dtype=np.float32)
    interactions = sp.coo_matrix(
        (data, (rows, cols)), shape=(n_users, n_items), dtype=np.float32
    ).tocsr()
    # Treat duplicate orders as repeat positives (clip to 1 for binary CF).
    interactions.data = np.minimum(interactions.data, 1.0)

    # --- item features: cuisine, price tier, dashpass, categories
    feature_set: list[str] = []
    feature_idx: dict[str, int] = {}
    feat_rows = []
    feat_cols = []
    for i, row in enumerate(items):
        labels: list[str] = []
        if row["cuisine"]:
            labels.append(f"cuisine:{row['cuisine']}")
        labels.append(f"price:{'$' * int(row['price_range'])}")
        labels.append("dashpass" if row["dash_pass"] else "non-dashpass")
        for cat in (row["categories"] or "").split(","):
            cat = cat.strip()
            if cat:
                labels.append(f"cat:{cat}")
        for lab in labels:
            j = feature_idx.get(lab)
            if j is None:
                j = len(feature_set)
                feature_set.append(lab)
                feature_idx[lab] = j
            feat_rows.append(i)
            feat_cols.append(j)
    feat_data = np.ones(len(feat_rows), dtype=np.float32)
    item_features = sp.coo_matrix(
        (feat_data, (feat_rows, feat_cols)),
        shape=(n_items, len(feature_set)),
        dtype=np.float32,
    ).tocsr()

    popularity = np.asarray(interactions.sum(axis=0)).ravel()

    conn.close()
    return Catalog(
        user_id_to_idx=user_id_to_idx,
        item_id_to_idx=item_id_to_idx,
        user_idx_to_id=user_idx_to_id,
        item_idx_to_id=item_idx_to_id,
        interactions=interactions,
        item_features=item_features,
        feature_names=feature_set,
        item_lat=item_lat,
        item_lng=item_lng,
        popularity=popularity,
    )


def haversine_miles(lat1: float, lng1: float, lat2_arr: np.ndarray, lng2_arr: np.ndarray) -> np.ndarray:
    """Distance from one point to many, in miles. Used for the 10mi filter."""
    R = 3958.7613
    p = np.pi / 180.0
    dlat = (lat2_arr - lat1) * p
    dlng = (lng2_arr - lng1) * p
    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat1 * p) * np.cos(lat2_arr * p) * np.sin(dlng / 2) ** 2
    )
    return 2 * R * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def restrict_indices(
    candidate_pool: Iterable[str] | None,
    item_id_to_idx: dict[str, int],
    n_items: int,
) -> np.ndarray:
    """Return the item-index array we should score; full catalog if no pool."""
    if candidate_pool is None:
        return np.arange(n_items, dtype=np.int64)
    idxs = [item_id_to_idx[i] for i in candidate_pool if i in item_id_to_idx]
    return np.array(idxs, dtype=np.int64)
