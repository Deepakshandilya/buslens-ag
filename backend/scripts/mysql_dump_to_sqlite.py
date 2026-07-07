#!/usr/bin/env python3
"""
Import data from a MySQL mysqldump into an existing SQLite database.

Prerequisites:
  1. Create the SQLite schema first:
       sqlite3 /var/lib/buslens/buslens.db < migrations/schema.sqlite.sql
  2. Export data-only from MySQL (recommended):
       mysqldump --no-create-info --complete-insert --skip-extended-insert buslens > data_only.sql

Usage:
  python scripts/mysql_dump_to_sqlite.py data_only.sql
  DB_PATH=/var/lib/buslens/buslens.db python scripts/mysql_dump_to_sqlite.py data_only.sql
"""

import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

SKIP_PATTERNS = (
    r"^/\*!",
    r"^--",
    r"^SET ",
    r"^LOCK TABLES",
    r"^UNLOCK TABLES",
    r"^USE ",
    r"^CREATE ",
    r"^DROP ",
    r"^ALTER ",
)

INSERT_RE = re.compile(
    r"^INSERT\s+INTO\s+`?(\w+)`?\s*(?:\(([^)]+)\))?\s*VALUES\s*(.+);?\s*$",
    re.IGNORECASE | re.DOTALL,
)

TABLE_INSERT_ORDER = (
    "stops",
    "routes",
    "route_stops",
    "users",
    "favorites",
    "search_history",
    "otp_codes",
)


def apply_schema(db_path: str, schema_path: Path | None = None) -> None:
    if schema_path is None:
        schema_path = Path(__file__).resolve().parents[1] / "migrations" / "schema.sqlite.sql"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    sql = schema_path.read_text(encoding="utf-8")
    stmts = [s.strip() for s in sql.split(";") if s.strip()]
    with engine.begin() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))


def rewrite_insert(stmt: str) -> str:
    """Normalize legacy MySQL INSERT statements for the current SQLite schema."""
    match = INSERT_RE.match(stmt)
    if not match:
        return stmt

    table = match.group(1).lower()
    columns = match.group(2)
    values = match.group(3).rstrip().rstrip(";")

    if table == "users" and not columns:
        return (
            "INSERT INTO users (id, email, hashed_password, created_at) "
            f"VALUES {values};"
        )
    if table == "route_stops" and not columns:
        return (
            "INSERT INTO route_stops (route_id, stop_id, sequence_no) "
            f"VALUES {values};"
        )
    if table == "routes" and not columns:
        return (
            "INSERT INTO routes (id, route_number, direction) "
            f"VALUES {values};"
        )
    if table == "stops" and not columns:
        return f"INSERT INTO stops (id, name) VALUES {values};"

    return stmt


def normalize_statement(stmt: str) -> str | None:
    stmt = stmt.strip()
    if not stmt:
        return None
    for pattern in SKIP_PATTERNS:
        if re.match(pattern, stmt, re.IGNORECASE):
            return None
    stmt = stmt.replace("`", "")
    stmt = re.sub(r"\bTRUE\b", "1", stmt, flags=re.IGNORECASE)
    stmt = re.sub(r"\bFALSE\b", "0", stmt, flags=re.IGNORECASE)
    if not stmt.rstrip().endswith(";"):
        stmt = stmt.rstrip() + ";"
    return stmt


def split_dump(content: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    for line in content.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        current.append(line)
        if stripped.endswith(";"):
            statements.append("\n".join(current))
            current = []
    if current:
        statements.append("\n".join(current))
    return statements


def get_engine():
    load_dotenv()
    db_path = os.getenv("DB_PATH", "buslens.db")
    url = f"sqlite:///{db_path}"
    return create_engine(url, connect_args={"check_same_thread": False})


def import_dump(dump_path: Path, db_path: str) -> tuple[int, int]:
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    content = dump_path.read_text(encoding="utf-8", errors="replace")
    raw_statements = split_dump(content)

    inserts_by_table: dict[str, list[str]] = {t: [] for t in TABLE_INSERT_ORDER}
    skipped = 0

    for raw in raw_statements:
        stmt = normalize_statement(raw)
        if not stmt:
            skipped += 1
            continue
        if not stmt.upper().startswith("INSERT"):
            skipped += 1
            continue
        stmt = rewrite_insert(stmt)
        match = INSERT_RE.match(stmt)
        table = match.group(1).lower() if match else ""
        if table in inserts_by_table:
            inserts_by_table[table].append(stmt)
        else:
            skipped += 1

    executed = 0
    with engine.begin() as conn:
        conn.execute(text("PRAGMA foreign_keys=OFF"))
        for table in TABLE_INSERT_ORDER:
            for stmt in inserts_by_table[table]:
                try:
                    conn.execute(text(stmt))
                    executed += 1
                except Exception as e:
                    print(f"Failed on table {table}: {stmt[:120]}...")
                    raise RuntimeError(f"Import failed: {e}") from e
        conn.execute(text("PRAGMA foreign_keys=ON"))
        conn.execute(
            text(
                "UPDATE users SET is_verified = 1 "
                "WHERE hashed_password IS NOT NULL AND is_verified = 0"
            )
        )

    return executed, skipped


def print_counts(db_path: str) -> None:
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    tables = ("stops", "routes", "route_stops", "users", "favorites", "search_history", "otp_codes")
    with engine.connect() as conn:
        for table in tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
            print(f"  {table}: {count}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/mysql_dump_to_sqlite.py <mysql_dump.sql>")
        raise SystemExit(1)

    load_dotenv()
    dump_path = Path(sys.argv[1])
    if not dump_path.exists():
        print(f"File not found: {dump_path}")
        raise SystemExit(1)

    db_path = os.getenv("DB_PATH", "buslens.db")
    print(f"Creating schema in SQLite: {db_path}")
    apply_schema(db_path)
    print(f"Importing dump: {dump_path}")
    executed, skipped = import_dump(dump_path, db_path)
    print(f"Done. executed={executed} skipped={skipped}")
    print("Row counts:")
    print_counts(db_path)


if __name__ == "__main__":
    main()
