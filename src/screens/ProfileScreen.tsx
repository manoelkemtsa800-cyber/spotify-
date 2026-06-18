import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { session, isAnonymous, userId, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Déconnexion', 'Veux-tu te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{isAnonymous ? '👤' : '🎧'}</Text>
      </View>

      <Text style={styles.name}>{isAnonymous ? 'Invité' : session?.user?.email}</Text>
      <Text style={styles.idText}>ID: {userId}</Text>

      {isAnonymous && (
        <Text style={styles.warningText}>
          Tu utilises le mode invité. Tes données sont liées uniquement à cet appareil.
          Crée un compte pour ne jamais les perdre.
        </Text>
      )}

      {!isAnonymous && (
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: { fontSize: 40 },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  idText: { color: '#666', fontSize: 12, marginTop: 4, marginBottom: 20 },
  warningText: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  signOutButton: {
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  signOutText: { color: '#ff4444', fontSize: 15 },
});
