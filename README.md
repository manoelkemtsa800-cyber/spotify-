# Spotify Clone — React Native

Clone de Spotify en React Native CLI (Android), avec :
- Authentification email/mot de passe + mode sans compte (invité)
- Upload de fichiers audio personnels vers Supabase Storage
- Lecture audio en arrière-plan (react-native-track-player)
- Playlists, recherche, recommandations basées sur l'historique
- Mode hors-ligne : téléchargement local + SQLite + synchronisation auto

## Stack technique

- React Native 0.86 (CLI pur, sans Expo)
- Supabase (base de données PostgreSQL + authentification + stockage fichiers)
- react-native-track-player (lecture audio native)
- @op-engineering/op-sqlite (base de données locale pour le mode hors-ligne)
- react-native-fs (gestion des fichiers locaux)
- @react-navigation/native (navigation par onglets + stack)

## Installation

### 1. Cloner le repo

```
git clone https://github.com/manoelkemtsa800-cyber/spotify-.git
cd spotify-
```

### 2. Créer le fichier de configuration Supabase

Copie `src/config/env.example.ts` vers `src/config/env.ts` et remplis tes clés :

```
cp src/config/env.example.ts src/config/env.ts
```

Puis édite `src/config/env.ts` avec tes vraies valeurs (Project Settings > API dans Supabase).

### 3. Installer les dépendances

```
npm install
```

Le script `postinstall` applique automatiquement le correctif Kotlin
pour `react-native-track-player`.

### 4. Créer les tables dans Supabase

Ouvre `supabase/schema.sql`, copie tout le contenu, colle-le dans
Supabase > SQL Editor > New query > Run.

### 5. Lancer l'app (Android)

```
npx react-native start
```

Dans un second terminal :

```
npx react-native run-android
```

## Build APK via GitHub Actions

Le workflow `.github/workflows/android.yml` génère automatiquement un APK
à chaque push sur `main`. Pour que ça fonctionne, configure ces secrets
dans Settings > Secrets and variables > Actions de ton repo GitHub :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

L'APK est disponible dans l'onglet Actions > ton build > Artifacts.
