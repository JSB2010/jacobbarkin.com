// Cloudflare Pages Function for contact form submissions
// Uses Cloudflare D1 for storage and Resend for email notifications

import { Resend } from 'resend';

// CORS headers for cross-origin requests
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Handle OPTIONS request for CORS preflight
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers
  });
}

// Generate a unique ID
function generateId() {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get admin notification HTML
function getAdminNotificationHtml(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">New Contact Form Submission</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p><strong>From:</strong> ${data.name} (${data.email})</p>
    <p><strong>Subject:</strong> ${data.subject || 'Contact Form Submission'}</p>
    <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #6b7280;">
      Submitted: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>`;
}

export async function onRequest(context) {
  // Handle CORS preflight request
  if (context.request.method === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    console.log('Processing contact form submission...');

    // Get form data from request body
    const data = await context.request.json();
    const { name, email, subject, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and message are required' }),
        { status: 400, headers }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers }
      );
    }

    // Get client info
    const ipAddress = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = context.request.headers.get('user-agent') || 'unknown';

    // Generate submission ID
    const id = generateId();
    const now = new Date().toISOString();

    // Store in D1 database
    try {
      const db = context.env.DB;

      await db.prepare(
        `INSERT INTO contact_submissions (id, name, email, subject, message, status, priority, created_at, updated_at, ip_address, user_agent, source)
         VALUES (?, ?, ?, ?, ?, 'new', 1, ?, ?, ?, ?, 'website_contact_form')`
      ).bind(
        id,
        name,
        email,
        subject || 'Contact Form Submission',
        message,
        now,
        now,
        ipAddress,
        userAgent
      ).run();

      console.log(`Successfully stored submission with ID: ${id}`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB fails - we still want to send the email
    }

    // Send email notification via Resend
    try {
      const resendApiKey = context.env.RESEND_API_KEY;

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: 'Jacob Barkin <onboarding@resend.dev>',
          to: context.env.ADMIN_EMAIL || 'jacobsamuelbarkin@gmail.com',
          replyTo: email,
          subject: `New Contact Form Submission: ${subject || 'Contact Form Submission'}`,
          html: getAdminNotificationHtml({ name, email, subject, message }),
        });

        console.log('Email notification sent successfully');
      } else {
        console.log('RESEND_API_KEY not set, skipping email notification');
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails - the submission was still saved
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Form submitted successfully! I\'ll get back to you soon.',
        id: id
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Error processing contact form submission:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process form submission',
        message: error.message || 'An unexpected error occurred'
      }),
      { status: 500, headers }
    );
  }
}
