import json
import os
import glob
from typing import List, Dict, Any, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Use same normalization rule as backend (keep consistent)
def normalize_stop_name(name: str) -> str:
    return " ".join((name or "").strip().split())

def normalize_direction(direction: str) -> str:
    d = (direction or "").strip().upper()
    if d not in {"UP", "DOWN"}:
        raise ValueError(f"Invalid direction: {direction}")
    return d

def load_env():
    load_dotenv()

def get_engine():
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT", "3306"))
    db_name = os.getenv("DB_NAME", "buslens")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "root")

    url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return create_engine(url, pool_pre_ping=True, pool_recycle=3600)

def read_json_files(input_path: str) -> List[Dict[str, Any]]:
    """
    input_path can be:
      - a single json file
      - a folder containing *.json
    """
    if os.path.isdir(input_path):
        files = glob.glob(os.path.join(input_path, "*.json"))
    else:
        files = [input_path]

    data = []
    for f in files:
        with open(f, "r", encoding="utf-8") as fh:
            obj = json.load(fh)
            data.append(obj)
    return data

def validate_route_payload(obj: Dict[str, Any]) -> Tuple[str, str, List[str]]:
    if "route_number" not in obj or not str(obj["route_number"]).strip():
        raise ValueError("Missing route_number")
    if "direction" not in obj:
        raise ValueError("Missing direction")
    if "stops" not in obj or not isinstance(obj["stops"], list) or len(obj["stops"]) < 2:
        raise ValueError("stops must be a list with at least 2 items")

    route_number = str(obj["route_number"]).strip()
    direction = normalize_direction(str(obj["direction"]))
    stops = [normalize_stop_name(s) for s in obj["stops"]]

    # Remove empty stops
    stops = [s for s in stops if s]
    if len(stops) < 2:
        raise ValueError("After normalization, stops has < 2 items")

    # Detect duplicates (same name repeated)
    # Not always wrong, but often indicates dirty data.
    # We’ll warn by raising error to keep dataset clean.
    if len(set(stops)) != len(stops):
        raise ValueError(f"Duplicate stop names found in route {route_number} {direction}")

    return route_number, direction, stops

def upsert_route(db, route_number: str, direction: str) -> int:
    """
    Idempotent: insert if not exists, else fetch.
    """
    # Insert ignore pattern (MySQL)
    db.execute(
        text("""
            INSERT INTO routes (route_number, direction)
            VALUES (:route_number, :direction)
            ON DUPLICATE KEY UPDATE route_number = VALUES(route_number)
        """),
        {"route_number": route_number, "direction": direction},
    )
    route_id = db.execute(
        text("""
            SELECT id FROM routes
            WHERE route_number = :route_number AND direction = :direction
            LIMIT 1
        """),
        {"route_number": route_number, "direction": direction},
    ).scalar_one()
    return int(route_id)

def upsert_stop(db, name: str) -> int:
    db.execute(
        text("""
            INSERT INTO stops (name)
            VALUES (:name)
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        """),
        {"name": name},
    )
    stop_id = db.execute(
        text("SELECT id FROM stops WHERE name = :name LIMIT 1"),
        {"name": name},
    ).scalar_one()
    return int(stop_id)

def upsert_route_stops(db, route_id: int, stops: List[str]) -> None:
    """
    Idempotent and “clean” strategy:
    - Delete existing route_stops for this route_id
    - Reinsert with fresh sequence numbers
    This guarantees the DB matches the source of truth.
    """
    db.execute(text("DELETE FROM route_stops WHERE route_id = :route_id"), {"route_id": route_id})

    for idx, stop_name in enumerate(stops, start=1):
        stop_id = upsert_stop(db, stop_name)
        db.execute(
            text("""
                INSERT INTO route_stops (route_id, stop_id, sequence_no)
                VALUES (:route_id, :stop_id, :sequence_no)
            """),
            {"route_id": route_id, "stop_id": stop_id, "sequence_no": idx},
        )

def main():
    load_env()
    import sys

    if len(sys.argv) < 2:
        print("Usage: python scripts/import_routes.py <path_to_json_file_or_folder>")
        raise SystemExit(1)

    input_path = sys.argv[1]
    engine = get_engine()
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    payloads = read_json_files(input_path)
    print(f"Found {len(payloads)} route files")

    success = 0
    failed = 0

    with Session() as db:
        for obj in payloads:
            try:
                route_number, direction, stops = validate_route_payload(obj)
                route_id = upsert_route(db, route_number, direction)
                upsert_route_stops(db, route_id, stops)
                success += 1
                print(f"✅ Imported {route_number} {direction} stops={len(stops)}")
            except Exception as e:
                failed += 1
                print(f"❌ Failed: {e}")

        db.commit()

    print(f"\nDone. success={success} failed={failed}")

if __name__ == "__main__":
    main()