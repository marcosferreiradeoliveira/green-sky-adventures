import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import express from 'express';

// Initialize Firebase Admin
const admin = initializeApp();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Create Express app
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Cloud Function to send gift email
export const sendGiftEmail = onCall(
  { 
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MB',
    minInstances: 0,
    maxInstances: 10
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
      from: `"Green Sky" <${process.env.GMAIL_EMAIL}>`,
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

// Only start the server if this is running locally (not in Cloud Functions environment)
if (process.env.FUNCTIONS_EMULATOR) {
  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

// Export the Express app for Cloud Run
export const api = onRequest({
  region: 'us-central1',
  minInstances: 0,
  maxInstances: 10,
  memory: '256MB',
  timeoutSeconds: 60,
  concurrency: 80,
  cpu: 1
}, app);
