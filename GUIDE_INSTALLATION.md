# Guide d'installation — Spotify Clone

Ce guide explique comment intégrer tous les fichiers fournis dans ton
projet `Desktop\Spotify` et le faire fonctionner.

## Étape 1 — Copier les fichiers

Dézippe l'archive reçue. Elle contient une structure qui correspond
exactement à ton projet. Copie-COLLE (en remplaçant si demandé) :

- `App.tsx` → remplace celui de `Desktop\Spotify\App.tsx`
- `index.js` → remplace celui de `Desktop\Spotify\index.js`
- `service.js` → nouveau fichier, à la racine de `Desktop\Spotify\`
- `src/` → tout le dossier, à fusionner dans `Desktop\Spotify\src\`
- `supabase/` → tout le dossier, à copier dans `Desktop\Spotify\supabase\`
- `.gitignore` → remplace celui existant (ou fusionne si tu as déjà du contenu dedans)
- `DEPENDANCES.md` et ce fichier → informatifs, tu peux les garder à la racine

## Étape 2 — Installer les dépendances npm

Suis le fichier `DEPENDANCES.md` : exécute chaque commande `npm install`
listée, une par une, dans PowerShell depuis `Desktop\Spotify`.

## Étape 3 — Configurer Supabase

1. Ouvre `src/config/env.ts`
2. Remplace les deux valeurs par celles de ton projet Supabase
   (Project Settings > API > Project URL et anon public key)

## Étape 4 — Créer les tables dans Supabase

1. Va sur ton tableau de bord Supabase
2. Clique sur **SQL Editor** dans le menu de gauche
3. Clique **New query**
4. Ouvre le fichier `supabase/schema.sql` fourni, copie tout son contenu
5. Colle-le dans l'éditeur SQL de Supabase
6. Clique **Run**
7. Vérifie qu'il n'y a pas d'erreur rouge en bas de l'écran

## Étape 5 — Configuration native Android (lecteur audio)

`react-native-track-player` a besoin d'une permission Android pour
fonctionner en arrière-plan. Ouvre le fichier :

```
android/app/src/main/AndroidManifest.xml
```

Ajoute cette ligne À L'INTÉRIEUR de la balise `<manifest>` (juste après
la ligne `<manifest ...>` qui commence le fichier), si elle n'existe
pas déjà :

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.INTERNET" />
```

Et À L'INTÉRIEUR de la balise `<application>`, ajoute :

```xml
<service android:name="com.doublesymmetry.trackplayer.service.MusicService" android:exported="false">
  <intent-filter>
    <action android:name="android.intent.action.MEDIA_BUTTON" />
  </intent-filter>
</service>
```

## Étape 6 — Lancer l'app

Comme avant :

```
npx react-native start
```

Puis dans une autre fenêtre :

```
npx react-native run-android
```

## Étape 7 — Premier test

1. L'app devrait s'ouvrir sur l'écran de connexion
2. Appuie sur **"Continuer sans compte"** pour tester le mode invité
3. Tu devrais arriver sur l'écran d'accueil (vide au début, normal —
   aucune piste n'a encore été uploadée)
4. Appuie sur **"+ Ajouter"** pour uploader ta première musique de test

## En cas d'erreur

Copie-moi le message d'erreur complet affiché dans le terminal (pas
juste la dernière ligne, tout le bloc rouge si possible), je
t'expliquerai ce qui se passe et comment le corriger.
