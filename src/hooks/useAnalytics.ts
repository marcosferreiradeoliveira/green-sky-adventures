import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView, trackEvent } from '@/lib/firebase';

/**
 * Hook to track page views and handle analytics events
 * @param pageTitle - The title of the current page
 */
export const useAnalytics = (pageTitle: string) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when the component mounts or location changes
    logPageView(pageTitle, location.pathname);
    
    // Track custom event for page view
    trackEvent('page_view', {
      page_title: pageTitle,
      page_path: location.pathname,
      page_location: window.location.href,
    });
  }, [location.pathname, pageTitle]);

  // Return the trackEvent function for custom events
  return { trackEvent };
};

/**
 * Common events to track throughout the application
 */
export const AnalyticsEvents = {
  // Auth events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Flight events
  SEARCH_FLIGHTS: 'search_flights',
  VIEW_FLIGHT_DETAILS: 'view_flight_details',
  CONTACT_PILOT: 'contact_pilot',
  BOOK_FLIGHT: 'book_flight',
  
  // Profile events
  UPDATE_PROFILE: 'update_profile',
  BECOME_PILOT: 'become_pilot',
  
  // Navigation
  NAVIGATE: 'navigate',
  
  // Error events
  ERROR: 'error',
};
