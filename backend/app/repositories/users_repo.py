from sqlalchemy import text 
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str) -> dict | None:
    sql = text("SELECT * FROM users WHERE email = :email LIMIT 1")
    row = db.execute(sql, {"email": email}).mappings().first()
    return dict(row) if row else None

def create_user(db: Session, user: UserCreate) -> dict:
    hashed_password = get_password_hash(user.password)
    sql = text("INSERT INTO users (email, hashed_password) VALUES (:email, :hashed_password)")
    db.execute(sql, {"email": user.email, "hashed_password": hashed_password})
    db.commit()
    
    # Return created user
    return get_user_by_email(db, user.email)

def get_user_favorites(db: Session, user_id: int) -> list[dict]:
    sql = text("SELECT * FROM favorites WHERE user_id = :user_id ORDER BY created_at DESC")
    rows = db.execute(sql, {"user_id": user_id}).mappings().all()
    return [dict(r) for r in rows]

def add_user_favorite(db: Session, user_id: int, route_id: int | None, stop_id: int | None):
    # Depending on constraints, either route_id or stop_id is passed
    sql = text("""
        INSERT INTO favorites (user_id, route_id, stop_id) 
        VALUES (:user_id, :route_id, :stop_id)
    """)
    db.execute(sql, {"user_id": user_id, "route_id": route_id, "stop_id": stop_id})
    db.commit()

def delete_user_favorite(db: Session, user_id: int, favorite_id: int):
    sql = text("DELETE FROM favorites WHERE id = :id AND user_id = :user_id")
    db.execute(sql, {"id": favorite_id, "user_id": user_id})
    db.commit()

def get_user_search_history(db: Session, user_id: int) -> list[dict]:
    sql = text("""
        SELECT sh.*, 
               fs.name as from_stop_name, 
               ts.name as to_stop_name
        FROM search_history sh
        LEFT JOIN stops fs ON fs.id = sh.from_stop_id
        LEFT JOIN stops ts ON ts.id = sh.to_stop_id
        WHERE sh.user_id = :user_id 
        ORDER BY sh.searched_at DESC 
        LIMIT 50
    """)
    rows = db.execute(sql, {"user_id": user_id}).mappings().all()
    return [dict(r) for r in rows]

def add_user_search_history(db: Session, user_id: int, from_stop_id: int, to_stop_id: int):
    sql = text("""
        INSERT INTO search_history (user_id, from_stop_id, to_stop_id) 
        VALUES (:user_id, :from_stop_id, :to_stop_id)
    """)
    db.execute(sql, {"user_id": user_id, "from_stop_id": from_stop_id, "to_stop_id": to_stop_id})
    db.commit()

def clear_user_search_history(db: Session, user_id: int):
    sql = text("DELETE FROM search_history WHERE user_id = :user_id")
    db.execute(sql, {"user_id": user_id})
    db.commit()

def clear_user_favorites(db: Session, user_id: int):
    sql = text("DELETE FROM favorites WHERE user_id = :user_id")
    db.execute(sql, {"user_id": user_id})
    db.commit()
