from app.db.session import SessionLocal
from app.repositories.users_repo import get_user_by_email, create_user
from app.schemas.user import UserCreate
import traceback

def test_db():
    db = SessionLocal()
    try:
        user = get_user_by_email(db, "test3@example.com")
        print("Exists?:", user)
        
        user_in = UserCreate(email="test3@example.com", password="password")
        new_user = create_user(db, user_in)
        print("Created:", new_user)
    except Exception as e:
        print("Error in DB test:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
