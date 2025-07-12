import { send } from '@emailjs/nodejs';

export async function sendEmail(to: string, message: string) {
  const templateParams = {
    to_email: to,
    message: message,
    from_name: 'Zap Automation',
  };

  try {
    const response = await send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY!,
        privateKey: process.env.EMAILJS_PRIVATE_KEY!, // Required for server-side
      }
    );
    console.log('Email sent successfully:', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}