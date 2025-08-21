import { httpsCallable, getFunctions } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

interface SendGiftEmailParams {
  friendEmail: string;
  friendName?: string;
  couponCode: string;
  senderName?: string;
  message?: string;
}

export const sendGiftEmail = async ({
  friendEmail,
  friendName = 'Amigo(a)',
  couponCode,
  senderName,
  message = ''
}: SendGiftEmailParams) => {
  try {
    const currentAuth = getAuth();
    const user = currentAuth.currentUser;
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Get the user's display name or email as fallback
    const senderDisplayName = senderName || user.displayName || user.email?.split('@')[0] || 'Um amigo';
    
    // Initialize Cloud Functions with the correct region
    const functions = getFunctions(app, 'southamerica-east1');
    
    // Call the Cloud Function to send the email
    const sendGiftEmailFunction = httpsCallable(functions, 'sendGiftEmail');
    const result = await sendGiftEmailFunction({
      to: friendEmail,
      friendName,
      couponCode,
      senderName: senderDisplayName,
      message
    });
    
    return { success: true, data: result.data };
    
  } catch (error: any) {
    console.error('Error sending gift email:', error);
    
    // Handle specific error cases
    let errorMessage = 'Não foi possível enviar o email. Tente novamente mais tarde.';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Você não tem permissão para enviar este email.';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'Você precisa estar logado para enviar um presente.';
    } else if (error.details) {
      errorMessage = error.details;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code || 'unknown_error'
    };
  }
};
