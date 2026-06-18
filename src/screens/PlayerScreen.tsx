import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { useProgress } from 'react-native-track-player';
import { usePlayer } from '../context/PlayerContext';
import TrackPlayer from 'react-native-track-player';
import { downloadTrackForOffline, isTrackDownloaded } from '../services/offlineService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function PlayerScreen() {
  const { currentTrack, isPlaying, togglePlay, next, previous } = usePlayer();
  const { position, duration } = useProgress(500);
  const isOnline = useNetworkStatus();
  const [downloading, setDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);

  if (!currentTrack) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Aucune piste en cours de lecture</Text>
      </View>
    );
  }

  async function handleDownload() {
    if (!currentTrack) return;

    const alreadyDownloaded = await isTrackDownloaded(currentTrack.id);
    if (alreadyDownloaded) {
      Alert.alert('Déjà téléchargée', 'Cette piste est déjà disponible hors-ligne.');
      return;
    }

    if (!isOnline) {
      Alert.alert('Pas de connexion', 'Impossible de télécharger sans connexion internet.');
      return;
    }

    setDownloading(true);
    try {
      await downloadTrackForOffline(currentTrack, setDownloadPercent);
      Alert.alert('Terminé', 'La piste est maintenant disponible hors-ligne.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Le téléchargement a échoué.');
    } finally {
      setDownloading(false);
      setDownloadPercent(0);
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      {currentTrack.cover_url ? (
        <Image source={{ uri: currentTrack.cover_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverPlaceholderText}>🎵</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>
        {currentTrack.title}
      </Text>
      <Text style={styles.artist}>{currentTrack.artist}</Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#444"
        thumbTintColor="#1DB954"
        onSlidingComplete={(value) => TrackPlayer.seekTo(value)}
      />
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={previous}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={next}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload} disabled={downloading}>
        {downloading ? (
          <>
            <ActivityIndicator color="#1DB954" size="small" />
            <Text style={styles.downloadText}>{downloadPercent}%</Text>
          </>
        ) : (
          <Text style={styles.downloadText}>⬇ Disponible hors-ligne</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  cover: {
    width: 280,
    height: 280,
    borderRadius: 12,
    marginBottom: 32,
  },
  coverPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 64,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    color: '#888',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: -8,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 32,
    gap: 40,
  },
  controlIcon: {
    fontSize: 28,
    color: '#fff',
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: '#000',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  downloadText: {
    color: '#1DB954',
    fontSize: 14,
  },
});
