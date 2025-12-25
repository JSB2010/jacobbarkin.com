'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Save, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

export function PersistentContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);
  const { toast } = useToast();

  // Initial form values
  const initialValues = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  // Use enhanced form persistence hook
  const {
    formData,
    updateFormData,
    resetFormData,
    saveForm,
    isDirty,
    lastSaved,
    expiresAt,
    getTimeRemaining
  } = useFormPersistence<FormValues>(
    'contact-form',
    initialValues,
    {
      expiryMinutes: 60,
      saveOnUnload: true,
      confirmOnUnload: true,
      confirmationMessage: "You have unsaved changes in your contact form. Are you sure you want to leave?",
      onRestore: () => {
        toast({
          title: 'Form Restored',
          description: 'Your previously saved form data has been restored.',
          variant: 'default',
        });
      }
    }
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    trigger,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    mode: 'onChange', // Enable real-time validation
  });

  // Set form values from persisted data on mount
  useEffect(() => {
    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof FormValues, value);
    });

    // Trigger validation after setting values
    trigger();
  }, [formData, setValue, trigger]);

  // Update time remaining display
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimeRemaining = () => {
      setTimeRemaining(getTimeRemaining());
    };

    // Update immediately
    updateTimeRemaining();

    // Then update every minute
    const intervalId = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(intervalId);
  }, [expiresAt, getTimeRemaining]);

  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const hours = Math.floor(diffMins / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Submit form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit form');
      }

      // Show success toast
      toast({
        title: 'Message Sent',
        description: 'Thank you for your message. I will get back to you soon!',
        variant: 'default',
      });

      // Reset form and persisted data
      reset(initialValues);
      resetFormData();
    } catch (error) {
      console.error('Error submitting form:', error);

      // Show error toast with more specific message
      toast({
        title: 'Error',
        description: error instanceof Error
          ? error.message
          : 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update persisted data when form values change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value } as Partial<FormValues>);
  };

  // Watch all form values for real-time validation
  const watchedValues = watch();

  // Manually save form data
  const handleSaveForm = () => {
    if (saveForm()) {
      toast({
        title: 'Form Saved',
        description: 'Your form data has been saved locally.',
        variant: 'default',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Get In Touch</CardTitle>
            <CardDescription>
              Fill out the form below to send me a message. Your form data is saved locally for 60 minutes in case you need to navigate away.
            </CardDescription>
          </div>

          {/* Form status indicators */}
          {lastSaved && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeRemaining && `${timeRemaining.minutes}m remaining`}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last saved: {formatLastSaved()}</p>
                  {timeRemaining && (
                    <p>Expires in: {timeRemaining.minutes} minutes</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              {...register('name')}
              onChange={handleChange}
              placeholder="Your name"
              className={errors.name ? 'border-red-500' : watchedValues.name?.length >= 2 ? 'border-green-500' : ''}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name.message}
              </p>
            )}
            {!errors.name && watchedValues.name?.length >= 2 && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Looks good!
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
              {...register('email')}
              onChange={handleChange}
              placeholder="Your email address"
              className={errors.email ? 'border-red-500' : watchedValues.email && !errors.email ? 'border-green-500' : ''}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.email.message}
              </p>
            )}
            {!errors.email && watchedValues.email && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Valid email format
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              {...register('subject')}
              onChange={handleChange}
              placeholder="Message subject"
              className={errors.subject ? 'border-red-500' : watchedValues.subject?.length >= 5 ? 'border-green-500' : ''}
              aria-invalid={errors.subject ? 'true' : 'false'}
            />
            {errors.subject && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.subject.message}
              </p>
            )}
            {!errors.subject && watchedValues.subject?.length >= 5 && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Good subject line
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              {...register('message')}
              onChange={handleChange}
              placeholder="Your message"
              className={`min-h-[150px] ${errors.message ? 'border-red-500' : watchedValues.message?.length >= 10 ? 'border-green-500' : ''}`}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.message.message}
              </p>
            )}
            {!errors.message && watchedValues.message?.length >= 10 && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Message looks good
              </p>
            )}
            {watchedValues.message && (
              <p className="text-xs text-muted-foreground">
                Character count: {watchedValues.message.length}
                {watchedValues.message.length < 10 && ` (need at least ${10 - watchedValues.message.length} more)`}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset(initialValues);
                  resetFormData();
                  toast({
                    title: 'Form Cleared',
                    description: 'The form has been reset.',
                    variant: 'default',
                  });
                }}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveForm}
                disabled={isSubmitting || !isDirty}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Your data is stored locally in your browser and is not sent anywhere until you submit the form.
          {lastSaved && ` Last saved: ${formatLastSaved()}.`}
        </p>
      </CardFooter>
    </Card>
  );
}
