"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

// Form values type
type FormValues = z.infer<typeof formSchema>;

export function ContactFormMailto() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Watch form values for the mailto link
  const name = watch('name');
  const email = watch('email');
  const subject = watch('subject');
  const message = watch('message');

  // Generate mailto link
  const generateMailtoLink = (data: FormValues) => {
    const mailtoSubject = encodeURIComponent(`Contact Form: ${data.subject}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    );
    return `mailto:Jacobsamuelbarkin@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  // Main form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Generate mailto link
      const mailtoLink = generateMailtoLink(data);
      
      // Open mailto link
      window.location.href = mailtoLink;
      
      // Show success message
      setIsSuccess(true);
      
      // Reset form
      reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error opening mailto link:', error);
      setErrorMessage('There was an error opening your email client. Please try again or copy the message and send it manually.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">Email Client Opened!</h3>
          <p className="text-green-700 dark:text-green-400 mb-4">
            Your email client should have opened with a pre-filled message. Please send the email to complete your message submission.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSuccess(false)}
            className="mt-2"
          >
            Return to Form
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Unable to Open Email Client
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
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Opening Email Client...
                </>
              ) : (
                <>
                  <Mail className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Send via Email
                </>
              )}
            </Button>
            
            {/* Direct mailto link as an alternative */}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              onClick={() => {
                if (name && email && subject && message) {
                  window.location.href = generateMailtoLink({
                    name,
                    email,
                    subject,
                    message
                  });
                } else {
                  window.location.href = "mailto:Jacobsamuelbarkin@gmail.com";
                }
              }}
            >
              <Mail className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Open Email Client Directly
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              About This Form
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              This form will open your default email client with a pre-filled message. You'll need to click "Send" in your email client to complete the submission.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
