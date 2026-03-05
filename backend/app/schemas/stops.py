from pydantic import BaseModel 

class StopOut(BaseModel):
    id: int 
    name: str

class StopsResponse(BaseModel):
    query: str
    results: list[StopOut]
