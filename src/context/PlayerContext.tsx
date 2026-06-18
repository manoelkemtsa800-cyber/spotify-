import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { Event, State, useTrackPlayerEvents } from 'react-native-track-player';
import { Track } from '../types';
import { playQueue as playQueueService, togglePlayback, skipToNext, skipToPrevious } from '../services/playerService';
import { getLocalPathIfDownloaded } from '../services/offlineService';
import { useAuth } from './AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { queueSyncAction } from '../services/syncService';
import { supabase } from '../config/supabase';

type PlayerContextType = {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const isOnline = useNetworkStatus();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Écoute les événements natifs du lecteur (changement de piste, play/pause)
  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      setIsPlaying(event.state === State.Playing);
    }
    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      const matched = queue.find((t) => t.id === event.track?.id);
      if (matched) {
        setCurrentTrack(matched);
        logListening(matched.id);
      }
    }
  });

  const logListening = useCallback(
    async (trackId: string) => {
      if (!userId) return;

      if (isOnline) {
        await supabase.from('listening_history').insert({ user_id: userId, track_id: trackId });
      } else {
        // Hors-ligne : on met l'écoute en file d'attente pour synchro plus tard
        await queueSyncAction('add_listening_history', { userId, trackId });
      }
    },
    [userId, isOnline],
  );

  async function playQueue(tracks: Track[], startIndex: number = 0) {
    // Pour chaque piste, on vérifie si une version locale (téléchargée) existe.
    // Si oui, on la joue depuis le stockage local plutôt que depuis internet —
    // c'est ce qui permet la lecture hors-ligne de fonctionner de façon transparente.
    const localPaths: Record<string, string> = {};
    for (const track of tracks) {
      const localPath = await getLocalPathIfDownloaded(track.id);
      if (localPath) localPaths[track.id] = localPath;
    }

    await playQueueService(tracks, startIndex, localPaths);
    setQueue(tracks);
    setCurrentTrack(tracks[startIndex] ?? null);
  }

  async function togglePlay() {
    await togglePlayback();
  }

  async function next() {
    await skipToNext();
  }

  async function previous() {
    await skipToPrevious();
  }

  return (
    <PlayerContext.Provider
      value={{ currentTrack, queue, isPlaying, playQueue, togglePlay, next, previous }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer doit être utilisé à l\'intérieur de PlayerProvider');
  return ctx;
}
