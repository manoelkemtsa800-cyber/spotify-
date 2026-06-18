// Représente une piste audio uploadée par un utilisateur
export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration_seconds: number;
  cover_url: string | null;
  audio_url: string; // URL du fichier dans Supabase Storage
  owner_id: string; // utilisateur (ou anonyme) qui a uploadé la piste
  created_at: string;
};

// Une playlist créée par un utilisateur
export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  owner_id: string;
  is_public: boolean;
  created_at: string;
};

// Lien entre une playlist et ses pistes (table de jointure)
export type PlaylistTrack = {
  playlist_id: string;
  track_id: string;
  position: number;
};

// Profil utilisateur (compte OU anonyme)
export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

// Entrée d'historique d'écoute (utile plus tard pour les recommandations)
export type ListeningHistory = {
  id: string;
  user_id: string;
  track_id: string;
  listened_at: string;
};

// Une piste téléchargée localement pour le mode hors-ligne
export type DownloadedTrack = {
  track_id: string;
  local_file_path: string;
  downloaded_at: string;
};
