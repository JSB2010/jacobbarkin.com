'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitContactForm, SubmissionMethod } from '@/lib/api/contact';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactFormNew() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Main form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Submit form data using the unified API with Appwrite as the submission method
      // Only pass the fields that are part of the contactFormSchema
      const result = await submitContactForm(
        {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        },
        { method: SubmissionMethod.APPWRITE }
      );

      if (!result.success) {
        // Handle error from the submitContactForm function
        console.error('Form submission failed:', result.message);
        setErrorMessage(result.message);
        return;
      }

      // Show success message
      setIsSuccess(true);
      reset(); // Reset form fields

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      // This catch block handles unexpected errors not caught by the submitContactForm function
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Unexpected form submission error:', errorMessage);

      // Set user-friendly error message
      if (errorMessage.includes('Network') || errorMessage.includes('connection')) {
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('schema') || errorMessage.includes('validation')) {
        setErrorMessage('There was an issue with the form data. Please check your inputs and try again.');
      } else {
        setErrorMessage(`Error submitting form: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct email link component as a fallback
  const DirectEmailLink = () => {
    // Function to handle email submission via the unified API
    const handleEmailSubmit = async () => {
      if (!watch('name') || !watch('email') || !watch('message')) {
        setErrorMessage('Please fill out the form before sending via email.');
        return;
      }

      setIsSubmitting(true);
      try {
        // Use the unified API with EMAIL method
        // Only pass the fields that are part of the contactFormSchema
        const result = await submitContactForm(
          {
            name: watch('name'),
            email: watch('email'),
            subject: watch('subject') || 'Contact Form Submission',
            message: watch('message')
          },
          { method: SubmissionMethod.EMAIL }
        );

        if (!result.success) {
          setErrorMessage(result.message);
        }
      } catch {
        setErrorMessage('Failed to open email client. Please try the direct link below.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="mt-4 text-sm text-center">
        <p className="mb-1 text-muted-foreground">
          If you're having trouble with the form, you can also email me directly:
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={handleEmailSubmit}
            className="text-primary hover:underline"
            disabled={isSubmitting}
          >
            Send via Email Client
          </button>
          <span className="hidden sm:inline text-muted-foreground">or</span>
          <a
            href="mailto:Jacobsamuelbarkin@gmail.com"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jacobsamuelbarkin@gmail.com
          </a>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            className={`h-10 ${errors.name ? "border-red-500" : ""}`}
            disabled={isSubmitting}
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Your email"
            className={`h-10 ${errors.email ? "border-red-500" : ""}`}
            disabled={isSubmitting}
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <Input
          id="subject"
          placeholder="Subject of your message"
          className={`h-10 ${errors.subject ? "border-red-500" : ""}`}
          disabled={isSubmitting}
          {...register("subject")}
          aria-invalid={errors.subject ? "true" : "false"}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Your message..."
          rows={5}
          className={`min-h-[120px] ${errors.message ? "border-red-500" : ""}`}
          disabled={isSubmitting}
          {...register("message")}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-xs text-red-500 mt-1">{errors.message.message}</p>
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
                onClick={() => setErrorMessage(null)}
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
            className="w-full sm:w-auto min-w-[120px] h-11"
            disabled={isSubmitting}
            aria-label="Send message"
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

        {/* Direct email link as fallback */}
        <DirectEmailLink />
      </div>
    </form>
  );
}
