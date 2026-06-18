import { supabase } from '../config/supabase';
import { Track } from '../types';

const BUCKET_AUDIO = 'audio-tracks';
const BUCKET_COVERS = 'track-covers';

// Récupère toutes les pistes visibles (pour l'instant : toutes les pistes,
// on affinera plus tard avec des règles de visibilité publique/privée)
export async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Track[];
}

// Recherche de pistes par titre ou artiste
export async function searchTracks(query: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    .limit(30);

  if (error) throw error;
  return data as Track[];
}

// Upload d'un fichier audio + création de l'entrée en base de données.
// `fileUri` est le chemin local du fichier choisi par l'utilisateur,
// `fileName` doit être unique (on y intègre un timestamp).
export async function uploadTrack(params: {
  fileUri: string;
  fileName: string;
  title: string;
  artist: string;
  album?: string;
  durationSeconds: number;
  ownerId: string;
  coverUri?: string;
}): Promise<Track> {
  const { fileUri, fileName, title, artist, album, durationSeconds, ownerId, coverUri } = params;

  // 1. Upload du fichier audio vers Supabase Storage
  const audioPath = `${ownerId}/${Date.now()}-${fileName}`;
  const audioBlob = await uriToBlob(fileUri);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_AUDIO)
    .upload(audioPath, audioBlob, {
      contentType: 'audio/mpeg',
    });

  if (uploadError) throw uploadError;

  const { data: audioUrlData } = supabase.storage.from(BUCKET_AUDIO).getPublicUrl(audioPath);

  // 2. Upload optionnel de la pochette
  let coverUrl: string | null = null;
  if (coverUri) {
    const coverPath = `${ownerId}/${Date.now()}-cover.jpg`;
    const coverBlob = await uriToBlob(coverUri);
    const { error: coverError } = await supabase.storage
      .from(BUCKET_COVERS)
      .upload(coverPath, coverBlob, { contentType: 'image/jpeg' });

    if (!coverError) {
      const { data: coverUrlData } = supabase.storage.from(BUCKET_COVERS).getPublicUrl(coverPath);
      coverUrl = coverUrlData.publicUrl;
    }
  }

  // 3. Création de l'entrée en base
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      title,
      artist,
      album: album ?? null,
      duration_seconds: durationSeconds,
      cover_url: coverUrl,
      audio_url: audioUrlData.publicUrl,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Track;
}

export async function deleteTrack(trackId: string): Promise<void> {
  const { error } = await supabase.from('tracks').delete().eq('id', trackId);
  if (error) throw error;
}

// Convertit un chemin de fichier local (file://...) en Blob pour l'upload
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}
