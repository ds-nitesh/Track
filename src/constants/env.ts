/**
 * Firebase web config — replace with your Firebase Console values.
 * Prefer building with react-native-config for production secrets.
 */
export const ENV = {
  FIREBASE_API_KEY: 'AIzaSyAGm3B-YU7cAdOUevgdFRtOG-luJmm1_vU',
  FIREBASE_AUTH_DOMAIN: 'track-90459.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'track-90459',
  FIREBASE_STORAGE_BUCKET: 'track-90459.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: '1017756171050',
  FIREBASE_APP_ID: '1:1017756171050:web:32b96a0a5a7f7c1c317c53',
  FIREBASE_MEASUREMENT_ID: 'G-QDH5DG3RZ3',

  // apiKey: "AIzaSyAGm3B-YU7cAdOUevgdFRtOG-luJmm1_vU",
  // authDomain: "track-90459.firebaseapp.com",
  // projectId: "track-90459",
  // storageBucket: "track-90459.firebasestorage.app",
  // messagingSenderId: "1017756171050",
  // appId: "1:1017756171050:web:32b96a0a5a7f7c1c317c53",
  // measurementId: "G-QDH5DG3RZ3"
} as const;

export const isFirebaseConfigured = (): boolean =>
  !ENV.FIREBASE_API_KEY.startsWith('YOUR_') &&
  !ENV.FIREBASE_PROJECT_ID.startsWith('YOUR_');
