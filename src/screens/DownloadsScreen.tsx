import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DownloadedTrack } from '../types';
import { getDownloadedTracks, removeDownloadedTrack } from '../services/offlineService';

export default function DownloadsScreen({ navigation }: any) {
  const [downloads, setDownloads] = useState<DownloadedTrack[]>([]);

  const load = useCallback(async () => {
    const data = await getDownloadedTracks();
    setDownloads(data);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  function handleDelete(trackId: string) {
    Alert.alert('Supprimer', 'Retirer cette piste du stockage hors-ligne ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await removeDownloadedTrack(trackId);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Téléchargements</Text>

      <FlatList
        data={downloads}
        keyExtractor={(item) => item.track_id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucune piste téléchargée. Appuie sur "Disponible hors-ligne" depuis le lecteur pour en ajouter.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.path} numberOfLines={1}>
              {item.local_file_path.split('/').pop()}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.track_id)}>
              <Text style={styles.deleteText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 16, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 24 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  path: { color: '#fff', fontSize: 14, flex: 1, marginRight: 12 },
  deleteText: { color: '#ff4444', fontSize: 14 },
});
