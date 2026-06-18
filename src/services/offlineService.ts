import RNFS from 'react-native-fs';
import { getDB } from '../database/db';
import { Track, DownloadedTrack } from '../types';

const TRACKS_DIR = `${RNFS.DocumentDirectoryPath}/offline_tracks`;

async function ensureDirExists() {
  const exists = await RNFS.exists(TRACKS_DIR);
  if (!exists) {
    await RNFS.mkdir(TRACKS_DIR);
  }
}

// Télécharge une piste pour le mode hors-ligne :
// 1. Télécharge le fichier audio (et la pochette si dispo) en local
// 2. Enregistre les chemins locaux dans SQLite
export async function downloadTrackForOffline(
  track: Track,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await ensureDirExists();

  const audioExt = track.audio_url.split('.').pop()?.split('?')[0] || 'mp3';
  const localAudioPath = `${TRACKS_DIR}/${track.id}.${audioExt}`;

  const download = RNFS.downloadFile({
    fromUrl: track.audio_url,
    toFile: localAudioPath,
    progress: (res) => {
      if (onProgress && res.contentLength > 0) {
        onProgress(Math.round((res.bytesWritten / res.contentLength) * 100));
      }
    },
    progressDivider: 5,
  });

  const result = await download.promise;
  if (result.statusCode !== 200) {
    throw new Error(`Échec du téléchargement (code ${result.statusCode})`);
  }

  // Pochette (optionnelle, on n'échoue pas le téléchargement si elle rate)
  let localCoverPath: string | null = null;
  if (track.cover_url) {
    try {
      localCoverPath = `${TRACKS_DIR}/${track.id}_cover.jpg`;
      await RNFS.downloadFile({ fromUrl: track.cover_url, toFile: localCoverPath }).promise;
    } catch {
      localCoverPath = null;
    }
  }

  const db = getDB();
  db.execute(
    `INSERT OR REPLACE INTO downloaded_tracks
     (track_id, title, artist, album, duration_seconds, cover_local_path, audio_local_path, downloaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      track.id,
      track.title,
      track.artist,
      track.album,
      track.duration_seconds,
      localCoverPath,
      localAudioPath,
      new Date().toISOString(),
    ],
  );
}

// Supprime une piste téléchargée (fichiers + entrée DB)
export async function removeDownloadedTrack(trackId: string): Promise<void> {
  const db = getDB();
  const result = db.execute('SELECT audio_local_path, cover_local_path FROM downloaded_tracks WHERE track_id = ?', [
    trackId,
  ]);

  const row = result.rows?._array[0];
  if (row) {
    if (await RNFS.exists(row.audio_local_path)) await RNFS.unlink(row.audio_local_path);
    if (row.cover_local_path && (await RNFS.exists(row.cover_local_path))) {
      await RNFS.unlink(row.cover_local_path);
    }
  }

  db.execute('DELETE FROM downloaded_tracks WHERE track_id = ?', [trackId]);
}

// Liste toutes les pistes disponibles hors-ligne
export async function getDownloadedTracks(): Promise<DownloadedTrack[]> {
  const db = getDB();
  const result = db.execute('SELECT * FROM downloaded_tracks ORDER BY downloaded_at DESC');

  const rows = result.rows?._array ?? [];
  return rows.map((row: any) => ({
    track_id: row.track_id,
    local_file_path: row.audio_local_path,
    downloaded_at: row.downloaded_at,
  }));
}

// Vérifie si une piste précise est déjà téléchargée, et renvoie son chemin local
export async function getLocalPathIfDownloaded(trackId: string): Promise<string | null> {
  const db = getDB();
  const result = db.execute('SELECT audio_local_path FROM downloaded_tracks WHERE track_id = ?', [trackId]);

  const rows = result.rows?._array ?? [];
  if (rows.length === 0) return null;
  return rows[0].audio_local_path;
}

export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  const path = await getLocalPathIfDownloaded(trackId);
  return path !== null;
}
