-- SpeedX Test Results Schema
CREATE TABLE IF NOT EXISTS speed_tests (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  ip TEXT,
  client_country TEXT,
  client_city TEXT,
  client_isp TEXT,
  server_colo TEXT,
  server_location TEXT,
  download_speed REAL NOT NULL,
  upload_speed REAL NOT NULL,
  ping REAL NOT NULL,
  jitter REAL NOT NULL,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_speed_tests_timestamp ON speed_tests(timestamp DESC);
