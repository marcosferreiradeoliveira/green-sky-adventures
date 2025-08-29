import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import { getFunctions } from 'firebase-admin/functions';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Firebase config endpoint
app.get('/firebase-config', (req, res) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
  
  // In development, use environment variables directly
  if (process.env.NODE_ENV === 'development') {
    return res.json(config);
  }
  
  // In production, use Firebase Functions config
  const functionsConfig = getFunctions().config();
  res.json({
    apiKey: functionsConfig.app?.firebase_api_key || config.apiKey,
    authDomain: functionsConfig.app?.auth_domain || config.authDomain,
    projectId: functionsConfig.app?.project_id || config.projectId,
    storageBucket: functionsConfig.app?.storage_bucket || config.storageBucket,
    messagingSenderId: functionsConfig.app?.messaging_sender_id || config.messagingSenderId,
    appId: functionsConfig.app?.app_id || config.appId,
    measurementId: functionsConfig.app?.measurement_id || config.measurementId
  });
});

// Your API routes will go here
app.post('/sendGiftEmail', async (req, res) => {
  try {
    const { data, auth } = req.body;
    
    if (!auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Your email sending logic here
    console.log('Sending email with data:', data);
    
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Export the Express app as a Cloud Function
export const api = onRequest({
  region: 'southamerica-east1',
  minInstances: 0,
  maxInstances: 10,
  memory: '256MB',
  timeoutSeconds: 60,
}, app);

// For local development with Firebase Emulator
if (process.env.FUNCTIONS_EMULATOR) {
  console.log('Running in Firebase Emulator mode');
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
