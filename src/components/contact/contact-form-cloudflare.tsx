"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

// Form values type
type FormValues = z.infer<typeof formSchema>;

export function ContactFormCloudflare() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

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

  // Function to add debug logs
  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
    console.log(`[Contact Form] ${message}`); // Also log to console for easier debugging
  };

  // Function to check network connectivity
  const checkNetworkStatus = () => {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType: string;
        saveData: boolean;
      }
    };

    const status = {
      online: nav.onLine,
      connectionType: nav.connection ? nav.connection.effectiveType : 'unknown',
      saveData: nav.connection ? nav.connection.saveData : false
    };

    addDebugLog(`Network status: ${JSON.stringify(status)}`);
    return status;
  };

  // Main form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setDebugLogs([]); // Clear previous debug logs

    addDebugLog('Form submitted, preparing data...');

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

    // Prepare the submission data
    const submissionData = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      userAgent: navigator.userAgent,
      source: 'website_contact_form_cloudflare'
    };

    addDebugLog(`Submission data prepared: ${JSON.stringify({
      name: data.name,
      email: data.email,
      subject: data.subject,
      messageLength: data.message.length
    })}`);

    try {
      // Log the current origin for debugging
      if (typeof window !== 'undefined') {
        addDebugLog(`Current origin: ${window.location.origin}`);
      }

      // Create a timeout promise
      addDebugLog("Setting up submission with 15-second timeout...");
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out after 15 seconds'));
        }, 15000);
      });

      // Submit to Cloudflare Pages Function
      addDebugLog('Submitting to Cloudflare Pages Function...');

      // Set up the fetch request
      const fetchPromise = fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      }).then(async (response) => {
        addDebugLog(`Response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          addDebugLog(`API error: ${JSON.stringify(errorData)}`);
          throw new Error(`API error: ${response.status} ${errorData.message || ''}`);
        }

        return response.json();
      });

      // Race between the fetch operation and the timeout
      addDebugLog("Starting request with timeout...");
      const responseData = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]);

      // Success!
      addDebugLog(`Successfully submitted form with ID: ${responseData.id}`);

      // Show success message
      setIsSuccess(true);

      // Reset form
      reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error submitting form:', err);
      addDebugLog(`ERROR: ${err.message}`);

      // Default user-friendly error message
      let userMessage = 'There was an error submitting your message. Please try again or contact me directly via email.';

      // Check for specific error types
      if (err.message.includes('timeout') || err.message.includes('timed out')) {
        userMessage = 'The request timed out. Please try the email option below.';
        addDebugLog('Detected timeout error - suggesting email fallback');
      } else if (err.message.includes('network') || err.message.includes('connection')) {
        userMessage = 'Network connection error. Please check your internet connection or use the email option below.';
        addDebugLog('Detected network error - suggesting email fallback');
      }

      // Set the error message for the user
      setErrorMessage(userMessage);

      // Log the full error for debugging
      addDebugLog(`Full error object: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug panel component - only shows in development
  const DebugPanel = () => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development' || debugLogs.length === 0) return null;

    return (
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-xs font-mono mb-4 max-h-40 overflow-y-auto">
        <div className="font-semibold mb-1 text-yellow-800 dark:text-yellow-300">Debug Logs (Development Only):</div>
        {debugLogs.map((log, i) => (
          <div key={i} className="text-xs text-yellow-700 dark:text-yellow-400">{log}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <DebugPanel />

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">Message Sent!</h3>
          <p className="text-green-700 dark:text-green-400">
            Thank you for your message. I'll get back to you as soon as possible.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Unable to Send Message
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {errorMessage}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setErrorMessage(null)}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
                className={errors.name ? "border-red-300 dark:border-red-700" : ""}
              />
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                {...register("email")}
                className={errors.email ? "border-red-300 dark:border-red-700" : ""}
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              placeholder="Message subject"
              {...register("subject")}
              className={errors.subject ? "border-red-300 dark:border-red-700" : ""}
            />
            {errors.subject && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Your message"
              rows={6}
              {...register("message")}
              className={errors.message ? "border-red-300 dark:border-red-700" : ""}
            />
            {errors.message && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

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
      )}
    </div>
  );
}
