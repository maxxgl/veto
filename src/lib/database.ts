import type { DB } from '../kysely-types'; // this is the Database interface we defined earlier
import { NODE_ENV } from '$env/static/private';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

const database = new SQLite(NODE_ENV === 'development' ? 'data.db' : ':memory:');
const dialect = new SqliteDialect({ database });
export const db = new Kysely<DB>({ dialect });

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gps_lat REAL CHECK(gps_lat IS NULL OR (gps_lat BETWEEN -90 AND 90)),
      gps_lng REAL CHECK(gps_lng IS NULL OR (gps_lng BETWEEN -180 AND 180)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid_code TEXT UNIQUE NOT NULL,
      gps_lat REAL NOT NULL CHECK(gps_lat BETWEEN -90 AND 90),
      gps_lng REAL NOT NULL CHECK(gps_lng BETWEEN -180 AND 180),
      owner_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES players(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating REAL CHECK(rating IS NULL OR rating >= 0),
      gps_lat REAL CHECK(gps_lat IS NULL OR (gps_lat BETWEEN -90 AND 90)),
      gps_lng REAL CHECK(gps_lng IS NULL OR (gps_lng BETWEEN -180 AND 180)),
      genre TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      UNIQUE(session_id, round_number)
  );

  CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      option_id INTEGER NOT NULL,
      round_id INTEGER NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
      FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
      UNIQUE(player_id, round_id)
  );
`);
