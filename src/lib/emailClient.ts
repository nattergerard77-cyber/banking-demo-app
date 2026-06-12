import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  const response = await resend.emails.send({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments || [],
  });

  if (response.error) {
    throw new Error(response.error.message ?? "Resend API error");
  }

  console.log("[EMAIL SENT]", {
    to: options.to,
    subject: options.subject,
    messageId: response.data.id,
    status: "success",
  });

  return response.data;
}
