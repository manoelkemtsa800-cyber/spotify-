import { supabase } from '../config/supabase';
import { Track } from '../types';

// Stratégie de recommandation simple pour la V1 :
// 1. On regarde les artistes que l'utilisateur a le plus écoutés
// 2. On recommande d'autres pistes de ces mêmes artistes qu'il n'a pas
//    encore écoutées
// 3. Si l'historique est vide (nouvel utilisateur), on recommande les
//    pistes les plus populaires de la plateforme (les plus écoutées par tous)
//
// C'est volontairement simple : une vraie logique de recommandation
// (filtrage collaboratif, embeddings, etc.) demande beaucoup plus de
// données et pourra être ajoutée plus tard une fois l'app utilisée.

export async function getRecommendations(userId: string, limit: number = 20): Promise<Track[]> {
  // Récupère les IDs des pistes déjà écoutées par l'utilisateur
  const { data: history } = await supabase
    .from('listening_history')
    .select('track_id, tracks(artist)')
    .eq('user_id', userId)
    .order('listened_at', { ascending: false })
    .limit(100);

  if (!history || history.length === 0) {
    return getPopularTracks(limit);
  }

  const listenedTrackIds = new Set(history.map((h: any) => h.track_id));
  const artistCounts: Record<string, number> = {};

  history.forEach((h: any) => {
    const artist = h.tracks?.artist;
    if (artist) artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  });

  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([artist]) => artist);

  if (topArtists.length === 0) {
    return getPopularTracks(limit);
  }

  const { data: candidateTracks, error } = await supabase
    .from('tracks')
    .select('*')
    .in('artist', topArtists)
    .limit(limit * 2); // marge pour compenser le filtrage des pistes déjà écoutées

  if (error || !candidateTracks) {
    return getPopularTracks(limit);
  }

  const fresh = candidateTracks.filter((t: Track) => !listenedTrackIds.has(t.id));
  return fresh.slice(0, limit);
}

// Pistes les plus écoutées sur toute la plateforme (tous utilisateurs confondus)
async function getPopularTracks(limit: number): Promise<Track[]> {
  const { data, error } = await supabase
    .from('listening_history')
    .select('track_id, tracks(*)')
    .limit(500);

  if (error || !data) return [];

  const countByTrack: Record<string, { track: Track; count: number }> = {};

  data.forEach((row: any) => {
    if (!row.tracks) return;
    const id = row.track_id;
    if (!countByTrack[id]) {
      countByTrack[id] = { track: row.tracks, count: 0 };
    }
    countByTrack[id].count++;
  });

  return Object.values(countByTrack)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((entry) => entry.track);
}
