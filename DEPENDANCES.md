# Dépendances à installer

Exécute ces commandes UNE PAR UNE dans PowerShell, depuis le dossier
Desktop\Spotify. Certaines ont peut-être déjà été installées avant —
ce n'est pas grave de les relancer, ça ne fait rien si elles sont déjà là.

## 1. Supabase + stockage de session

```
npm install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage
```

## 2. Navigation

```
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

## 3. Lecteur audio

```
npm install react-native-track-player
```

## 4. Hors-ligne : base de données locale + fichiers + réseau

⚠️ Mise à jour : `react-native-sqlite-storage` est abandonné et ne
compile plus avec les versions récentes de Gradle (utilise `jcenter()`,
fermé depuis 2021). On utilise `@op-engineering/op-sqlite` à la place,
qui est maintenu et compatible.

D'abord, si tu avais déjà installé l'ancienne librairie, désinstalle-la :

```
npm uninstall react-native-sqlite-storage
```

Puis installe la nouvelle :

```
npm install @op-engineering/op-sqlite react-native-fs @react-native-community/netinfo
```

## 5. Sélecteur de fichiers (pour uploader sa musique) + slider (barre de progression du player)

```
npm install @react-native-documents/picker @react-native-community/slider
```

## 6. Lien natif (uniquement si demandé après installation)

Avec React Native CLI moderne (>= 0.71), le "autolinking" se fait
normalement automatiquement lors du build. Si après `npx react-native
run-android` tu vois une erreur du type "Cannot find module" ou
"Native module cannot be null", dis-le moi et on fera un lien manuel.

## Vérification finale

Une fois toutes les commandes terminées, vérifie qu'aucune n'a affiché
d'erreur rouge "npm ERR!". Si une commande échoue à cause d'un timeout
réseau (comme pour Gradle), relance-la simplement.
