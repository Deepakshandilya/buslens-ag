from sqlalchemy import text 
from sqlalchemy.orm import Session

def search_stops(db: Session ,query: str, limit: int) -> list[dict]:
    """
    Returns list of {id,name}.
    Simple LIKE search.
    - (In Postgres we use , ILIKE)
    - MySQL LIKE is case-insensitive depending on collation.
    """

    sql = text("""
        SELECT id,name 
        FROM stops
        WHERE name LIKE :q
        ORDER BY name ASC
        LIMIT :limit
    """)

    rows = db.execute(sql, {"q": f"{query}%", "limit": limit}).mappings().all()
    return [dict(r) for r in rows]