from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import structlog
import sentry_sdk
from app.config import settings

# Initialize Structlog (Minimal placeholder)
structlog.configure(
    processors=[structlog.processors.JSONRenderer()]
)
logger = structlog.get_logger()

# Initialize Sentry
sentry_sdk.init(
    dsn=settings.sentry_dsn,
    environment=settings.environment,
    traces_sample_rate=1.0,
)

app = FastAPI(
    title="DreamX API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

@app.get("/api/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "ok", "environment": settings.environment}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler converting to RFC 7807 JSON errors."""
    logger.error("unhandled_exception", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "type": "about:blank",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred."
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=(settings.environment == "development"))
