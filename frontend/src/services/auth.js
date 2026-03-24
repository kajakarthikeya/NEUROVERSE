import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const LOCAL_USER_KEY = 'neuroverse_user';
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function toLocalUser(email) {
  return {
    uid: email.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    email,
    displayName: email.split('@')[0],
  };
}

export function onAuthStateChangedSafe(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }

  const raw = window.localStorage.getItem(LOCAL_USER_KEY);
  callback(raw ? JSON.parse(raw) : null);
  return () => {};
}

export async function signInWithEmail(email, password) {
  if (isFirebaseConfigured && auth) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  if (!password || password.length < 6) {
    throw new Error('Use at least 6 characters for the demo password.');
  }

  const user = toLocalUser(email);
  window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  return user;
}

export async function signUpWithEmail(email, password) {
  if (isFirebaseConfigured && auth) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  const user = await signInWithEmail(email, password);
  return user;
}

export async function signInWithGoogle() {
  if (isFirebaseConfigured && auth) {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }

  throw new Error('Google sign-in requires Firebase to be configured and Google sign-in enabled in Firebase Authentication.');
}

export async function signOutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
    return;
  }

  window.localStorage.removeItem(LOCAL_USER_KEY);
}
