import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Track } from '../types';
import { fetchPlaylistTracks, removeTrackFromPlaylist } from '../services/playlistService';
import { usePlayer } from '../context/PlayerContext';

export default function PlaylistDetailScreen({ route, navigation }: any) {
  const { playlist } = route.params;
  const [tracks, setTracks] = useState<Track[]>([]);
  const { playQueue } = usePlayer();

  const load = useCallback(async () => {
    try {
      const data = await fetchPlaylistTracks(playlist.id);
      setTracks(data);
    } catch (err) {
      console.error('Erreur chargement pistes playlist:', err);
    }
  }, [playlist.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePlay(index: number) {
    await playQueue(tracks, index);
    navigation.navigate('Player');
  }

  async function handleRemove(trackId: string) {
    Alert.alert('Retirer la piste', 'Veux-tu retirer cette piste de la playlist ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          await removeTrackFromPlaylist(playlist.id, trackId);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{playlist.name}</Text>
      {playlist.description && <Text style={styles.description}>{playlist.description}</Text>}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Cette playlist est vide pour l'instant.</Text>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.trackRow}
            onPress={() => handlePlay(index)}
            onLongPress={() => handleRemove(item.id)}
          >
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Text>🎵</Text>
              </View>
            )}
            <View>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 16, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  description: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 12 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 24 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  cover: { width: 46, height: 46, borderRadius: 4, marginRight: 12 },
  coverPlaceholder: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  trackArtist: { color: '#888', fontSize: 13 },
});
