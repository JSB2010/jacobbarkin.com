import { create } from 'zustand';
import { z } from 'zod';
import { contactFormSchema, logger } from '@/lib/appwrite';
import { submitContactForm as apiSubmitContactForm, SubmissionMethod, ContactFormConfig } from '@/lib/api/contact';

// Define the form state type
export type ContactFormState = {
  // Form values
  values: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };

  // Form validation errors
  errors: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    form?: string;
  };

  // Form submission state
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMessage: string | null;

  // Debug state (for development)
  debugLogs: string[];
  showDebug: boolean;

  // Actions
  setField: (field: keyof ContactFormState['values'], value: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  submitForm: (config?: Partial<ContactFormConfig>) => Promise<void>;
  addDebugLog: (message: string) => void;
  clearDebugLogs: () => void;
  toggleDebug: () => void;
};

// Create the store
export const useContactFormStore = create<ContactFormState>((set, get) => ({
  // Initial form values
  values: {
    name: '',
    email: '',
    subject: '',
    message: '',
  },

  // Initial errors state
  errors: {},

  // Initial submission state
  isSubmitting: false,
  isSuccess: false,
  errorMessage: null,

  // Initial debug state
  debugLogs: [],
  showDebug: process.env.NODE_ENV === 'development',

  // Action to set a field value
  setField: (field, value) => {
    set(state => ({
      values: {
        ...state.values,
        [field]: value,
      },
      // Clear error for this field when it's updated
      errors: {
        ...state.errors,
        [field]: undefined,
      },
    }));
  },

  // Action to reset the form
  resetForm: () => {
    set({
      values: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
      errors: {},
      isSuccess: false,
      errorMessage: null,
    });
  },

  // Action to validate the form
  validateForm: () => {
    const { values } = get();

    try {
      // Use the schema to validate the form values
      contactFormSchema.parse(values);

      // Clear errors if validation passes
      set({ errors: {} });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Extract and format validation errors
        const formattedErrors: Record<string, string> = {};
        const zodError = error as z.ZodError<unknown>;

        zodError.issues.forEach(err => {
          const field = err.path[0] as string;
          formattedErrors[field] = err.message;
        });

        // Update errors state
        set({ errors: formattedErrors });
      }

      return false;
    }
  },

  // Action to submit the form
  submitForm: async (config = {}) => {
    const { values, validateForm, addDebugLog } = get();

    // Validate form before submission
    if (!validateForm()) {
      addDebugLog('Form validation failed');
      return;
    }

    // Set submitting state
    set({ isSubmitting: true, errorMessage: null });
    addDebugLog('Form submission started');

    try {
      // Check network status first
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        addDebugLog('ERROR: Browser reports device is offline');
        set({
          isSubmitting: false,
          errorMessage: 'Network request failed: Your device appears to be offline. Please check your internet connection and try again.'
        });
        return;
      }

      // Prepare submission data with only the fields that exist in the Appwrite schema
      const submissionData = {
        name: values.name,
        email: values.email,
        subject: values.subject || 'Contact Form Submission',
        message: values.message
        // Remove all other fields to ensure exact match with Appwrite collection schema
      };

      // Default to Appwrite submission method if not specified
      const submissionConfig: Partial<ContactFormConfig> = {
        method: SubmissionMethod.APPWRITE,
        ...config,
      };

      addDebugLog(`Submitting form using method: ${submissionConfig.method}`);
      addDebugLog(`Appwrite endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not defined'}`);
      addDebugLog(`Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'Defined' : 'Not defined'}`);

      // Create a timeout promise
      const timeoutPromise = new Promise<{ success: false, message: string }>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out after 10 seconds'));
        }, 10000);
      });

      // Submit the form using the API with timeout
      try {
        // Try direct SDK submission first, then fall back to API if that fails
      let result;

      try {
        // Import the custom client directly
        const { submitContactForm: submitDirectly } = await import('@/lib/appwrite/custom-client');

        // Submit using the direct SDK method
        addDebugLog('Attempting direct SDK submission...');
        result = await Promise.race([
          submitDirectly(submissionData),
          timeoutPromise
        ]);

        if (result.success) {
          addDebugLog('Direct SDK submission successful!');
        } else {
          addDebugLog(`Direct SDK submission failed: ${result.message}`);
          addDebugLog('Falling back to API submission...');

          // Fall back to API submission
          result = await Promise.race([
            apiSubmitContactForm(submissionData, submissionConfig),
            timeoutPromise
          ]);
        }
      } catch (sdkError) {
        addDebugLog(`SDK submission error: ${sdkError instanceof Error ? sdkError.message : 'Unknown error'}`);
        addDebugLog('Falling back to API submission...');

        // Fall back to API submission
        result = await Promise.race([
          apiSubmitContactForm(submissionData, submissionConfig),
          timeoutPromise
        ]);
      }

        if (result.success) {
          addDebugLog(`Form submitted successfully with ID: ${result.id}`);

          // Update state on success
          set({
            isSuccess: true,
            isSubmitting: false,
            errorMessage: null,
          });

          // Reset success state after 5 seconds
          setTimeout(() => {
            set(state => ({
              isSuccess: false,
            }));
          }, 5000);
        } else {
          addDebugLog(`Form submission failed: ${result.message}`);
          if ('error' in result && result.error) {
            addDebugLog(`Error details: ${JSON.stringify(result.error)}`);
          }

          // Update state on error with a more user-friendly message
          set({
            isSuccess: false,
            isSubmitting: false,
            errorMessage: "We're having trouble submitting your message through our system. Please try using the 'Email Fallback' button below, or contact us directly via email.",
          });
        }
      } catch (innerError) {
        // Handle timeout or other promise rejection
        const errorMsg = innerError instanceof Error ? innerError.message : 'Unknown error in API call';
        addDebugLog(`ERROR: API call failed: ${errorMsg}`);

        set({
          isSuccess: false,
          isSubmitting: false,
          errorMessage: "We're having trouble connecting to our server. Please try the 'Email Fallback' option below, or contact us directly via email."
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addDebugLog(`ERROR in form submission: ${errorMessage}`);

      // Try to get more details about the error
      if (error instanceof Error) {
        addDebugLog(`Error name: ${error.name}`);
        addDebugLog(`Error stack: ${error.stack?.slice(0, 200)}...`);
      } else {
        addDebugLog(`Error type: ${typeof error}`);
        try {
          addDebugLog(`Error details: ${JSON.stringify(error)}`);
        } catch (e) {
          addDebugLog(`Error cannot be stringified`);
        }
      }

      // Log the error
      logger.error('Unexpected error in form submission', error);

      // Update state on error with a user-friendly message
      set({
        isSuccess: false,
        isSubmitting: false,
        errorMessage: "We're having trouble processing your message. Please try the 'Email Fallback' option below, or contact us directly via email.",
      });
    }
  },

  // Action to add a debug log
  addDebugLog: (message) => {
    // Always log to console regardless of environment
    console.log(`[ContactForm] ${message}`);

    // Only update state in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS format
    const logMessage = `[${timestamp}] ${message}`;

    set(state => ({
      debugLogs: [...state.debugLogs, logMessage],
    }));
  },

  // Action to clear debug logs
  clearDebugLogs: () => {
    set({ debugLogs: [] });
  },

  // Action to toggle debug panel
  toggleDebug: () => {
    set(state => ({
      showDebug: !state.showDebug,
    }));
  },
}));