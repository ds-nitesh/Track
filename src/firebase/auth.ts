import {
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {createAsyncStorage} from '@react-native-async-storage/async-storage';
import {getFirebaseApp} from './config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {getReactNativePersistence} = require(
  '@firebase/auth/dist/rn/index.js',
) as {
  getReactNativePersistence: (
    storage: ReturnType<typeof createAsyncStorage>,
  ) => any;
};

const authStorage = createAsyncStorage('track-firebase-auth');

let authInstance: ReturnType<typeof getAuth> | null = null;

export const getFirebaseAuth = () => {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(authStorage),
    });
  } catch {
    authInstance = getAuth(app);
  }
  return authInstance;
};

export const authApi = {
  register: (email: string, password: string) =>
    createUserWithEmailAndPassword(getFirebaseAuth(), email, password),

  login: (email: string, password: string) =>
    signInWithEmailAndPassword(getFirebaseAuth(), email, password),

  logout: () => signOut(getFirebaseAuth()),

  resetPassword: (email: string) =>
    sendPasswordResetEmail(getFirebaseAuth(), email),

  updateDisplayName: (user: User, name: string) =>
    updateProfile(user, {displayName: name}),

  subscribe: (callback: (user: User | null) => void) =>
    onAuthStateChanged(getFirebaseAuth(), callback),

  currentUser: () => getFirebaseAuth().currentUser,
};
