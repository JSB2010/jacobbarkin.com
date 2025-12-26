/**
 * Resend Email Service
 * 
 * This module provides email sending functionality using Resend API.
 * Resend is a modern email API that works well with serverless environments.
 */

import { Resend } from "resend";

// Initialize Resend client (will use RESEND_API_KEY from environment)
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration - uses verified domain
const EMAIL_CONFIG = {
  from: "Jacob Barkin <contact@jacobbarkin.com>",
  adminEmail: "jacobsamuelbarkin@gmail.com",
  websiteName: "Jacob Barkin Portfolio",
};

// Email data interface
export interface EmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  timestamp?: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Send admin notification email when a contact form is submitted
 */
export async function sendAdminNotification(data: EmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.adminEmail,
      replyTo: data.email,
      subject: `New Contact Form Submission: ${data.subject || "Contact Form Submission"}`,
      html: getAdminNotificationHtml(data),
      text: getAdminNotificationText(data),
    });

    if (error) {
      console.error("Error sending admin notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send confirmation email to the user
 */
export async function sendUserConfirmation(data: EmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      subject: `Thank you for contacting ${EMAIL_CONFIG.websiteName}`,
      html: getUserConfirmationHtml(data),
      text: getUserConfirmationText(data),
    });

    if (error) {
      console.error("Error sending user confirmation:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error("Error sending user confirmation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send both admin notification and user confirmation
 */
export async function sendContactFormEmails(
  data: EmailData,
  sendUserCopy: boolean = false
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  // Send admin notification
  const adminResult = await sendAdminNotification(data);

  if (!adminResult.success) {
    return { success: false, messageId: undefined, error: adminResult.error };
  }

  // Optionally send user confirmation
  if (sendUserCopy) {
    await sendUserConfirmation(data);
  }

  return {
    success: true,
    messageId: adminResult.messageId,
  };
}

// HTML template for admin notification - email-friendly styling
function getAdminNotificationHtml(data: EmailData): string {
  const timestamp = data.timestamp || new Date().toISOString();
  const formattedDate = new Date(timestamp).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">📬 New Contact Form Submission</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${formattedDate}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

              <!-- Contact Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600;">From</span>
                          <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${data.name}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px;">
                          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600;">Email</span>
                          <p style="margin: 4px 0 0;"><a href="mailto:${data.email}" style="font-size: 16px; color: #3b82f6; text-decoration: none;">${data.email}</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Subject -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600;">Subject</span>
                <p style="margin: 8px 0 0; font-size: 18px; color: #1e293b; font-weight: 600;">${data.subject || "Contact Form Submission"}</p>
              </div>

              <!-- Message -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600;">Message</span>
                <div style="margin-top: 12px; padding: 20px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-wrap;">${data.message}</p>
                </div>
              </div>

              <!-- Reply Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 8px;">
                    <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject || 'Your message')}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">Reply to ${data.name}</a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <tr>
                  <td style="font-size: 12px; color: #94a3b8;">
                    <p style="margin: 0;">Source: ${data.source || "website_contact_form"}</p>
                    ${data.ipAddress ? `<p style="margin: 4px 0 0;">IP: ${data.ipAddress}</p>` : ''}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Branding -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Sent from <a href="https://jacobbarkin.com" style="color: #3b82f6; text-decoration: none;">jacobbarkin.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Plain text template for admin notification
function getAdminNotificationText(data: EmailData): string {
  return `New Contact Form Submission

From: ${data.name} (${data.email})
Subject: ${data.subject || "Contact Form Submission"}

Message:
${data.message}

---
Submitted: ${data.timestamp || new Date().toISOString()}
Source: ${data.source || "website_contact_form"}`;
}

// HTML template for user confirmation
function getUserConfirmationHtml(data: EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">Thank You for Reaching Out!</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${data.name},</p>
    <p>Thank you for contacting ${EMAIL_CONFIG.websiteName}. I have received your message and will get back to you as soon as possible.</p>
    <p><strong>Here's a copy of your message:</strong></p>
    <p><strong>Subject:</strong> ${data.subject || "Contact Form Submission"}</p>
    <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
    </div>
    <p>Best regards,<br>Jacob Barkin</p>
  </div>
</body>
</html>`;
}

// Plain text template for user confirmation
function getUserConfirmationText(data: EmailData): string {
  return `Hello ${data.name},

Thank you for contacting ${EMAIL_CONFIG.websiteName}. I have received your message and will get back to you as soon as possible.

Here's a copy of your message:

Subject: ${data.subject || "Contact Form Submission"}
Message:
${data.message}

Best regards,
Jacob Barkin`;
}

