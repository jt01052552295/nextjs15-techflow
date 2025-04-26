import sendEmail from './send-email';
import fs from 'fs';
import path from 'path';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

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
): Promise<boolean> => {
  const language = await ckLocale();

  const AppName = await __ts('common.AppName', {}, language);

  const subject = await __ts(
    'common.email.verification.subject',
    { AppName: AppName },
    language,
  );

  const greeting = await __ts(
    'common.email.verification.greeting',
    {},
    language,
  );
  const message = await __ts('common.email.verification.message', {}, language);

  const instructions = await __ts(
    'common.email.verification.instructions',
    {},
    language,
  );
  const footer = await __ts('common.email.verification.footer', {}, language);

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
