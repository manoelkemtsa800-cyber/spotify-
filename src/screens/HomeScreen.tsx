import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Track } from '../types';
import { fetchTracks } from '../services/trackService';
import { getRecommendations } from '../services/recommendationService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function HomeScreen({ navigation }: any) {
  const { userId } = useAuth();
  const { playQueue } = usePlayer();
  const isOnline = useNetworkStatus();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!isOnline) return; // pas de requête réseau si hors-ligne, on garde les données actuelles

    try {
      const data = await fetchTracks();
      setTracks(data);

      if (userId) {
        const recs = await getRecommendations(userId, 10);
        setRecommendations(recs);
      }
    } catch (err) {
      console.error('Erreur chargement accueil:', err);
    }
  }, [userId, isOnline]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handlePlay(track: Track, list: Track[]) {
    const index = list.findIndex((t) => t.id === track.id);
    await playQueue(list, index >= 0 ? index : 0);
    navigation.navigate('Player');
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1DB954" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Spotify Clone</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('Upload')}>
          <Text style={styles.uploadButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Mode hors-ligne — seules tes pistes téléchargées sont lisibles
          </Text>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          recommendations.length > 0 ? (
            <View style={styles.recommendSection}>
              <Text style={styles.sectionTitle}>Recommandé pour toi</Text>
              <FlatList
                data={recommendations}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.recommendCard}
                    onPress={() => handlePlay(item, recommendations)}
                  >
                    {item.cover_url ? (
                      <Image source={{ uri: item.cover_url }} style={styles.recommendCover} />
                    ) : (
                      <View style={[styles.recommendCover, styles.coverPlaceholder]}>
                        <Text style={styles.coverPlaceholderText}>🎵</Text>
                      </View>
                    )}
                    <Text style={styles.recommendTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.recommendArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <Text style={styles.sectionTitle}>Toutes les pistes</Text>
            </View>
          ) : (
            <Text style={styles.sectionTitle}>Toutes les pistes</Text>
          )
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Aucune piste pour l'instant. Appuie sur "+ Ajouter" pour uploader ta première musique !
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trackRow} onPress={() => handlePlay(item, tracks)}>
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Text style={styles.coverPlaceholderText}>🎵</Text>
              </View>
            )}
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.trackArtist} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  uploadButton: { backgroundColor: '#1DB954', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  uploadButtonText: { color: '#000', fontWeight: '600', fontSize: 13 },
  offlineBanner: { backgroundColor: '#332700', paddingVertical: 8, paddingHorizontal: 16, marginBottom: 8 },
  offlineBannerText: { color: '#ffcc66', fontSize: 13, textAlign: 'center' },
  emptyText: { color: '#888', textAlign: 'center', fontSize: 15 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, marginVertical: 12 },
  recommendSection: { marginBottom: 8 },
  recommendCard: { width: 130, marginLeft: 16, marginRight: 4 },
  recommendCover: { width: 130, height: 130, borderRadius: 8, marginBottom: 6 },
  recommendTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  recommendArtist: { color: '#888', fontSize: 12 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  cover: { width: 50, height: 50, borderRadius: 4, marginRight: 12 },
  coverPlaceholder: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  coverPlaceholderText: { fontSize: 20 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  trackArtist: { color: '#888', fontSize: 14, marginTop: 2 },
});
