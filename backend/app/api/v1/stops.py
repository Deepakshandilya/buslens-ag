from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.stops import StopsResponse, StopOut
from app.repositories.stops_repo import search_stops
from app.services.route_service import normalize_stop_name

router = APIRouter()

@router.get("/stops", response_model=StopsResponse)
def stops(
    query: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = normalize_stop_name(query)
    rows = search_stops(db, q, limit)
    return{
        "query": q,
        "results": [StopOut(**r) for r in rows],
    }
