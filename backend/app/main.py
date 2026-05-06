import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.logging import setup_logging 
from app.core.cors import add_cors

from app.api.v1.health import router as health_router
from app.api.v1.stops import router as stops_router
from app.api.v1.routes import router as routes_router 
from app.api.v1.stop_routes import router as stop_routes_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router

logger = logging.getLogger(__name__)


async def _otp_cleanup_loop():
    """
    Background task: deletes used/expired OTP rows once every 30 days.
    Runs immediately on startup, then every 30 days.
    """
    from app.db.session import SessionLocal
    from app.repositories.otp_repo import cleanup_expired_otps

    while True:
        try:
            db = SessionLocal()
            try:
                deleted = cleanup_expired_otps(db)
                if deleted:
                    logger.info("OTP cleanup: removed %d expired/used rows", deleted)
            finally:
                db.close()
        except Exception as e:
            logger.warning("OTP cleanup failed (will retry next cycle): %s", e)

        # Sleep 30 days
        await asyncio.sleep(30 * 24 * 60 * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifespan: starts background cleanup task on boot, cancels on shutdown."""
    task = asyncio.create_task(_otp_cleanup_loop())
    yield
    task.cancel()


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title="BusLens API",
        version="1.0.0",
        openapi_url="/openapi.json",
        docs_url="/docs",
        lifespan=lifespan,
    )

    add_cors(app)

    # v1 router
    app.include_router(health_router, prefix="/v1", tags=["health"])
    app.include_router(stops_router, prefix="/v1", tags=["stops"])
    app.include_router(routes_router, prefix="/v1", tags=["routes"])
    app.include_router(stop_routes_router, prefix="/v1", tags=["stops-to-routes"])
    app.include_router(auth_router, prefix="/v1/auth", tags=["auth"])
    app.include_router(users_router, prefix="/v1/users", tags=["users"])

    return app


app = create_app()