import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Track } from '../types';
import { searchTracks } from '../services/trackService';
import { usePlayer } from '../context/PlayerContext';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { playQueue } = usePlayer();

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchTracks(text);
      setResults(data);
    } catch (err) {
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(track: Track, index: number) {
    await playQueue(results, index);
    navigation.navigate('Player');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un titre ou un artiste..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={handleSearch}
      />

      {loading && <ActivityIndicator color="#1DB954" style={{ marginTop: 16 }} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.trackRow} onPress={() => handleSelect(item, index)}>
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
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cover: {
    width: 46,
    height: 46,
    borderRadius: 4,
    marginRight: 12,
  },
  coverPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#888',
    fontSize: 13,
  },
});
