import nodemailer from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
    const smtpFromName = process.env.SMTP_FROM_NAME || 'Raiffeisen';
    const defaultReplyTo = process.env.SMTP_REPLY_TO || smtpFromEmail;

    if (!smtpHost || !smtpUser || !smtpPassword || !smtpFromEmail) {
      throw new Error('SMTP configuration missing in environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const result = await transporter.sendMail({
      from: `${smtpFromName} <${smtpFromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || defaultReplyTo,
      attachments: options.attachments || [],
    });

    console.log(`[EMAIL SENT] To: ${maskEmail(options.to)} - MessageId: ${result.messageId}`);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[EMAIL ERROR] Failed to send email:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  const maskedName = name.substring(0, 2) + '*'.repeat(Math.max(0, name.length - 4)) + name.slice(-2);
  return `${maskedName}@${domain}`;
}
