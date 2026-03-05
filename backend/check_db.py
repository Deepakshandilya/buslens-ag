from app.db.session import engine
from sqlalchemy import text

def check_tables():
    with engine.connect() as conn:
        result = conn.execute(text("SHOW TABLES;"))
        tables = [row[0] for row in result]
        print("Tables in DB:", tables)

if __name__ == "__main__":
    check_tables()
