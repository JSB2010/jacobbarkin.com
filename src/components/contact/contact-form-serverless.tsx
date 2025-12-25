'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactFormServerless() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false); // Set to false to hide debug panel in production

  // Function to add a log message to the debug panel
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS format
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev, logMessage]);
  };

  const {
    register,
    handleSubmit,
    reset,
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

  // Function to check network connectivity
  const checkNetworkStatus = () => {
    const status = {
      online: navigator.onLine,
      connectionType: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown',
      saveData: (navigator as any).connection ? (navigator as any).connection.saveData : false
    };

    addDebugLog(`Network status: ${JSON.stringify(status)}`);
    return status;
  };

  // Helper function to handle successful form submission
  const handleSubmissionSuccess = (id: string) => {
    addDebugLog(`Form data saved successfully with ID: ${id}`);

    // Show success message
    setIsSuccess(true);

    // Reset form
    reset();

    // Hide success message after 5 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
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
        addDebugLog("ERROR: Device is offline. Cannot submit form.");
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

    // Set a timeout to prevent the form from being stuck in the submitting state
    const timeoutId = setTimeout(() => {
      addDebugLog("TIMEOUT: Form submission timed out after 10 seconds");
      setIsSubmitting(false);
      setErrorMessage("The request timed out. Please try again or contact me directly via email.");
    }, 10000); // 10 seconds timeout

    try {
      addDebugLog("Starting form submission process...");

      // Prepare the submission data
      const submissionData = {
        ...data,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        source: 'serverless_submission'
      };

      addDebugLog("Preparing to submit form to serverless function...");

      // Use the Pages API route
      const apiEndpoint = '/api/contact-unified';
      addDebugLog(`Submitting to API endpoint: ${apiEndpoint}`);

      // Set a timeout for the fetch operation
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => {
        addDebugLog("ERROR: API request timed out after 5 seconds");
        controller.abort();
      }, 5000);

      // Submit the form data to the serverless function
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
        signal: controller.signal
      });

      // Clear the fetch timeout
      clearTimeout(fetchTimeout);

      addDebugLog(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        addDebugLog(`ERROR: API returned error status: ${response.status}`);
        addDebugLog(`Error details: ${JSON.stringify(errorData)}`);
        throw new Error(`API error: ${response.status} ${errorData.message || ''}`);
      }

      const responseData = await response.json();
      addDebugLog(`SUCCESS: Form submitted successfully with ID: ${responseData.id}`);

      // Clear the main timeout since the request completed successfully
      clearTimeout(timeoutId);
      addDebugLog("Main timeout cleared");

      // Show success message
      handleSubmissionSuccess(responseData.id);
    } catch (error: any) {
      // Clear the timeout since we're handling the error
      clearTimeout(timeoutId);
      addDebugLog("Main timeout cleared due to error");

      addDebugLog(`FINAL ERROR HANDLER: ${error.message}`);

      // Set error message
      setErrorMessage(`There was an error submitting your message: ${error.message}. Please try again or contact me directly via email.`);

      // Log additional debugging information to the console
      console.error("Error submitting form:", error);
    } finally {
      // Ensure isSubmitting is set to false
      addDebugLog("Form submission process completed (success or failure)");
      setIsSubmitting(false);
    }
  };

  // Debug Panel Component
  const DebugPanel = () => {
    if (!showDebug) return null;

    return (
      <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Debug Panel (Serverless Version)</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDebugLogs([])}
              className="text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowDebug(false)}
              className="text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded"
            >
              Hide
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-2 rounded border border-yellow-200 dark:border-yellow-900 h-60 overflow-y-auto text-xs font-mono">
          {debugLogs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No logs yet. Submit the form to see debug information.</p>
          ) : (
            debugLogs.map((log, index) => {
              const logClass = log.includes('ERROR')
                ? 'text-red-600 dark:text-red-400'
                : log.includes('SUCCESS')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-800 dark:text-gray-200';

              return (
                <div key={`log-${index}`} className={`py-1 ${logClass}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>
        <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
          This debug panel is temporary and will be removed after troubleshooting.
        </p>
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
          placeholder="What's this about?"
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

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Unable to Send Message</h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                {errorMessage}
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setIsSubmitting(false);
                  }}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Try Again
                </button>
                <a
                  href={`mailto:Jacobsamuelbarkin@gmail.com?subject=${encodeURIComponent(
                    `Contact Form: ${(document.getElementById('subject') as HTMLInputElement | null)?.value ?? 'Message from website'}`
                  )}&body=${encodeURIComponent(
                    `Name: ${(document.getElementById('name') as HTMLInputElement | null)?.value ?? ''}\nEmail: ${(document.getElementById('email') as HTMLInputElement | null)?.value ?? ''}\n\nMessage:\n${(document.getElementById('message') as HTMLTextAreaElement | null)?.value ?? ''}`
                  )}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                >
                  Send via Email Instead
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-300 text-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Message Sent Successfully!</h3>
              <div className="mt-1 text-sm text-green-700 dark:text-green-400">
                Thank you for reaching out. I've received your message and will get back to you as soon as possible.
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full sm:w-auto h-9 sm:h-10 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
