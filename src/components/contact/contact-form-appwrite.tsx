'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Query } from 'appwrite';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { databases, databaseId, contactSubmissionsCollectionId, submitContactForm } from '@/lib/appwrite/custom-client';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactFormAppwrite() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Function to add debug logs
  const addDebugLog = (message: string) => {
    setDebugLogs((prev) => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  // Function to check network status
  const checkNetworkStatus = () => {
    if (typeof navigator !== 'undefined') {
      return {
        online: navigator.onLine,
        connection: 'navigator' in window && 'connection' in navigator
          ? (navigator as any).connection?.effectiveType
          : 'unknown'
      };
    }
    return { online: true, connection: 'unknown' };
  };

  // Function to test Appwrite connection
  const testAppwriteConnection = async () => {
    addDebugLog('Testing Appwrite connection...');
    try {
      // Try to list documents (with a limit of 1) to test the connection
      const result = await databases.listDocuments(
        databaseId,
        contactSubmissionsCollectionId,
        [
          // Add a filter that will likely return no results but still test the connection
          // This avoids exposing actual submissions
          Query.equal('name', 'connection_test_' + Date.now()),
          Query.limit(1)
        ]
      );

      addDebugLog('✅ Appwrite connection successful!');
      addDebugLog(`Total documents: ${result.total} (filtered)`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugLog(`❌ Appwrite connection failed: ${errorMessage}`);

      if (error instanceof Error && 'code' in error) {
        const appwriteError = error as any;
        addDebugLog(`Error code: ${appwriteError.code}, type: ${appwriteError.type}`);
      }

      return false;
    }
  };

  // Debug panel component
  const DebugPanel = () => {
    if (!showDebug) return null;

    return (
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-auto max-h-60">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Debug Logs</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={async () => {
                addDebugLog('--- Testing Appwrite Connection ---');
                await testAppwriteConnection();
              }}
              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Test Connection
            </button>
            <button
              type="button"
              onClick={() => setDebugLogs([])}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
        </div>
        {debugLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No logs yet</p>
        ) : (
          <ul className="space-y-1">
            {debugLogs.map((log, index) => (
              <li key={index} className="break-all">{log}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Main form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setDebugLogs([]); // Clear previous debug logs

    // Check network status
    if (typeof window !== 'undefined') {
      const networkStatus = checkNetworkStatus();
      if (!networkStatus.online) {
        addDebugLog("ERROR: Device is offline. Cannot connect to Appwrite.");
        setErrorMessage("Your device appears to be offline. Please check your internet connection and try again.");
        setIsSubmitting(false);
        return;
      }
    }

    addDebugLog(`Form submission started with data: ${JSON.stringify({
      name: data.name,
      email: data.email,
      subject: data.subject,
      messageLength: data.message.length
    })}`);

    try {
      // Prepare the submission data
      const submissionData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        source: 'website_contact_form_appwrite'
      };

      addDebugLog(`Submission data prepared: ${JSON.stringify({
        name: data.name,
        email: data.email,
        subject: data.subject,
        messageLength: data.message.length
      })}`);

      // Use the custom Appwrite client directly
      addDebugLog("Preparing direct Appwrite SDK request...");

      // Set a timeout for the operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out after 15 seconds'));
        }, 15000);
      });

      // Create the Appwrite promise
      const appwritePromise = submitContactForm({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      });

      // Race the Appwrite request against the timeout
      addDebugLog("Sending request to Appwrite...");
      const result = await Promise.race([appwritePromise, timeoutPromise]) as { success: boolean; message: string; id?: string };

      addDebugLog(`Appwrite request completed: ${JSON.stringify(result)}`);

      if (!result.success) {
        throw new Error(result.message || 'Unknown error');
      }

      addDebugLog(`Form submitted successfully with ID: ${result.id}`);

      setIsSuccess(true);
      reset(); // Reset form fields

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      addDebugLog(`ERROR: ${errorMessage}`);

      // Add more detailed debugging for network errors
      if (errorMessage === 'Failed to fetch') {
        addDebugLog('Network error details:');
        addDebugLog(`- Current URL: ${window.location.href}`);
        addDebugLog(`- Appwrite endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'}`);
        addDebugLog(`- Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6816ef35001da24d113d'}`);
        addDebugLog(`- Database ID: ${databaseId}`);
        addDebugLog(`- Collection ID: ${contactSubmissionsCollectionId}`);

        setErrorMessage('Network error: Could not connect to Appwrite. This might be due to CORS restrictions or network connectivity issues. Please try again later or use the direct email option below.');
        setShowDebug(true); // Show debug panel automatically for network errors
      }
      // Check if it's a timeout error
      else if (errorMessage.includes('timed out')) {
        setErrorMessage('The request timed out. Please try again or use the direct email option below.');
      } else {
        setErrorMessage(`Error submitting form: ${errorMessage}`);
      }

      // Log more details if available
      if (error instanceof Error && 'code' in error) {
        const appwriteError = error as any;
        addDebugLog(`Appwrite error code: ${appwriteError.code}, type: ${appwriteError.type}`);

        // Handle specific Appwrite errors
        if (appwriteError.code === 401) {
          setErrorMessage('Authentication error. Please try again later.');
        } else if (appwriteError.code === 403) {
          setErrorMessage('Permission denied. The form is currently unavailable.');
        } else if (appwriteError.code === 429) {
          setErrorMessage('Too many requests. Please try again later.');
        } else if (appwriteError.code >= 500) {
          setErrorMessage('Server error. Please try again later or use the direct email option below.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct email link component as a fallback
  const DirectEmailLink = () => {
    // Generate mailto link - using form values from React Hook Form
    const generateMailtoLink = () => {
      // Use the watch function to get current form values safely
      const currentName = watch('name');
      const currentEmail = watch('email');
      const currentSubject = watch('subject');
      const currentMessage = watch('message');

      if (!currentName || !currentEmail) return 'mailto:Jacobsamuelbarkin@gmail.com';

      const mailtoSubject = encodeURIComponent(currentSubject || 'Contact Form');
      const mailtoBody = encodeURIComponent(
        `Name: ${currentName}\nEmail: ${currentEmail}\n\nMessage:\n${currentMessage || ''}`
      );
      return `mailto:Jacobsamuelbarkin@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    };

    return (
      <div className="mt-2 text-xs text-center">
        <p className="mb-1 text-muted-foreground">
          If you're having trouble with the form, you can also email me directly:
        </p>
        <a
          href={generateMailtoLink()}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jacobsamuelbarkin@gmail.com
        </a>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Debug Panel */}
      <DebugPanel />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="name" className="text-xs sm:text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            className={`h-9 sm:h-10 text-sm ${errors.name ? "border-red-500" : ""}`}
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="email" className="text-xs sm:text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Your email"
            className={`h-9 sm:h-10 text-sm ${errors.email ? "border-red-500" : ""}`}
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="subject" className="text-xs sm:text-sm font-medium">
          Subject
        </label>
        <Input
          id="subject"
          placeholder="Subject of your message"
          className={`h-9 sm:h-10 text-sm ${errors.subject ? "border-red-500" : ""}`}
          disabled={isSubmitting}
          {...register("subject")}
        />
        {errors.subject && (
          <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="message" className="text-xs sm:text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Your message..."
          rows={5}
          className={`min-h-[100px] sm:min-h-[120px] text-sm ${errors.message ? "border-red-500" : ""}`}
          disabled={isSubmitting}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
        )}
      </div>

      <div className="flex flex-col items-center space-y-3">
        {isSuccess ? (
          <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center justify-center text-green-700 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Message sent successfully! I'll get back to you soon.</span>
          </div>
        ) : errorMessage ? (
          <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex flex-col items-center text-red-700 dark:text-red-400 text-sm">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setDebugLogs([]);
                }}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Try Again
              </button>
              <a
                href={`mailto:Jacobsamuelbarkin@gmail.com?subject=${encodeURIComponent(
                  `Contact Form: ${watch('subject') ?? 'Message from website'}`
                )}&body=${encodeURIComponent(
                  `Name: ${watch('name') ?? ''}\nEmail: ${watch('email') ?? ''}\n\nMessage:\n${watch('message') ?? ''}`
                )}`}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Email Directly
              </a>
            </div>
          </div>
        ) : (
          <Button
            type="submit"
            className="w-full sm:w-auto min-w-[120px] h-10 sm:h-11"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        )}

        {/* Debug toggle button - visible in development and production for troubleshooting */}
        <div className="flex flex-col items-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setShowDebug(!showDebug);
              if (!showDebug) {
                // Add configuration info to debug logs when showing debug panel
                addDebugLog('Appwrite Configuration:');
                addDebugLog(`- Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'}`);
                addDebugLog(`- Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6816ef35001da24d113d'}`);
                addDebugLog(`- Database ID: ${databaseId}`);
                addDebugLog(`- Collection ID: ${contactSubmissionsCollectionId}`);
                addDebugLog(`- Environment: ${process.env.NODE_ENV}`);
              }
            }}
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>

          <div className="flex space-x-3">
            <a
              href="/test-form.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
            >
              Test Form
            </a>
            <a
              href="/test-functions.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
            >
              Test Functions
            </a>
            <a
              href="/test-sdk.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
            >
              Test SDK
            </a>
          </div>
        </div>

        {/* Direct email link as fallback */}
        <DirectEmailLink />
      </div>
    </form>
  );
}
