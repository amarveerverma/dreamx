"""
DreamX Mentor Verification Service
Implements Security.md Part 6 verification foundation.
Prevents privilege escalation by restricting verification status transitions.
"""

from typing import Dict, Any

class VerificationService:
    KNOWN_TECH_DOMAINS = ["google.com", "microsoft.com", "amazon.com", "meta.com", "apple.com", "uber.com", "atlassian.com"]
    KNOWN_ACADEMIC_DOMAINS = ["iitd.ac.in", "iitb.ac.in", "iitm.ac.in", "bits-pilani.ac.in", "stanford.edu", "mit.edu"]

    def submit_verification(self, mentor_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transitions mentor verification status to 'pending_review'.
        """
        linkedin_url = payload.get("linkedin_url", "")
        if not linkedin_url or "linkedin.com" not in linkedin_url:
            raise ValueError("Valid LinkedIn profile URL is required for verification.")

        return {
            "mentor_id": mentor_id,
            "status": "pending_review",
            "message": "Verification submitted successfully. Platform review SLA: 24 hours.",
            "sla_hours": 24
        }

    def admin_override_status(self, mentor_id: str, new_status: str, admin_user: Dict[str, Any]) -> Dict[str, Any]:
        """
        Admin-only transition to 'active' or 'rejected'.
        """
        if admin_user.get("role") != "admin":
            raise PermissionError("Only platform administrators may approve or reject mentor verification.")

        if new_status not in ["active", "rejected", "pending_review", "unverified"]:
            raise ValueError(f"Invalid verification status: {new_status}")

        return {
            "mentor_id": mentor_id,
            "verification_status": new_status,
            "is_verified": (new_status == "active")
        }

verification_service = VerificationService()
