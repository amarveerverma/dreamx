import jwt
from typing import Dict, Any, Optional
from pydantic import BaseModel
from fastapi import HTTPException, status
from app.config import settings
import structlog

logger = structlog.get_logger(__name__)

class User(BaseModel):
    id: str
    email: str
    role: str
    app_metadata: Dict[str, Any]
    user_metadata: Dict[str, Any]

def verify_supabase_token(token: str) -> User:
    """
    Verifies a Supabase Gotrue JWT.
    In production, this should verify against the RS256 JWKS endpoint,
    but Supabase also allows HS256 validation using the JWT_SECRET.
    We will use the JWT_SECRET from config for simplicity here, 
    but can be upgraded to PyJWKClient for RS256 if needed.
    """
    try:
        # Supabase signs with HS256 using the JWT_SECRET by default unless configured otherwise.
        # But wait, modern Supabase might use RS256. 
        # Using the HS256 secret is standard for backend validation in Supabase if we have the secret.
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret.get_secret_value(),
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        # Extract app_metadata for roles (e.g. injected via triggers or claims)
        app_metadata = payload.get("app_metadata", {})
        user_role = app_metadata.get("user_role", payload.get("role", "student"))

        return User(
            id=payload.get("sub", ""),
            email=payload.get("email", ""),
            role=user_role,
            app_metadata=app_metadata,
            user_metadata=payload.get("user_metadata", {})
        )
    except jwt.ExpiredSignatureError:
        logger.warning("auth_failed", reason="Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"type": "about:blank", "title": "Unauthorized", "status": 401, "detail": "Token expired"}
        )
    except jwt.InvalidTokenError as e:
        logger.warning("auth_failed", reason="Invalid token", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"type": "about:blank", "title": "Unauthorized", "status": 401, "detail": "Invalid token"}
        )
