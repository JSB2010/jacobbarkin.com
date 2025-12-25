// Custom Appwrite client with CORS workarounds
import { Client, Databases, ID } from 'appwrite';

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function(event) {
    console.error('UNHANDLED PROMISE REJECTION:', event.reason);

    // Try to get more details if it's an Appwrite error
    if (event.reason && typeof event.reason === 'object') {
      if ('code' in event.reason) {
        console.error('Error code:', (event.reason as any).code);
      }
      if ('type' in event.reason) {
        console.error('Error type:', (event.reason as any).type);
      }
      if ('message' in event.reason) {
        console.error('Error message:', (event.reason as any).message);
      }
      if ('response' in event.reason) {
        console.error('Error response:', (event.reason as any).response);
      }
    }
  });
}

// Initialize Appwrite client
const createClient = () => {
  const client = new Client();

  // Configure Appwrite client
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6816ef35001da24d113d');

  // Set response format to 1.0.0 for better compatibility
  try {
    // Use type assertion to access setHeader if it exists on the client
    const clientWithHeaders = client as unknown as { setHeader?: (key: string, value: string) => void };
    if (typeof clientWithHeaders.setHeader === 'function') {
      clientWithHeaders.setHeader('X-Appwrite-Response-Format', '1.0.0');
    } else {
      console.warn('Appwrite client.setHeader method not available - skipping custom headers');
    }
  } catch (error) {
    console.warn('Error setting Appwrite headers:', error);
  }

  return client;
};

// Create client and services
const client = createClient();
const databases = new Databases(client);

// Database and collection IDs
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'contact-form-db';
const contactSubmissionsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID || 'contact-submissions';

// Function to submit a contact form
export async function submitContactForm(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  [key: string]: any;
}) {
  try {
    // Log submission attempt with environment info
    console.log('Contact form submission attempt:', {
      environment: process.env.NODE_ENV,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'defined' : 'undefined',
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId: process.env.NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID,
      origin: typeof window !== 'undefined' ? window.location.origin : 'server-side'
    });

    // Only include fields that are explicitly defined in the Appwrite collection schema
    // Based on the error, we need to be very careful about field names
    const submissionData = {
      name: data.name,
      email: data.email,
      subject: data.subject || 'Contact Form Submission',
      message: data.message
      // Remove timestamp, userAgent, and source as they might not match the schema exactly
    };

    console.log('Submitting data to Appwrite:', {
      databaseId,
      collectionId: contactSubmissionsCollectionId,
      data: submissionData
    });

    // Create document in Appwrite
    const document = await databases.createDocument(
      databaseId,
      contactSubmissionsCollectionId,
      ID.unique(),
      submissionData
    );

    console.log('Form submission successful:', document.$id);

    return {
      success: true,
      id: document.$id,
      message: 'Form submitted successfully'
    };
  } catch (error) {
    // Log detailed error information
    console.error('Error submitting contact form:', error);

    // Get more details about the error
    let errorDetails = 'Unknown error';
    let errorCode = 'unknown';

    if (error instanceof Error) {
      errorDetails = error.message;
      // Check for Appwrite specific error properties
      if ('code' in error) {
        errorCode = (error as any).code;
      }
      if ('type' in error) {
        errorDetails += ` (Type: ${(error as any).type})`;
      }
      if ('response' in error) {
        console.error('Appwrite error response:', (error as any).response);
      }
    }

    return {
      success: false,
      error: errorDetails,
      errorCode,
      message: 'Failed to submit form. Please try again or contact us directly via email.'
    };
  }
}

export { client, databases, databaseId, contactSubmissionsCollectionId };
