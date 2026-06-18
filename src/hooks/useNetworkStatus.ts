import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Hook simple qui renvoie `true` si l'appareil est connecté à internet,
// `false` sinon. Utilisé pour basculer entre mode en ligne / hors-ligne.
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}
