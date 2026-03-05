from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text 
from app.db.session import get_db

router = APIRouter()

@router.get("/health")
def health():
    return{"status": "ok"}

@router.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "connected"}