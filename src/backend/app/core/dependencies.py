from typing import Callable, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_supabase_token, User
import structlog

logger = structlog.get_logger(__name__)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Dependency to get the current authenticated user from the Bearer token.
    """
    token = credentials.credentials
    user = verify_supabase_token(token)
    return user

def require_role(allowed_roles: List[str]) -> Callable:
    """
    Dependency generator for RBAC (Role-Based Access Control).
    Example: Depends(require_role(["mentor", "admin"]))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            logger.warning("auth_failed_rbac", expected=allowed_roles, actual=current_user.role, user_id=current_user.id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"type": "about:blank", "title": "Forbidden", "status": 403, "detail": "RBAC_PERMISSION_DENIED"}
            )
        return current_user
    
    return role_checker
