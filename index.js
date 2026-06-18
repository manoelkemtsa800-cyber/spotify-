/**
 * Ce fichier remplace le index.js généré par défaut par React Native.
 * Il ajoute l'enregistrement obligatoire du service de lecture audio.
 *
 * Emplacement : à la RACINE du projet (Desktop\Spotify\index.js)
 * -> REMPLACE le fichier index.js existant.
 */

import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require('./service'));
