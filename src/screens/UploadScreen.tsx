import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { uploadTrack } from '../services/trackService';
import { useAuth } from '../context/AuthContext';

export default function UploadScreen({ navigation }: any) {
  const { userId } = useAuth();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePickAudio() {
    try {
      const [result] = await pick({ type: [types.audio] });
      setAudioFile({ uri: result.uri, name: result.name ?? 'audio.mp3' });
    } catch (err) {
      // L'utilisateur a probablement annulé la sélection, on ignore
    }
  }

  async function handleUpload() {
    if (!audioFile) {
      Alert.alert('Fichier manquant', 'Sélectionne un fichier audio avant de continuer.');
      return;
    }
    if (!title || !artist) {
      Alert.alert('Champs manquants', 'Le titre et l\'artiste sont obligatoires.');
      return;
    }
    if (!userId) {
      Alert.alert('Erreur', 'Aucun utilisateur identifié.');
      return;
    }

    setUploading(true);
    try {
      await uploadTrack({
        fileUri: audioFile.uri,
        fileName: audioFile.name,
        title,
        artist,
        album: album || undefined,
        durationSeconds: 0, // sera idéalement calculé via une lib d'analyse audio plus tard
        ownerId: userId,
      });

      Alert.alert('Succès', 'Ta musique a été ajoutée !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'L\'upload a échoué.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ajouter une musique</Text>

      <TouchableOpacity style={styles.filePicker} onPress={handlePickAudio}>
        <Text style={styles.filePickerText}>
          {audioFile ? `🎵 ${audioFile.name}` : '+ Choisir un fichier audio'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Titre *"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Artiste *"
        placeholderTextColor="#888"
        value={artist}
        onChangeText={setArtist}
      />
      <TextInput
        style={styles.input}
        placeholder="Album (optionnel)"
        placeholderTextColor="#888"
        value={album}
        onChangeText={setAlbum}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.uploadButtonText}>Publier</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  filePickerText: {
    color: '#1DB954',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#1DB954',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
