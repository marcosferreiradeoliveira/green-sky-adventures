import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, logEvent, setUserProperties, setUserId, isSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { Analytics, EventParams } from "firebase/analytics";

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

// Initialize Firebase immediately
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize analytics
let analytics: Analytics | null = null;

export async function initializeFirebase() {
  try {
    console.log('Firebase services initialized');
    
    // Initialize analytics if in browser and supported
    if (typeof window !== 'undefined' && await isSupported()) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    }
    
    return { app, auth, db, storage, analytics };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Don't throw error, just log it to prevent app crashes
    return { app, auth, db, storage, analytics: null };
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

// Export app for other services that need it
export { app };