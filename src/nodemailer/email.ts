import type { SendMailOptions, SentMessageInfo } from 'nodemailer';
import { sender, transporter } from './config.js';
import { CLIENT_URL } from '../app/constants.js';
import { passwordResetSuccessfulTemplate, passwordResetTemplate } from '../nodemailer/emailTemplates.js';

const COMPANY_NAME = 'Your Company';

export function sendPasswordResetEmail(
  {email, name, user_id}: {email: string, name: string, user_id: string},
  resetToken: string,
  callback: (err: Error | null, info: SentMessageInfo) => void
) {
  const mailOptions: SendMailOptions = {
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Password Reset 🔔',
    html: passwordResetTemplate(
      name,
      `${CLIENT_URL}/reset-password/?token=${resetToken}&id=${user_id}`,
      COMPANY_NAME
    ),
  };
  transporter.sendMail(mailOptions, callback);
}

export function sendPasswordResetSuccessfulEmail(
  email: string, name: string,
  callback: (err: Error | null, info: SentMessageInfo) => void
) {
  const mailOptions: SendMailOptions = {
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: '✅ Password Reset Successful',
    html: passwordResetSuccessfulTemplate(name, sender.name, COMPANY_NAME),
  };
  transporter.sendMail(mailOptions, callback);
}
