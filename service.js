// Ce fichier est OBLIGATOIRE pour react-native-track-player.
// Il définit le service qui tourne en arrière-plan pour garder la musique
// active même quand l'app est en arrière-plan ou l'écran verrouillé.
//
// Emplacement : à la RACINE du projet (Desktop\Spotify\service.js)
// (au même niveau que App.tsx, index.js, package.json)

module.exports = async function () {
  const TrackPlayer = require('react-native-track-player').default;
  const { Event } = require('react-native-track-player');

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });
};
