import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

type AuthContextType = {
  session: Session | null;
  userId: string | null;
  isAnonymous: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clé utilisée pour stocker l'identifiant "invité" localement sur l'appareil
const GUEST_ID_KEY = 'spotify_clone_guest_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();

    // Écoute les changements de session (connexion / déconnexion)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function init() {
    // 1. Vérifie s'il existe déjà une session Supabase (utilisateur avec compte)
    const { data } = await supabase.auth.getSession();
    setSession(data.session);

    // 2. Si pas de session, vérifie s'il existe déjà un identifiant invité local
    if (!data.session) {
      const existingGuestId = await AsyncStorage.getItem(GUEST_ID_KEY);
      if (existingGuestId) {
        setGuestId(existingGuestId);
      }
    }

    setLoading(false);
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? error.message : null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  // Mode "sans compte" : on génère un identifiant unique stocké uniquement
  // sur l'appareil. Cet identifiant sert de owner_id pour les pistes/playlists
  // créées en local. Si l'utilisateur crée un vrai compte plus tard, on pourra
  // migrer ces données (étape qu'on implémentera dans une prochaine session).
  async function continueAsGuest() {
    let id = await AsyncStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = generateGuestId();
      await AsyncStorage.setItem(GUEST_ID_KEY, id);
    }
    setGuestId(id);
  }

  const userId = session?.user?.id ?? guestId;
  const isAnonymous = !session && !!guestId;

  return (
    <AuthContext.Provider
      value={{ session, userId, isAnonymous, loading, signUp, signIn, signOut, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  return ctx;
}

// Génère un identifiant simple type UUID v4 sans dépendance externe
function generateGuestId(): string {
  return 'guest-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
