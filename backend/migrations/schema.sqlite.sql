PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS search_history;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS route_stops;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS users;

CREATE TABLE stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('UP', 'DOWN')),
  UNIQUE (route_number, direction)
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  hashed_password TEXT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0, 1)),
  auth_provider TEXT NOT NULL DEFAULT 'local' CHECK(auth_provider IN ('local', 'google')),
  google_id TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_stops (
  route_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  sequence_no INTEGER NOT NULL,

  PRIMARY KEY (route_id, stop_id),
  UNIQUE (route_id, sequence_no),

  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  route_id INTEGER,
  stop_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK ((route_id IS NOT NULL AND stop_id IS NULL) OR (route_id IS NULL AND stop_id IS NOT NULL)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
  UNIQUE (user_id, route_id),
  UNIQUE (user_id, stop_id)
);

CREATE TABLE search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_stop_id INTEGER NOT NULL,
  to_stop_id INTEGER NOT NULL,
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_stop_id) REFERENCES stops(id) ON DELETE CASCADE,
  FOREIGN KEY (to_stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'email_verify' CHECK(purpose IN ('email_verify', 'password_reset')),
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0 CHECK(used IN (0, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_stops_name ON stops(name);
CREATE INDEX idx_route_stops_stop_id ON route_stops(stop_id);
CREATE INDEX idx_route_stops_route_seq ON route_stops(route_id, sequence_no);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_otp_user_purpose ON otp_codes(user_id, purpose, used);
