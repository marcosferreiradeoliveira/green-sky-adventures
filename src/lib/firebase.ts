// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, setUserProperties, setUserId, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Analytics, EventParams } from "firebase/analytics";

// Check if Firebase environment variables are available
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                          import.meta.env.VITE_FIREBASE_API_KEY;

// Default configuration for demo purposes
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEF123456",
};

// Your web app's Firebase configuration
const firebaseConfig = hasFirebaseConfig ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} : defaultConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services conditionally
let analytics: Analytics | null = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

// Initialize analytics if supported and in production
const initAnalytics = async () => {
  if (hasFirebaseConfig) {
    try {
      const isAnalyticsSupported = await isSupported();
      if (isAnalyticsSupported) {
        analytics = getAnalytics(app);
        // Set user properties if needed
        if (auth.currentUser) {
          setUserId(analytics, auth.currentUser.uid);
          setUserProperties(analytics, {
            user_type: 'visitor', // Will be updated after login
          });
        }
      }
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }
};

// Track page views
export const logPageView = (pageTitle: string, pagePath: string) => {
  if (!analytics) return;
  
  logEvent(analytics, 'page_view', {
    page_title: pageTitle,
    page_path: pagePath,
    page_location: window.location.href,
  });};

// Track custom events
export const trackEvent = (eventName: string, params?: EventParams) => {
  if (!analytics) return;
  
  logEvent(analytics, eventName, params);
};

// Initialize all services
try {
  initAnalytics();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase services initialization failed:", error);
}

export { app, analytics, auth, db, storage };