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
  // Use environment variables for both development and production
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
}

export async function initializeFirebase() {
  try {
    if (getApps().length === 0) {
      const firebaseConfig = await getFirebaseConfig();
      app = initializeApp(firebaseConfig);
      
      // Initialize services
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      // Initialize analytics if supported
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    } else {
      app = getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    }
    
    return { app, auth, db, storage, analytics };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
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