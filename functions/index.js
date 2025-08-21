const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Your Gmail App Password
  }
});

// Cloud Function to send gift email
exports.sendGiftEmail = onCall(
  { 
    enforceAppCheck: false,
    region: 'southamerica-east1'
  }, 
  async (request) => {
    const { data, auth } = request;
    
    logger.log('Recebida requisição para enviar email:', { 
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
    if (!auth) {
      logger.error('Usuário não autenticado');
      throw new HttpsError(
        'unauthenticated',
        'Você precisa estar logado para enviar um presente.'
      );
    }

    const { to, friendName, couponCode, senderName, message } = data;

    // Validate required fields
    if (!to || !couponCode) {
      const errorMsg = 'E-mail do destinatário e código do cupom são obrigatórios.';
      logger.error(errorMsg, { to, couponCode });
      throw new HttpsError(
        'invalid-argument',
        errorMsg
      );
    }

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
      logger.log('Email enviado com sucesso:', info.messageId);
      
      // Log the email sending
      const logEntry = {
        to,
        template: 'gift-flight',
        couponCode,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        provider: 'gmail-smtp',
        messageId: info.messageId,
        senderId: auth.uid
      };
      
      await admin.firestore().collection('emailLogs').add(logEntry);
      
      return { success: true, message: 'E-mail enviado com sucesso!', messageId: info.messageId };
      
    } catch (error) {
      logger.error('Erro na função sendGiftEmail:', error);
      
      // Log the error
      await admin.firestore().collection('emailLogs').add({
        to: data.to,
        template: 'gift-flight',
        couponCode: data.couponCode,
        error: error.toString(),
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
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
