import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import { Track } from '../types';

let isPlayerSetup = false;

// Initialise le lecteur audio. À appeler une seule fois au démarrage de l'app.
export async function setupPlayer(): Promise<void> {
  if (isPlayerSetup) return;

  await TrackPlayer.setupPlayer();

  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
  });

  await TrackPlayer.setRepeatMode(RepeatMode.Off);
  isPlayerSetup = true;
}

// Convertit notre type `Track` (base de données) vers le format
// attendu par react-native-track-player
function toPlayerTrack(track: Track, localPath?: string) {
  return {
    id: track.id,
    url: localPath ?? track.audio_url, // priorité au fichier local si téléchargé
    title: track.title,
    artist: track.artist,
    artwork: track.cover_url ?? undefined,
    duration: track.duration_seconds,
  };
}

// Joue une piste immédiatement, en remplaçant la file d'attente actuelle
export async function playTrack(track: Track, localPath?: string): Promise<void> {
  await TrackPlayer.reset();
  await TrackPlayer.add(toPlayerTrack(track, localPath));
  await TrackPlayer.play();
}

// Remplace toute la file d'attente (ex: jouer une playlist entière)
// et démarre à l'index donné
export async function playQueue(
  tracks: Track[],
  startIndex: number = 0,
  localPaths: Record<string, string> = {},
): Promise<void> {
  await TrackPlayer.reset();
  const playerTracks = tracks.map((t) => toPlayerTrack(t, localPaths[t.id]));
  await TrackPlayer.add(playerTracks);
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
}

export async function togglePlayback(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === 'playing') {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function skipToNext(): Promise<void> {
  await TrackPlayer.skipToNext().catch(() => {});
}

export async function skipToPrevious(): Promise<void> {
  await TrackPlayer.skipToPrevious().catch(() => {});
}

export { Event };
export default TrackPlayer;
