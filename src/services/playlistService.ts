import { supabase } from '../config/supabase';
import { Playlist, Track } from '../types';

export async function fetchUserPlaylists(ownerId: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Playlist[];
}

export async function createPlaylist(params: {
  name: string;
  description?: string;
  ownerId: string;
  isPublic?: boolean;
}): Promise<Playlist> {
  const { data, error } = await supabase
    .from('playlists')
    .insert({
      name: params.name,
      description: params.description ?? null,
      owner_id: params.ownerId,
      is_public: params.isPublic ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Playlist;
}

export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  // On récupère la position max actuelle pour ajouter la piste à la fin
  const { data: existing } = await supabase
    .from('playlist_tracks')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await supabase
    .from('playlist_tracks')
    .insert({ playlist_id: playlistId, track_id: trackId, position: nextPosition });

  if (error) throw error;
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId);

  if (error) throw error;
}

// Récupère les pistes d'une playlist, dans l'ordre défini par `position`
export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('position, tracks(*)')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });

  if (error) throw error;

  // `tracks` arrive imbriqué à cause du join Supabase ; on l'extrait proprement
  return (data ?? []).map((row: any) => row.tracks as Track);
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  const { error } = await supabase.from('playlists').delete().eq('id', playlistId);
  if (error) throw error;
}
