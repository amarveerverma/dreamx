import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.dependencies import get_current_user
from app.core.security import User

client = TestClient(app)

def override_get_current_user_student():
    return User(
        id="student-uuid",
        email="student@test.com",
        role="student",
        app_metadata={"user_role": "student"},
        user_metadata={}
    )

def override_get_current_user_mentor():
    return User(
        id="mentor-uuid",
        email="mentor@test.com",
        role="mentor",
        app_metadata={"user_role": "mentor"},
        user_metadata={}
    )

def override_get_current_user_admin():
    return User(
        id="admin-uuid",
        email="admin@test.com",
        role="admin",
        app_metadata={"user_role": "admin"},
        user_metadata={}
    )

# Since we don't have endpoints yet, we will test the health endpoint just to ensure test setup works
# In a real scenario, we'd apply this to actual endpoints using `@require_role`

def test_health_check_unauthenticated():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

# When actual endpoints like `/api/v1/mentor/services` are built in Phase 2, 
# we'd test RBAC like this:
#
# def test_mentor_endpoint_as_student():
#     app.dependency_overrides[get_current_user] = override_get_current_user_student
#     response = client.post("/api/v1/mentor/services", json={})
#     assert response.status_code == 403
#     app.dependency_overrides.clear()
