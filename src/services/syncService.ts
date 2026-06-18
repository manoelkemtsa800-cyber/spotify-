import { getDB } from '../database/db';
import { supabase } from '../config/supabase';

// Types d'actions qu'on peut faire hors-ligne et synchroniser plus tard
export type SyncActionType = 'add_listening_history' | 'create_playlist' | 'add_track_to_playlist';

// Ajoute une action à la file d'attente locale (appelé quand on est hors-ligne)
export async function queueSyncAction(actionType: SyncActionType, payload: object): Promise<void> {
  const db = getDB();
  db.execute('INSERT INTO sync_queue (action_type, payload, created_at) VALUES (?, ?, ?)', [
    actionType,
    JSON.stringify(payload),
    new Date().toISOString(),
  ]);
}

// Parcourt la file d'attente et envoie chaque action à Supabase.
// À appeler quand la connexion revient (ex: dans un écouteur réseau).
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  const db = getDB();
  const result = db.execute('SELECT * FROM sync_queue ORDER BY created_at ASC');
  const rows = result.rows?._array ?? [];

  let success = 0;
  let failed = 0;

  for (const row of rows) {
    const payload = JSON.parse(row.payload);

    try {
      await executeAction(row.action_type, payload);
      db.execute('DELETE FROM sync_queue WHERE id = ?', [row.id]);
      success++;
    } catch (err) {
      console.error('Erreur sync action', row.action_type, err);
      failed++;
      // On laisse l'action dans la file pour réessayer la prochaine fois
    }
  }

  return { success, failed };
}

async function executeAction(actionType: string, payload: any): Promise<void> {
  switch (actionType) {
    case 'add_listening_history':
      await supabase.from('listening_history').insert({
        user_id: payload.userId,
        track_id: payload.trackId,
      });
      break;

    case 'create_playlist':
      await supabase.from('playlists').insert({
        id: payload.id, // id généré côté client pour rester cohérent hors-ligne
        name: payload.name,
        owner_id: payload.ownerId,
        is_public: payload.isPublic ?? false,
      });
      break;

    case 'add_track_to_playlist':
      await supabase.from('playlist_tracks').insert({
        playlist_id: payload.playlistId,
        track_id: payload.trackId,
        position: payload.position ?? 0,
      });
      break;

    default:
      throw new Error(`Type d'action inconnu: ${actionType}`);
  }
}
