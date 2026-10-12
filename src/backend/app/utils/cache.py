"""
DreamX Redis / In-Memory Edge Cache Helper
Implements 15-minute TTL caching for catalog and mentor endpoints with tag-based invalidation.
"""

from typing import Any, Optional, Dict
import time

class CatalogCache:
    def __init__(self, default_ttl_seconds: int = 900): # 15 minutes
        self.default_ttl = default_ttl_seconds
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["data"]

    def set(self, key: str, data: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._store[key] = {
            "data": data,
            "expires_at": time.time() + ttl
        }

    def invalidate_prefix(self, prefix: str) -> None:
        keys_to_delete = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_delete:
            del self._store[k]

    def clear(self) -> None:
        self._store.clear()

catalog_cache = CatalogCache()
