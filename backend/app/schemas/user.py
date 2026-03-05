from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class FavoriteCreate(BaseModel):
    route_id: Optional[int] = None
    stop_id: Optional[int] = None

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    route_id: Optional[int]
    stop_id: Optional[int]
    created_at: datetime
    # We can also add detailed fields if needed later

class HistoryCreate(BaseModel):
    from_stop_id: int
    to_stop_id: int

class HistoryResponse(BaseModel):
    id: int
    user_id: int
    from_stop_id: int
    to_stop_id: int
    searched_at: datetime
