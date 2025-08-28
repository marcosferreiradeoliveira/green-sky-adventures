import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
const admin = initializeApp();

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN
});

// Create reusable transporter object using Gmail SMTP with OAuth2
async function createTransporter() {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.OAUTH_EMAIL,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });
  } catch (error) {
    console.error('Error creating OAuth2 client:', error);
    throw new Error('Failed to create email transporter');
  }
}

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Cloud Function to send gift email
export const sendGiftEmail = onCall(
  { 
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MB',
    minInstances: 0,
    maxInstances: 10,
    cors: true  // Enable CORS for this callable function
  },
  async (request) => {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError(
        'unauthenticated',
        'Você precisa estar autenticado para enviar um presente.'
      );
    }

    if (!data || !data.to || !data.couponCode) {
      throw new HttpsError(
        'invalid-argument',
        'E-mail do amigo e código do cupom são obrigatórios.'
      );
    }

    const { to, friendName = 'Amigo(a)', couponCode, senderName, message = '' } = data;
    const user = auth.uid ? await getAuth().getUser(auth.uid) : null;

    const emailText = `Olá ${friendName},\n\n` +
      `${senderName || 'Alguém'} te enviou um presente especial!\n\n` +
      `Mensagem: ${message || 'Um presente especial para você!'}\n\n` +
      `Código do cupom: ${couponCode}\n\n` +
      'Aproveite seu presente!\n' +
      'Atenciosamente,\nEquipe Green Sky';

    const mailOptions = {
      from: `"Green Sky" <${process.env.OAUTH_EMAIL}>`,
      to: to,
      subject: 'Você recebeu um presente especial!',
      text: emailText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá ${friendName},</h2>
          <p>${senderName || 'Alguém'} te enviou um presente especial!</p>
          <p>Mensagem: ${message || 'Um presente especial para você!'}</p>
          <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="font-size: 1.2em; font-weight: bold;">Código do cupom:</p>
            <p style="font-size: 1.5em; letter-spacing: 2px; color: #2e7d32;">${couponCode}</p>
          </div>
          <p>Aproveite seu presente!</p>
          <p>Atenciosamente,<br>Equipe Green Sky</p>
        </div>
      `
    };

    try {
      const transporter = await createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`E-mail enviado para ${to}`);
      return { success: true, message: 'E-mail enviado com sucesso!' };
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new HttpsError(
        'internal',
        'Ocorreu um erro ao enviar o e-mail. Por favor, tente novamente mais tarde.'
      );
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Export the Express app as an HTTP function
export const api = onRequest(app);

// Start the server if not in Firebase Functions environment
const PORT = process.env.FUNCTIONS_EMULATOR ? 8081 : 8080;
if (process.env.FUNCTIONS_EMULATOR || process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

// For local testing with Firebase Emulator
if (process.env.FUNCTIONS_EMULATOR) {
  console.log('Running in Firebase Emulator mode');
}
