from fastapi import FastAPI

from app.core.logging import setup_logging 
from app.core.cors import add_cors

from app.api.v1.health import router as health_router
from app.api.v1.stops import router as stops_router
from app.api.v1.routes import router as routes_router 
from app.api.v1.stop_routes import router as stop_routes_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router

def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title="BusLens API",
        version="1.0.0",
        openapi_url="/openapi.json",
        docs_url="/docs",
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