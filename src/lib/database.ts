import type { DB } from '../kysely-types';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect, Transaction } from 'kysely';

export type Tx = Transaction<DB>;
export const database = new SQLite('data/data.db');
const dialect = new SqliteDialect({ database });
export const db = new Kysely<DB>({ dialect });

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      username TEXT NOT NULL,
      device_token TEXT NOT NULL UNIQUE,
      gps_lat REAL CHECK(gps_lat IS NULL OR (gps_lat BETWEEN -90 AND 90)),
      gps_lng REAL CHECK(gps_lng IS NULL OR (gps_lng BETWEEN -180 AND 180)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
      code TEXT UNIQUE NOT NULL PRIMARY KEY,
      gps_lat REAL NOT NULL CHECK(gps_lat BETWEEN -90 AND 90),
      gps_lng REAL NOT NULL CHECK(gps_lng BETWEEN -180 AND 180),
      owner_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      session_code TEXT NOT NULL,
      name TEXT NOT NULL,
      gps_lat REAL CHECK(gps_lat IS NULL OR (gps_lat BETWEEN -90 AND 90)),
      gps_lng REAL CHECK(gps_lng IS NULL OR (gps_lng BETWEEN -180 AND 180)),
      rating REAL CHECK(rating IS NULL OR rating >= 0 AND rating <= 5),
      cuisine TEXT,
      website TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_code) REFERENCES sessions(code) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rounds (
      round INTEGER NOT NULL,
      session_code TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (round, session_code),
      FOREIGN KEY (session_code) REFERENCES sessions(code) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id INTEGER NOT NULL,
      option_id INTEGER NOT NULL,
      round_id INTEGER NOT NULL,
      session_code TEXT NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
      FOREIGN KEY (round_id, session_code) REFERENCES rounds(round, session_code) ON DELETE CASCADE,
      UNIQUE(user_id, round_id, session_code)
  );

  CREATE TABLE IF NOT EXISTS session_players (
      session_code TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (session_code, user_id),
      FOREIGN KEY (session_code) REFERENCES sessions(code) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
 
  INSERT OR IGNORE INTO users (id, username, device_token, gps_lat, gps_lng, created_at)
  VALUES
      (1, 'one',   'dev-token-1', 12.8456, -78.7012, '2025-09-06T15:00:00.088'),
      (2, 'two',   'dev-token-2', 12.2456, -78.3012, '2025-09-06T15:00:00.088'),
      (3, 'three', 'dev-token-3', 12.8456, -78.9012, '2025-09-06T15:00:00.088');

  INSERT OR IGNORE INTO sessions (code, gps_lat, gps_lng, owner_id, created_at)
  VALUES
      ('DEMO', 12.8456, -78.7012, 1, '2025-09-06T15:00:00.088');

  INSERT OR IGNORE INTO options (name, rating, gps_lat, gps_lng, cuisine, description, session_code)
  VALUES
      ('la belle', 4.62, 12.1456, -78.7812, 'Brunch', 'Nice place for expensive mimosas', 'DEMO'),
      ('The Farmery', 4.38, 13.1156, -78.1812, 'Farm to Table', 'Fancy burgers and fancier fries', 'DEMO'),
      ('another', 4.38, 13.1156, -78.1812, 'Farm to Table', 'Fancy burgers and fancier fries', 'DEMO'),
      ('more', 4.38, 13.1156, -78.1812, 'Farm to Table', 'Fancy burgers and fancier fries', 'DEMO'),
      ('Bleuu', 4.10, 12.839, -78.1102, 'Wine Bar', 'yeah i''m sure you know what this pairs with', 'DEMO');
`);
