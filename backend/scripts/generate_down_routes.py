#!/usr/bin/env python3
"""
Generate DOWN direction routes by mirroring UP routes (reversed stop order).

Run after importing route data that only contains UP directions:

  DB_PATH=/var/lib/buslens/buslens.db python scripts/generate_down_routes.py
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

GENERATE_DOWN_ROUTES_SQL = """
INSERT INTO routes (route_number, direction)
SELECT route_number, 'DOWN'
FROM routes
WHERE direction = 'UP'
  AND NOT EXISTS (
    SELECT 1 FROM routes r2
    WHERE r2.route_number = routes.route_number
      AND r2.direction = 'DOWN'
  );
"""

GENERATE_DOWN_ROUTE_STOPS_SQL = """
INSERT INTO route_stops (route_id, stop_id, sequence_no)
SELECT
    r_down.id,
    rs.stop_id,
    (max_seq.max_sequence - rs.sequence_no + 1) AS sequence_no
FROM routes r_up
JOIN routes r_down
    ON r_up.route_number = r_down.route_number
JOIN route_stops rs
    ON rs.route_id = r_up.id
JOIN (
    SELECT route_id, MAX(sequence_no) AS max_sequence
    FROM route_stops
    GROUP BY route_id
) max_seq
    ON max_seq.route_id = r_up.id
WHERE r_up.direction = 'UP'
  AND r_down.direction = 'DOWN'
  AND NOT EXISTS (
    SELECT 1 FROM route_stops existing
    WHERE existing.route_id = r_down.id
  );
"""


def main() -> None:
    load_dotenv()
    db_path = os.getenv("DB_PATH", "buslens.db")
    if not Path(db_path).exists():
        print(f"Database not found: {db_path}")
        sys.exit(1)

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )

    with engine.begin() as conn:
        before = conn.execute(
            text("SELECT direction, COUNT(*) AS n FROM routes GROUP BY direction")
        ).mappings().all()
        print("Before:", {row["direction"]: row["n"] for row in before})

        conn.execute(text(GENERATE_DOWN_ROUTES_SQL))
        conn.execute(text(GENERATE_DOWN_ROUTE_STOPS_SQL))

        after = conn.execute(
            text("SELECT direction, COUNT(*) AS n FROM routes GROUP BY direction")
        ).mappings().all()
        print("After:", {row["direction"]: row["n"] for row in after})

        route_stops = conn.execute(text("SELECT COUNT(*) FROM route_stops")).scalar_one()
        print(f"route_stops: {route_stops}")


if __name__ == "__main__":
    main()
