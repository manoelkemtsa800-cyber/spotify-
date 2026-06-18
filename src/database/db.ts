import { open, DB } from '@op-engineering/op-sqlite';

let dbInstance: DB | null = null;

// Ouvre (ou crée) la base SQLite locale et s'assure que les tables existent.
// Cette base sert UNIQUEMENT au mode hors-ligne : pistes téléchargées,
// playlists mises en cache, file d'attente de synchronisation.
export function getDB(): DB {
  if (dbInstance) return dbInstance;

  dbInstance = open({ name: 'spotify_clone.db' });
  createTables(dbInstance);
  return dbInstance;
}

function createTables(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS downloaded_tracks (
      track_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration_seconds INTEGER,
      cover_local_path TEXT,
      audio_local_path TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS cached_playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      owner_id TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS cached_playlist_tracks (
      playlist_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (playlist_id, track_id)
    );
  `);

  // File d'attente d'actions à synchroniser avec Supabase
  // quand la connexion reviendra (ex: piste écoutée hors-ligne,
  // playlist créée hors-ligne, etc.)
  db.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}
