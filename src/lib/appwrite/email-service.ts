// Email service for contact form submissions

// Types for email service
interface EmailData {
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
 * Format email body for contact form submission
 */
export function formatEmailBody(data: EmailData): string {
  return `
New contact form submission:

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject || 'Contact Form Submission'}

Message:
${data.message}

Timestamp: ${data.timestamp || new Date().toISOString()}
Source: ${data.source || 'website_contact_form'}
IP Address: ${data.ipAddress || 'Unknown'}
User Agent: ${data.userAgent || 'Unknown'}
`;
}

/**
 * Send email notification for contact form submission
 * This function will be called from the API route
 */
export async function sendContactFormEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, you would use an email service
    // For now, we'll just log the email content
    console.log('Email notification would be sent with the following content:');
    console.log(formatEmailBody(data));
    
    // Return success
    return {
      success: true,
      message: 'Email notification would be sent (simulated)'
    };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * This function will be implemented later with an actual email service
 * or using Appwrite Functions for sending emails
 */
export async function sendEmailWithAppwrite(data: EmailData): Promise<{ success: boolean; message: string }> {
  // This is a placeholder for future implementation
  // You can implement this using Appwrite Functions or a third-party email service
  return sendContactFormEmail(data);
}
