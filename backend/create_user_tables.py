from app.db.session import engine
from sqlalchemy import text

def create_tables():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL,
              hashed_password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY uq_users_email (email)
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS favorites (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              route_id INT,
              stop_id INT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT chk_favorite_type CHECK ((route_id IS NOT NULL AND stop_id IS NULL) OR (route_id IS NULL AND stop_id IS NOT NULL)),
              CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              CONSTRAINT fk_favorites_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
              CONSTRAINT fk_favorites_stop FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
              UNIQUE KEY uq_user_route (user_id, route_id),
              UNIQUE KEY uq_user_stop (user_id, stop_id)
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS search_history (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              from_stop_id INT NOT NULL,
              to_stop_id INT NOT NULL,
              searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              CONSTRAINT fk_history_from_stop FOREIGN KEY (from_stop_id) REFERENCES stops(id) ON DELETE CASCADE,
              CONSTRAINT fk_history_to_stop FOREIGN KEY (to_stop_id) REFERENCES stops(id) ON DELETE CASCADE
            );
        """))
        
        # Checking for indexes safely is harder in raw MySQL script, but we can try creating them inside a Try-Except because IF NOT EXISTS for indexes only works in MySQL 8.
        try:
            conn.execute(text("CREATE INDEX idx_favorites_user_id ON favorites(user_id);"))
        except Exception:
            pass
            
        try:
            conn.execute(text("CREATE INDEX idx_search_history_user_id ON search_history(user_id);"))
        except Exception:
            pass

        print("Created new tables safely.")

if __name__ == "__main__":
    create_tables()
