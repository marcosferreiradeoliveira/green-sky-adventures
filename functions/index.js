import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
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
