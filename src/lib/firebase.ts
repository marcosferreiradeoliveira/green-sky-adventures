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

// Get Firebase config from environment variables or use hardcoded values for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA56JZEDDDwuMIiTS2ijA9JQ_CoZfCXDyk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "green-sky-b545b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "green-sky-b545b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "green-sky-b545b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "714262247369",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:714262247369:web:7e9742ebfe351255e59a18",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NPTGGJE6VK"
};

// Validate required config on client side
if (typeof window !== 'undefined') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error('Missing Firebase config values:', missingKeys);
    throw new Error(`Missing Firebase config values: ${missingKeys.join(', ')}`);
  }
}

export async function initializeFirebase() {
  try {
    if (getApps().length === 0) {
      console.log('Initializing Firebase...');
      app = initializeApp(firebaseConfig);
      
      // Initialize services
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Initialize analytics if in browser and supported
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

let isInitialized = false;

export async function getFirebase() {
  if (!isInitialized) {
    await initializeFirebase();
    isInitialized = true;
  }
  return { app, auth, db, storage, analytics };
}

// Export the initialized services with null checks
export { auth, db, storage, analytics };