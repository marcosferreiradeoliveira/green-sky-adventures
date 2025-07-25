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

// Initialize services with null defaults
let analytics: Analytics | null = null;
let auth = getAuth(app);
let db = getFirestore(app);
let storage = getStorage(app);

// Initialize analytics if supported and in production
const initAnalytics = async () => {
  if (!hasFirebaseConfig) return null;
  
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
      return analytics;
    }
    return null;
  } catch (error) {
    console.error('Analytics initialization error:', error);
    return null;
  }
};

// Track page views
export const logPageView = (pageTitle: string, pagePath: string) => {
  if (!analytics) return;
  
  logEvent(analytics, 'page_view', {
    page_title: pageTitle,
    page_path: pagePath,
    page_location: window.location.href,
  });
};

// Track custom events
export const trackEvent = (eventName: string, params?: EventParams) => {
  if (!analytics) return;
  
  logEvent(analytics, eventName, params);
};

// Initialize Firebase services
const initFirebase = async () => {
  try {
    console.log('Initializing Firebase services...');
    
    // Initialize analytics (non-blocking)
    initAnalytics().then(analyticsInstance => {
      analytics = analyticsInstance;
      console.log('Analytics initialized:', analytics ? 'success' : 'not supported');
    }).catch(err => {
      console.error('Error initializing analytics:', err);
    });
    
    console.log('Firebase services initialized successfully');
    return { app, analytics, auth, db, storage };
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    // Return the services that did initialize successfully
    return { app, analytics, auth, db, storage };
  }
};

// Export a promise that resolves when Firebase is initialized
export const firebaseInit = initFirebase();

// Export the initialized services
export { app, analytics, auth, db, storage };