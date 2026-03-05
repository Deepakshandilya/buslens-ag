from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.routes_repo import get_routes_for_stop
from app.schemas.stop_routes import StopRoutesResponse

router = APIRouter()

@router.get("/stops/{stop_id}/routes", response_model=StopRoutesResponse)
def stop_routes(stop_id: int, db: Session = Depends(get_db)):
    data = get_routes_for_stop(db, stop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Stop not found")
    return data