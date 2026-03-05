from pydantic import BaseModel

class StopRouteItem(BaseModel):
    route_number: str
    direction: str
    sequence_no: int

class StopRoutesResponse(BaseModel):
    stop_id: int
    stop_name: str
    routes: list[StopRouteItem]