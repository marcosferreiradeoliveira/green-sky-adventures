import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import express from 'express';

// Initialize Firebase Admin
initializeApp();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Create Express app for health checks
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
    
    console.log('Recebida requisição para enviar email:', { 
      auth: auth,
      data: { 
        to: data.to,
        friendName: data.friendName ? 'Fornecido' : 'Não fornecido',
        couponCode: data.couponCode ? 'Fornecido' : 'Não fornecido',
        senderName: data.senderName ? 'Fornecido' : 'Não fornecido',
        message: data.message ? 'Fornecido' : 'Não fornecido'
      }
    });

    // Check if the request is authenticated
    // if (!auth) {
    //   console.error('Usuário não autenticado');
    //   throw new HttpsError(
    //     'unauthenticated',
    //     'Você precisa estar logado para enviar um presente.'
    //   );
    // }

    const { to, friendName, couponCode, senderName, message } = data;

    // // Validate required fields
    // if (!to || !couponCode) {
    //   const errorMsg = 'E-mail do destinatário e código do cupom são obrigatórios.';
    //   console.error(errorMsg, { to, couponCode });
    //   throw new HttpsError(
    //     'invalid-argument',
    //     errorMsg
    //   );
    // }

    try {
      // Email options
      const mailOptions = {
        from: `"Green Sky Adventures" <${process.env.GMAIL_EMAIL}>`,
        to: to,
        subject: `${senderName || 'Alguém'} te enviou um voo duplo de presente!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Parabéns, ${friendName || 'Amigo(a)'}!</h1>
            <p>${senderName || 'Um amigo'} te enviou um voo duplo de presente na Green Sky Adventures!</p>
            
            ${message ? `<blockquote style="background: #f9f9f9; border-left: 10px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
              <p>${message}</p>
            </blockquote>` : ''}
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h2>Seu Código de Cupom</h2>
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 15px 0;">${couponCode}</div>
              <p>Validade: 6 meses a partir de hoje</p>
            </div>
            
            <p>Para resgatar seu voo, acesse:</p>
            <a href="https://greenskyadventures.com.br/resgatar?code=${encodeURIComponent(couponCode)}" 
              style="display: inline-block; background: #0066cc; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
              Resgatar Meu Voo Duplo
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Este é um e-mail automático, por favor não responda. Se precisar de ajuda, entre em contato com nosso suporte.
            </p>
          </div>
        `
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', info.messageId);
      
      // Log the email sending
      const logEntry = {
        to,
        template: 'gift-flight',
        couponCode,
        sentAt: initializeApp().firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        provider: 'gmail-smtp',
        messageId: info.messageId,
        senderId: auth.uid
      };
      
      await initializeApp().firestore().collection('emailLogs').add(logEntry);
      
      return { success: true, message: 'E-mail enviado com sucesso!', messageId: info.messageId };
      
    } catch (error) {
      console.error('Erro na função sendGiftEmail:', error);
      
      // Log the error
      await initializeApp().firestore().collection('emailLogs').add({
        to: data.to,
        template: 'gift-flight',
        couponCode: data.couponCode,
        error: error.toString(),
        sentAt: initializeApp().firestore.FieldValue.serverTimestamp(),
        status: 'failed',
        provider: 'gmail-smtp',
        senderId: auth?.uid
      });

      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        'internal',
        'Ocorreu um erro inesperado ao processar sua solicitação.',
        { error: error.message }
      );
    }
  }
);

// Export the Express app for Cloud Run
export const api = onRequest({ region: 'us-central1' }, app);
