DROP TABLE IF EXISTS search_history;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS route_stops;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS users;

CREATE TABLE stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_stops_name (name)
);

CREATE TABLE routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_number VARCHAR(50) NOT NULL,
  direction ENUM('UP','DOWN') NOT NULL,
  UNIQUE KEY uq_route_number_direction (route_number, direction)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE route_stops (
  route_id INT NOT NULL,
  stop_id INT NOT NULL,
  sequence_no INT NOT NULL,

  PRIMARY KEY (route_id, stop_id),
  UNIQUE KEY uq_route_sequence (route_id, sequence_no),

  CONSTRAINT fk_route_stops_route
    FOREIGN KEY (route_id) REFERENCES routes(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_route_stops_stop
    FOREIGN KEY (stop_id) REFERENCES stops(id)
    ON DELETE CASCADE
);

CREATE TABLE favorites (
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

CREATE TABLE search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  from_stop_id INT NOT NULL,
  to_stop_id INT NOT NULL,
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_from_stop FOREIGN KEY (from_stop_id) REFERENCES stops(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_to_stop FOREIGN KEY (to_stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE INDEX idx_stops_name ON stops(name);
CREATE INDEX idx_route_stops_stop_id ON route_stops(stop_id);
CREATE INDEX idx_route_stops_route_seq ON route_stops(route_id, sequence_no);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);