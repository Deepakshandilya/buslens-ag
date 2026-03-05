from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def add_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET","POST","PUT","DELETE","OPTIONS"],
        allow_headers=["*"],
    )