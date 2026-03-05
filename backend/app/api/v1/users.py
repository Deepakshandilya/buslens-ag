from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import FavoriteCreate, FavoriteResponse, HistoryCreate, HistoryResponse, UserResponse
from app.repositories import users_repo

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/me/favorites", response_model=list[FavoriteResponse])
def get_favorites(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return users_repo.get_user_favorites(db, current_user["id"])

@router.post("/me/favorites", status_code=201)
def add_favorite(
    favorite_in: FavoriteCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    if not favorite_in.route_id and not favorite_in.stop_id:
        raise HTTPException(status_code=400, detail="Must provide either route_id or stop_id")
    if favorite_in.route_id and favorite_in.stop_id:
        raise HTTPException(status_code=400, detail="Cannot provide both route_id and stop_id")
        
    users_repo.add_user_favorite(db, current_user["id"], favorite_in.route_id, favorite_in.stop_id)
    return {"message": "Favorite added"}

@router.delete("/me/favorites/{favorite_id}", status_code=200)
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    users_repo.delete_user_favorite(db, current_user["id"], favorite_id)
    return {"message": "Favorite deleted"}

@router.get("/me/history", response_model=list[HistoryResponse])
def get_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return users_repo.get_user_search_history(db, current_user["id"])

@router.post("/me/history", status_code=201)
def add_history(
    history_in: HistoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    users_repo.add_user_search_history(
        db, 
        current_user["id"], 
        history_in.from_stop_id, 
        history_in.to_stop_id
    )
    return {"message": "History added"}
