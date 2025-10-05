import type { DB } from '../kysely-types';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

export const database = new SQLite('data.db');
const dialect = new SqliteDialect({ database });
export const db = new Kysely<DB>({ dialect });

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      hashed_password TEXT NOT NULL,
      gps_lat REAL CHECK(gps_lat IS NULL OR (gps_lat BETWEEN -90 AND 90)),
      gps_lng REAL CHECK(gps_lng IS NULL OR (gps_lng BETWEEN -180 AND 180)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
      uuid TEXT UNIQUE NOT NULL PRIMARY KEY,
      gps_lat REAL NOT NULL CHECK(gps_lat BETWEEN -90 AND 90),
      gps_lng REAL NOT NULL CHECK(gps_lng BETWEEN -180 AND 180),
      owner_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      rating REAL CHECK(rating IS NULL OR rating >= 0 AND rating <= 5),
      gps_lat REAL CHECK(gps_lat IS NULL OR (gps_lat BETWEEN -90 AND 90)),
      gps_lng REAL CHECK(gps_lng IS NULL OR (gps_lng BETWEEN -180 AND 180)),
      genre TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rounds (
      round INTEGER NOT NULL,
      session_uuid TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (round, session_uuid),
      FOREIGN KEY (session_uuid) REFERENCES sessions(uuid) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id INTEGER NOT NULL,
      option_id INTEGER NOT NULL,
      round_id INTEGER NOT NULL,
      session_uuid TEXT NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
      FOREIGN KEY (round_id, session_uuid) REFERENCES rounds(round, session_uuid) ON DELETE CASCADE,
      UNIQUE(user_id, round_id, session_uuid)
  );
 
  INSERT OR IGNORE INTO users (id, username, hashed_password, gps_lat, gps_lng, created_at)
  VALUES
      (1, 'one',   'asdfadsf', 12.8456, -78.7012, '2025-09-06T15:00:00.088'),
      (2, 'two',   'asdfadsf', 12.2456, -78.3012, '2025-09-06T15:00:00.088'),
      (3, 'three', 'asdfadsf', 12.8456, -78.9012, '2025-09-06T15:00:00.088');

  INSERT OR IGNORE INTO sessions (uuid, gps_lat, gps_lng, owner_id)
  VALUES
      ('b941d622-5c5f-4cc6-8e23-1d84049dc410', 12.456, -78.012, 1);

  INSERT OR IGNORE INTO options (name, rating, gps_lat, gps_lng, genre, description)
  VALUES
      ('la belle', 4.62, 12.1456, -78.7812, 'Brunch', 'Nice place for expensive mimosas'),
      ('The Farmery', 4.38, 13.1156, -78.1812, 'Farm to Table', 'Fancy burgers and fancier fries'),
      ('Bleuu', 4.10, 12.839, -78.1102, 'Wine Bar', 'yeah i''m sure you know what this pairs with');
`);
