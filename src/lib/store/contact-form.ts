import { create } from 'zustand';
import { z } from 'zod';
import { contactFormSchema } from '@/lib/db/submissions';

// Submission method enum (simplified)
export enum SubmissionMethod {
  API = 'api',
  EMAIL = 'email',
}

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
  submitForm: (config?: { method?: SubmissionMethod }) => Promise<void>;
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

      // Prepare submission data
      const submissionData = {
        name: values.name,
        email: values.email,
        subject: values.subject || 'Contact Form Submission',
        message: values.message
      };

      addDebugLog(`Submitting form using method: ${config.method || 'API'}`);

      // Submit to the API endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch('/api/contact-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (response.ok && result.success) {
          addDebugLog(`Form submitted successfully with ID: ${result.id}`);

          // Update state on success
          set({
            isSuccess: true,
            isSubmitting: false,
            errorMessage: null,
          });

          // Reset form after success
          setTimeout(() => {
            set({
              values: { name: '', email: '', subject: '', message: '' },
              isSuccess: false,
            });
          }, 5000);
        } else {
          addDebugLog(`Form submission failed: ${result.message || result.error}`);

          set({
            isSuccess: false,
            isSubmitting: false,
            errorMessage: result.message || "We're having trouble submitting your message. Please try the email fallback below.",
          });
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        addDebugLog(`ERROR: API call failed: ${errorMsg}`);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          set({
            isSuccess: false,
            isSubmitting: false,
            errorMessage: "Request timed out. Please try the email fallback below.",
          });
        } else {
          set({
            isSuccess: false,
            isSubmitting: false,
            errorMessage: "We're having trouble connecting to our server. Please try the email fallback below.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addDebugLog(`ERROR in form submission: ${errorMessage}`);

      console.error('Unexpected error in form submission', error);

      set({
        isSuccess: false,
        isSubmitting: false,
        errorMessage: "We're having trouble processing your message. Please try the email fallback below.",
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