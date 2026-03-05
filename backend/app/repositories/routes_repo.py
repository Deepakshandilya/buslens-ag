from sqlalchemy import text 
from sqlalchemy.orm import Session

def find_route_matches(db: Session, from_stop: str, to_stop: str,limit: int = 20) -> list[dict]:
    """
    Find routes where both stops exits AND from_sequence < to_sequence.
    Returns route_number, direction, from_sequence, to_sequence
    """

    sql = text("""
        SELECT 
            r.route_number,
            r.direction,
            rs_from.sequence_no AS from_sequence,
            rs_to.sequence_no AS to_sequence,
            r.id AS route_id
        FROM routes r 
        JOIN stops s_from ON s_from.name = :from_stop
        JOIN stops s_to   ON s_to.name   = :to_stop
        JOIN route_stops rs_from ON rs_from.route_id = r.id AND rs_from.stop_id = s_from.id 
        JOIN route_stops rs_to   ON rs_to.route_id   = r.id AND rs_to.stop_id   = s_to.id
        WHERE rs_from.sequence_no < rs_to.sequence_no
        ORDER BY r.route_number ASC
        LIMIT :limit 
    """)

    rows = db.execute(sql, {"from_stop" : from_stop, "to_stop": to_stop, "limit": limit}).mappings().all()
    return [dict(r) for r in rows]

def get_stops_between(db: Session, route_id: int, from_seq: int, to_seq: int) -> list[str]:
    """
    Optional UX: return stops between from and to (inclusive).
    """
    sql = text("""
        SELECT s.name
        FROM route_stops rs
        JOIN stops s ON s.id = rs.stop_id
        WHERE rs.route_id = :route_id
          AND rs.sequence_no BETWEEN :from_seq AND :to_seq
        ORDER BY rs.sequence_no ASC
    """)
    rows = db.execute(sql, {"route_id": route_id, "from_seq": from_seq, "to_seq": to_seq}).all()
    return [r[0] for r in rows]


def get_route_detail(db: Session, route_number: str, direction: str) -> dict | None:
    """
    Returns route + ordered stop list.
    """
    route_sql = text("""
        SELECT id, route_number, direction
        FROM routes
        WHERE route_number = :route_number AND direction = :direction
        LIMIT 1
    """)
    route = db.execute(route_sql, {"route_number": route_number, "direction": direction}).mappings().first()
    if not route:
        return None

    stops_sql = text("""
        SELECT rs.sequence_no, s.name
        FROM route_stops rs
        JOIN stops s ON s.id = rs.stop_id
        WHERE rs.route_id = :route_id
        ORDER BY rs.sequence_no ASC
    """)
    stops = db.execute(stops_sql, {"route_id": route["id"]}).mappings().all()
    return {
        "route_number": route["route_number"],
        "direction": route["direction"],
        "stops": [{"sequence_no": x["sequence_no"], "name": x["name"]} for x in stops],
    }

def get_routes_for_stop(db: Session, stop_id: int) -> dict | None:
    # stop name
    stop_sql = text("SELECT id, name FROM stops WHERE id = :stop_id LIMIT 1")
    stop = db.execute(stop_sql, {"stop_id": stop_id}).mappings().first()
    if not stop:
        return None

    routes_sql = text("""
        SELECT r.route_number, r.direction, rs.sequence_no
        FROM route_stops rs
        JOIN routes r ON r.id = rs.route_id
        WHERE rs.stop_id = :stop_id
        ORDER BY r.route_number ASC, r.direction ASC
    """)
    rows = db.execute(routes_sql, {"stop_id": stop_id}).mappings().all()

    return {
        "stop_id": stop["id"],
        "stop_name": stop["name"],
        "routes": [
            {
                "route_number": x["route_number"],
                "direction": x["direction"],
                "sequence_no": int(x["sequence_no"]),
            }
            for x in rows
        ],
    }