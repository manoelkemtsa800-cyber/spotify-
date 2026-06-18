import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Playlist } from '../types';
import { fetchUserPlaylists, createPlaylist } from '../services/playlistService';
import { getDownloadedTracks } from '../services/offlineService';
import { useAuth } from '../context/AuthContext';

export default function LibraryScreen({ navigation }: any) {
  const { userId } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchUserPlaylists(userId);
      setPlaylists(data);
    } catch (err) {
      console.error('Erreur chargement playlists:', err);
    }

    const downloaded = await getDownloadedTracks();
    setDownloadedCount(downloaded.length);
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim() || !userId) return;

    try {
      await createPlaylist({ name: newPlaylistName.trim(), ownerId: userId });
      setNewPlaylistName('');
      setModalVisible(false);
      load();
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de créer la playlist.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Ta bibliothèque</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addButton}>+ Playlist</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.offlineRow}
        onPress={() => navigation.navigate('Downloads')}
      >
        <Text style={styles.offlineIcon}>⬇</Text>
        <View>
          <Text style={styles.offlineTitle}>Musique téléchargée</Text>
          <Text style={styles.offlineSubtitle}>{downloadedCount} piste(s) disponible(s) hors-ligne</Text>
        </View>
      </TouchableOpacity>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune playlist. Crée-en une avec le bouton ci-dessus !</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playlistRow}
            onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
          >
            <View style={styles.playlistCover}>
              <Text>🎶</Text>
            </View>
            <Text style={styles.playlistName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouvelle playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom de la playlist"
              placeholderTextColor="#888"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreatePlaylist}>
                <Text style={styles.modalConfirm}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 16, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addButton: { color: '#1DB954', fontSize: 15, fontWeight: '600' },
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  offlineIcon: { fontSize: 22, marginRight: 12, color: '#1DB954' },
  offlineTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  offlineSubtitle: { color: '#888', fontSize: 13 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 24 },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  playlistCover: {
    width: 46,
    height: 46,
    borderRadius: 4,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistName: { color: '#fff', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalBox: { backgroundColor: '#222', borderRadius: 12, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24 },
  modalCancel: { color: '#888', fontSize: 15 },
  modalConfirm: { color: '#1DB954', fontSize: 15, fontWeight: '600' },
});
