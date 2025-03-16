import sendEmail from './send-email';
import fs from 'fs';
import path from 'path';
import { formatMessage } from '@/lib/util';

const domain = process.env.NEXT_PUBLIC_APP_URL;

const loadTemplate = (
  templateName: string,
  replacements: { [key: string]: string },
): string | null => {
  const templatePath = path.join(
    process.cwd(),
    'public',
    'templates',
    `${templateName}.html`,
  );

  try {
    let template = fs.readFileSync(templatePath, 'utf-8');
    for (const key in replacements) {
      template = template.replace(
        new RegExp(`{{${key}}}`, 'g'),
        replacements[key],
      );
    }
    return template;
  } catch (error) {
    console.error('Error reading template file:', error);
    return null;
  }
};

export const sendVerificationEmail = async (
  email: string,
  code: string,
  messages: Record<string, any>,
): Promise<boolean> => {
  const subject = formatMessage(messages.email.verification.subject, {
    AppName: messages.AppName,
  });
  const greeting = messages.email.verification.greeting;
  const message = messages.email.verification.message;
  const instructions = messages.email.verification.instructions;
  const footer = messages.email.verification.footer;

  const html = loadTemplate('verification', {
    code,
    subject,
    greeting,
    message,
    instructions,
    footer,
  });

  if (!html) {
    console.error('Failed to load email template.');
    return false;
  }

  const res = await sendEmail(email, subject, html);
  return res;
};

// export const sendPasswordResetEmail = async (email: string, token: string) => {
//     const resetLink = `${domain}/auth/new-password?token=${token}`;

//     await sendEmail(email, 'Reset your password', `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`);
// };

// export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
//     await sendEmail(email, '2FA Code', `<p>Your 2FA code: ${token}</p>`);
// };
