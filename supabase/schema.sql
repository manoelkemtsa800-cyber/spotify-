-- ============================================================
-- SCHÉMA DE BASE DE DONNÉES - Spotify Clone
-- À exécuter dans Supabase : SQL Editor > New query > coller > Run
-- ============================================================

-- Table des profils (étend les utilisateurs Supabase Auth + gère les invités)
create table if not exists profiles (
  id uuid primary key, -- soit auth.users.id, soit un id "guest-..." généré côté app
  username text,
  avatar_url text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now()
);

-- Table des pistes audio
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album text,
  duration_seconds integer not null default 0,
  cover_url text,
  audio_url text not null,
  owner_id text not null, -- text pour accepter aussi bien uuid auth que "guest-..."
  created_at timestamp with time zone default now()
);

-- Table des playlists
create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  owner_id text not null,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

-- Table de jointure playlist <-> pistes
create table if not exists playlist_tracks (
  playlist_id uuid references playlists(id) on delete cascade,
  track_id uuid references tracks(id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, track_id)
);

-- Historique d'écoute (servira pour les recommandations plus tard)
create table if not exists listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  track_id uuid references tracks(id) on delete cascade,
  listened_at timestamp with time zone default now()
);

-- ============================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- Pour l'instant on garde des règles simples et permissives
-- (lecture publique, écriture par tout le monde) car on a un
-- mode "sans compte". On les durcira progressivement.
-- ============================================================

alter table tracks enable row level security;
alter table playlists enable row level security;
alter table playlist_tracks enable row level security;
alter table listening_history enable row level security;
alter table profiles enable row level security;

-- Tout le monde peut lire les pistes
create policy "Lecture publique des pistes" on tracks
  for select using (true);

-- Tout le monde peut insérer une piste (mode sans compte inclus)
create policy "Insertion libre des pistes" on tracks
  for insert with check (true);

create policy "Suppression de ses propres pistes" on tracks
  for delete using (true);

-- Playlists : lecture publique si is_public, sinon on filtrera côté app pour l'instant
create policy "Lecture publique des playlists" on playlists
  for select using (true);

create policy "Insertion libre des playlists" on playlists
  for insert with check (true);

create policy "Suppression de ses propres playlists" on playlists
  for delete using (true);

create policy "Lecture libre playlist_tracks" on playlist_tracks
  for select using (true);

create policy "Insertion libre playlist_tracks" on playlist_tracks
  for insert with check (true);

create policy "Suppression libre playlist_tracks" on playlist_tracks
  for delete using (true);

create policy "Lecture libre historique" on listening_history
  for select using (true);

create policy "Insertion libre historique" on listening_history
  for insert with check (true);

create policy "Lecture libre profiles" on profiles
  for select using (true);

create policy "Insertion libre profiles" on profiles
  for insert with check (true);

-- ============================================================
-- STORAGE : buckets pour fichiers audio et pochettes
-- (à créer aussi manuellement dans l'interface si cette partie échoue)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('audio-tracks', 'audio-tracks', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('track-covers', 'track-covers', true)
on conflict (id) do nothing;

create policy "Lecture publique audio" on storage.objects
  for select using (bucket_id = 'audio-tracks');

create policy "Upload libre audio" on storage.objects
  for insert with check (bucket_id = 'audio-tracks');

create policy "Lecture publique covers" on storage.objects
  for select using (bucket_id = 'track-covers');

create policy "Upload libre covers" on storage.objects
  for insert with check (bucket_id = 'track-covers');
