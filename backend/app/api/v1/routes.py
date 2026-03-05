from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session 

from app.db.session import get_db
from app.schemas.routes import RouteSearchRequest, RouteSearchResult, RouteDetailResponse
from app.repositories.routes_repo import find_route_matches, get_stops_between, get_route_detail
# from app.services.route_service import normalize_stop_name
from app.services.validation import normalize_stop_name, normalize_direction

router = APIRouter()


@router.post("/routes/search", response_model=list[RouteSearchResult])
def route_search(
    payload: RouteSearchRequest,
    db: Session = Depends(get_db)
):
    from_stop = normalize_stop_name(payload.from_stop)
    to_stop = normalize_stop_name(payload.to_stop)

    if from_stop.lower() == to_stop.lower():
        raise HTTPException(status_code=400, detail="from_stop and to_stop cannot be same")
    
    matches = find_route_matches(db, from_stop, to_stop, limit=30)

    #optional: include stops_between for nicer UI
    results: list[RouteSearchResult] = []
    for m in matches:
        between = get_stops_between(db, m["route_id"], m["from_sequence"], m["to_sequence"])
        results.append(RouteSearchResult(
            route_number=m["route_number"],
            direction=m["direction"],
            from_sequence=int(m["from_sequence"]),
            to_sequence=int(m["to_sequence"]),
            stops_between=between,
        ))
    return results

@router.get("/routes/{route_number}/{direction}", response_model=RouteDetailResponse)
def route_detail(
    route_number: str, 
    direction: str, 
    db: Session = Depends(get_db)
):
    route_number = route_number.strip()
    if not route_number:
        raise HTTPException(status_code=400, detail="route_number cannot be empty")

    try:
        direction = normalize_direction(direction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    data = get_route_detail(db, route_number, direction)
    if not data:
        raise HTTPException(status_code=404, detail="Route not found")

    return data