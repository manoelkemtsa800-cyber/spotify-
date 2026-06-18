import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import RootNavigator from './src/navigation/RootNavigator';
import { setupPlayer } from './src/services/playerService';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { processSyncQueue } from './src/services/syncService';

// Petit composant interne qui déclenche la synchro automatique
// dès que la connexion internet revient (utile pour le mode hors-ligne)
function AutoSync() {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      processSyncQueue().catch((err) => console.error('Erreur synchro:', err));
    }
  }, [isOnline]);

  return null;
}

export default function App() {
  useEffect(() => {
    // Initialise le lecteur audio une seule fois au démarrage de l'app
    setupPlayer().catch((err) => console.error('Erreur setup player:', err));
  }, []);

  return (
    <AuthProvider>
      <PlayerProvider>
        <AutoSync />
        <RootNavigator />
      </PlayerProvider>
    </AuthProvider>
  );
}
