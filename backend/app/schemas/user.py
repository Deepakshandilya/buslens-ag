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
    is_verified: bool
    auth_provider: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class OTPRequest(BaseModel):
    otp: str

class OTPResponse(BaseModel):
    message: str

class FavoriteCreate(BaseModel):
    route_id: Optional[int] = None
    stop_id: Optional[int] = None

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    route_id: Optional[int]
    stop_id: Optional[int]
    route_number: Optional[str] = None
    direction: Optional[str] = None
    stop_name: Optional[str] = None
    created_at: datetime

class HistoryCreate(BaseModel):
    from_stop_id: int
    to_stop_id: int

class HistoryResponse(BaseModel):
    id: int
    user_id: int
    from_stop_id: int
    to_stop_id: int
    from_stop_name: Optional[str] = None
    to_stop_name: Optional[str] = None
    searched_at: datetime
