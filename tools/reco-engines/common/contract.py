"""Pydantic models mirroring lib/reco/types.ts.

Single source of truth for sidecars (lightfm, implicit). If the TS
contract changes, update this file and bump version strings in each
sidecar's app.py.

Reference: docs/reco-http-contract.md
"""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

Surface = Literal["home_feed", "home_promo", "search", "store_items"]
ItemKind = Literal["restaurant", "item"]


class RecoContext(BaseModel):
    """Request body for POST /recommend."""

    userId: Optional[str] = None
    lat: float
    lng: float
    surface: Surface
    candidatePool: Optional[list[str]] = None
    k: int = Field(ge=1)
    now: Optional[str] = None
    recentOrderIds: Optional[list[str]] = None


class RecoItem(BaseModel):
    id: str
    score: float
    kind: ItemKind
    meta: Optional[dict[str, Any]] = None


class RecommendationResponse(BaseModel):
    items: list[RecoItem]
    engine: str
    version: str
    latencyMs: float
    debug: Optional[dict[str, Any]] = None
