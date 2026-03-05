from pydantic import BaseModel, Field 

class RouteSearchRequest(BaseModel):
    from_stop: str = Field(min_length=1,max_length=200)
    to_stop: str = Field(min_length=1,max_length=200)

class RouteSearchResult(BaseModel):
    route_number: str
    direction: str #UP or DOWN 
    from_sequence: int 
    to_sequence: int 
    stops_between: list[str] | None = None 

class RouteStop(BaseModel):
    sequence_no: int 
    name: str 

class RouteDetailResponse(BaseModel):
    route_number: str
    direction: str
    stops: list[RouteStop]