import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';

const apiInstance = new TransactionalEmailsApi();

const apiKey = process.env.BREVO_API_KEY;

if (!apiKey) {
  console.error('[BREVO] ERROR: BREVO_API_KEY is not set in .env.local');
}

apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey || '');

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const attachments = options.attachments?.map((att) => ({
      name: att.filename,
      content: att.content.toString('base64'),
    }));

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html;
    sendSmtpEmail.textContent = options.text;
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'Banking App',
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
    };
    sendSmtpEmail.to = [{ email: options.to }];

    if (attachments && attachments.length > 0) {
      sendSmtpEmail.attachment = attachments;
    }

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    const messageId = result.body.messageId;

    console.log('[EMAIL SENT]', {
      to: options.to,
      subject: options.subject,
      messageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('[EMAIL ERROR]', {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
