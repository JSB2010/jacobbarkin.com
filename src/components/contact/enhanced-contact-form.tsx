'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Loader2, CheckCircle, RefreshCw } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

export function EnhancedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Initial form values
  const initialValues = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };
  
  // Use form persistence hook
  const { formData, updateFormData, resetFormData } = useFormPersistence<FormValues>(
    'contact-form',
    initialValues,
    { expiryMinutes: 60 } // Expire after 60 minutes
  );
  
  // React Hook Form setup
  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });
  
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit form');
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
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form field changes
  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setValue(field, value);
    updateFormData({ [field]: value } as Partial<FormValues>);
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Get In Touch</CardTitle>
        <CardDescription>
          Fill out the form below to send me a message. Your form data is saved locally for 60 minutes in case you need to navigate away.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            label="Name"
            name="name"
            defaultValue={formData.name}
            error={errors.name?.message}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            validationRules={{
              required: true,
              minLength: 2
            }}
            validationMessages={{
              required: 'Please enter your name',
              minLength: 'Name must be at least 2 characters'
            }}
            placeholder="Your name"
            disabled={isSubmitting}
          />
          
          <FormField
            label="Email"
            name="email"
            type="email"
            defaultValue={formData.email}
            error={errors.email?.message}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            validationRules={{
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            }}
            validationMessages={{
              required: 'Please enter your email address',
              pattern: 'Please enter a valid email address'
            }}
            placeholder="Your email address"
            disabled={isSubmitting}
          />
          
          <FormField
            label="Subject"
            name="subject"
            defaultValue={formData.subject}
            error={errors.subject?.message}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            validationRules={{
              required: true,
              minLength: 5
            }}
            validationMessages={{
              required: 'Please enter a subject',
              minLength: 'Subject must be at least 5 characters'
            }}
            placeholder="Message subject"
            disabled={isSubmitting}
          />
          
          <FormField
            label="Message"
            name="message"
            multiline
            rows={6}
            defaultValue={formData.message}
            error={errors.message?.message}
            onChange={(e) => handleFieldChange('message', e.target.value)}
            validationRules={{
              required: true,
              minLength: 10
            }}
            validationMessages={{
              required: 'Please enter your message',
              minLength: 'Message must be at least 10 characters'
            }}
            placeholder="Your message"
            disabled={isSubmitting}
          />
          
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset(initialValues);
                resetFormData();
              }}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Form
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
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
        </p>
      </CardFooter>
    </Card>
  );
}
