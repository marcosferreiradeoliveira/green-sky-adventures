import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, logEvent, setUserProperties, setUserId, isSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { Analytics, EventParams } from "firebase/analytics";

let app: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

async function getFirebaseConfig() {
  // Debug log all environment variables
  console.log('Environment variables:', {
    VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: !!import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_MEASUREMENT_ID: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    NODE_ENV: import.meta.env.MODE
  });

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  // Validate required config
  const missingKeys = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error('Missing Firebase config values:', missingKeys);
    console.error('Current config:', config);
    throw new Error(`Missing Firebase config values: ${missingKeys.join(', ')}`);
  }

  return config;
}

export async function initializeFirebase() {
  try {
    if (getApps().length === 0) {
      console.log('Initializing Firebase...');
      const firebaseConfig = await getFirebaseConfig();
      app = initializeApp(firebaseConfig);
      
      // Initialize services
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Initialize analytics if supported
      if (typeof window !== 'undefined' && await isSupported()) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      }
      console.log('Firebase initialized successfully');
    } else {
      app = getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      if (typeof window !== 'undefined' && await isSupported()) {
        analytics = getAnalytics(app);
      }
    }
    
    return { app, auth, db, storage, analytics };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

// Track page views
export function logPageView(pageTitle: string, pagePath: string) {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: pageTitle,
      page_path: pagePath,
    });
  }
}

// Track custom events
export function trackEvent(eventName: string, params?: EventParams) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

// Initialize Firebase and export a promise that resolves when ready
export const firebaseInit = initializeFirebase();

// Export the initialized services
export { app, auth, db, storage, analytics };