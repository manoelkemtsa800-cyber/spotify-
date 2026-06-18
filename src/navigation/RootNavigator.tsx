import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UploadScreen from '../screens/UploadScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import DownloadsScreen from '../screens/DownloadsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#121212' },
  headerTintColor: '#fff',
};

// Barre d'onglets principale : Accueil, Recherche, Bibliothèque, Profil
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ color }: { color: string }) => {
          const icons: Record<string, string> = {
            Accueil: '🏠',
            Recherche: '🔍',
            Bibliothèque: '📚',
            Profil: '👤',
          };
          return <Text style={{ color, fontSize: 18 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Recherche" component={SearchScreen} />
      <Tab.Screen name="Bibliothèque" component={LibraryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { userId, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center' }}>
        <ActivityIndicator color="#1DB954" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
        {userId ? (
          // Utilisateur connecté (compte ou invité) → accès à l'app complète
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="Upload"
              component={UploadScreen}
              options={{ headerShown: true, title: 'Ajouter une musique' }}
            />
            <Stack.Screen
              name="PlaylistDetail"
              component={PlaylistDetailScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="Downloads"
              component={DownloadsScreen}
              options={{ headerShown: true, title: 'Téléchargements' }}
            />
          </>
        ) : (
          // Pas encore connecté ni en mode invité → écran de connexion
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
