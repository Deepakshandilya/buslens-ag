from sqlalchemy import text 
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str) -> dict | None:
    try:
        sql = text("SELECT * FROM users WHERE email = :email LIMIT 1")
        row = db.execute(sql, {"email": email}).mappings().first()
        return dict(row) if row else None
    except SQLAlchemyError as e:
        raise ValueError("Database error while retrieving user by email") from e

def create_user(db: Session, user: UserCreate) -> dict:
    try:
        hashed_password = get_password_hash(user.password)
        sql = text("INSERT INTO users (email, hashed_password, is_verified, auth_provider) VALUES (:email, :hashed_password, FALSE, 'local')")
        db.execute(sql, {"email": user.email, "hashed_password": hashed_password})
        db.commit()
        
        # Return created user
        return get_user_by_email(db, user.email)
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while creating user") from e

def get_user_by_google_id(db: Session, google_id: str) -> dict | None:
    try:
        sql = text("SELECT * FROM users WHERE google_id = :gid LIMIT 1")
        row = db.execute(sql, {"gid": google_id}).mappings().first()
        return dict(row) if row else None
    except SQLAlchemyError as e:
        raise ValueError("Database error while retrieving user by Google ID") from e

def create_google_user(db: Session, email: str, google_id: str) -> dict:
    try:
        sql = text(
            "INSERT INTO users (email, hashed_password, is_verified, auth_provider, google_id) "
            "VALUES (:email, NULL, TRUE, 'google', :gid)"
        )
        db.execute(sql, {"email": email, "gid": google_id})
        db.commit()
        return get_user_by_email(db, email)
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while creating Google user") from e

def link_google_to_user(db: Session, user_id: int, google_id: str) -> None:
    try:
        sql = text("UPDATE users SET google_id = :gid, is_verified = TRUE WHERE id = :uid")
        db.execute(sql, {"gid": google_id, "uid": user_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while linking Google account") from e

def get_user_favorites(db: Session, user_id: int) -> list[dict]:
    try:
        sql = text("""
            SELECT f.*, 
                   r.route_number, 
                   r.direction,
                   s.name as stop_name
            FROM favorites f
            LEFT JOIN routes r ON r.id = f.route_id
            LEFT JOIN stops s ON s.id = f.stop_id
            WHERE f.user_id = :user_id 
            ORDER BY f.created_at DESC
        """)
        rows = db.execute(sql, {"user_id": user_id}).mappings().all()
        return [dict(r) for r in rows]
    except SQLAlchemyError as e:
        raise ValueError("Database error while retrieving user favorites") from e

def add_user_favorite(db: Session, user_id: int, route_id: int | None, stop_id: int | None):
    try:
        # Depending on constraints, either route_id or stop_id is passed
        sql = text("""
            INSERT INTO favorites (user_id, route_id, stop_id) 
            VALUES (:user_id, :route_id, :stop_id)
        """)
        db.execute(sql, {"user_id": user_id, "route_id": route_id, "stop_id": stop_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while adding user favorite") from e

def delete_user_favorite(db: Session, user_id: int, favorite_id: int):
    try:
        sql = text("DELETE FROM favorites WHERE id = :id AND user_id = :user_id")
        db.execute(sql, {"id": favorite_id, "user_id": user_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while deleting user favorite") from e

def get_user_search_history(db: Session, user_id: int) -> list[dict]:
    try:
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
    except SQLAlchemyError as e:
        raise ValueError("Database error while retrieving user search history") from e

def add_user_search_history(db: Session, user_id: int, from_stop_id: int, to_stop_id: int):
    try:
        sql = text("""
            INSERT INTO search_history (user_id, from_stop_id, to_stop_id) 
            VALUES (:user_id, :from_stop_id, :to_stop_id)
        """)
        db.execute(sql, {"user_id": user_id, "from_stop_id": from_stop_id, "to_stop_id": to_stop_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while adding user search history") from e

def clear_user_search_history(db: Session, user_id: int):
    try:
        sql = text("DELETE FROM search_history WHERE user_id = :user_id")
        db.execute(sql, {"user_id": user_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while clearing user search history") from e

def clear_user_favorites(db: Session, user_id: int):
    try:
        sql = text("DELETE FROM favorites WHERE user_id = :user_id")
        db.execute(sql, {"user_id": user_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while clearing user favorites") from e

def delete_user(db: Session, user_id: int) -> None:
    """
    Delete a user and all associated data.
    Clears: favorites, search_history, otp_codes, then the user record.
    """
    try:
        db.execute(text("DELETE FROM favorites WHERE user_id = :uid"), {"uid": user_id})
        db.execute(text("DELETE FROM search_history WHERE user_id = :uid"), {"uid": user_id})
        db.execute(text("DELETE FROM otp_codes WHERE user_id = :uid"), {"uid": user_id})
        db.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while deleting user account") from e

def update_user_password(db: Session, user_id: int, new_hashed_password: str) -> None:
    """Update a user's password hash."""
    try:
        sql = text("UPDATE users SET hashed_password = :pwd WHERE id = :uid")
        db.execute(sql, {"pwd": new_hashed_password, "uid": user_id})
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while updating password") from e
