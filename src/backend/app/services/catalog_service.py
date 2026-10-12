"""
DreamX Catalog Service
Encapsulates mentor listing, service catalog queries, and 5-active-services rule validation.
"""

from typing import List, Dict, Any, Optional

MAX_ACTIVE_SERVICES_PER_MENTOR = 5

class CatalogService:
    def __init__(self):
        pass

    def validate_mentor_service_limit(self, current_active_count: int, is_new_service_active: bool = True) -> bool:
        """
        Enforces Database.md Part 5.3 and PRD §3.A rule:
        A mentor can list a maximum of 5 active services simultaneously.
        """
        if is_new_service_active and current_active_count >= MAX_ACTIVE_SERVICES_PER_MENTOR:
            raise ValueError(
                "MENTOR_SERVICE_LIMIT_EXCEEDED: A mentor can list a maximum of 5 active services simultaneously."
            )
        return True

    def format_mentor_response(self, mentor: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": mentor.get("id"),
            "public_slug": mentor.get("public_slug"),
            "full_name": mentor.get("full_name"),
            "headline": mentor.get("headline"),
            "avatar_url": mentor.get("avatar_url"),
            "years_experience": mentor.get("years_experience", 0),
            "is_verified": mentor.get("is_verified", False),
            "rolling_rating": mentor.get("rolling_rating", 5.0),
            "total_reviews": mentor.get("total_reviews", 0),
            "starting_price_inr": mentor.get("starting_price_inr", 999.0),
            "top_companies": mentor.get("top_companies", []),
            "served_markets": mentor.get("served_markets", ["CM-IN"])
        }

catalog_service = CatalogService()
