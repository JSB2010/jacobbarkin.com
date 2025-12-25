import { EmailData, sendContactFormEmail } from './email-service';
import { EmailTemplateType } from './email-templates';
import { logger } from '@/lib/appwrite';

// Queue item interface
interface QueueItem {
  id: string;
  data: EmailData;
  templateType: EmailTemplateType;
  sendUserCopy: boolean;
  priority: number;
  retries: number;
  maxRetries: number;
  lastAttempt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Email queue class
export class EmailQueue {
  private static instance: EmailQueue;
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private maxConcurrent: number = 3;
  private currentProcessing: number = 0;
  private rateLimitDelay: number = 1000; // 1 second between emails

  // Private constructor for singleton pattern
  private constructor() {
    // Initialize the queue from localStorage if available (client-side only)
    this.loadQueue();
  }

  // Get singleton instance
  public static getInstance(): EmailQueue {
    if (!EmailQueue.instance) {
      EmailQueue.instance = new EmailQueue();
    }
    return EmailQueue.instance;
  }

  // Add an email to the queue
  public addToQueue(
    data: EmailData,
    templateType: EmailTemplateType = EmailTemplateType.ADMIN_NOTIFICATION,
    sendUserCopy: boolean = false,
    priority: number = 1,
    maxRetries: number = 3
  ): string {
    const id = `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const queueItem: QueueItem = {
      id,
      data,
      templateType,
      sendUserCopy,
      priority,
      retries: 0,
      maxRetries,
      status: 'pending'
    };
    
    this.queue.push(queueItem);
    logger.info('Added email to queue', { id, recipient: data.email, priority });
    
    // Sort queue by priority (higher numbers = higher priority)
    this.queue.sort((a, b) => b.priority - a.priority);
    
    // Save queue to storage
    this.saveQueue();
    
    // Start processing if not already running
    this.startProcessing();
    
    return id;
  }

  // Start processing the queue
  public startProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    logger.info('Started email queue processing');
    
    // Process queue every second
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 500);
  }

  // Stop processing the queue
  public stopProcessing(): void {
    if (!this.isProcessing) return;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    this.isProcessing = false;
    logger.info('Stopped email queue processing');
  }

  // Process the queue
  private async processQueue(): Promise<void> {
    // If we're already processing the maximum number of emails, wait
    if (this.currentProcessing >= this.maxConcurrent) return;
    
    // Get the next pending email
    const nextItem = this.queue.find(item => item.status === 'pending');
    if (!nextItem) {
      // If no pending items and nothing processing, stop the interval
      if (this.currentProcessing === 0) {
        this.stopProcessing();
      }
      return;
    }
    
    // Check if we need to wait due to rate limiting
    if (nextItem.lastAttempt) {
      const timeSinceLastAttempt = Date.now() - nextItem.lastAttempt.getTime();
      if (timeSinceLastAttempt < this.rateLimitDelay) {
        return; // Wait until rate limit delay has passed
      }
    }
    
    // Mark as processing and increment counter
    nextItem.status = 'processing';
    nextItem.lastAttempt = new Date();
    this.currentProcessing++;
    
    // Save queue state
    this.saveQueue();
    
    try {
      // Send the email
      logger.info('Processing email from queue', { id: nextItem.id, attempt: nextItem.retries + 1 });
      
      const result = await sendContactFormEmail(
        nextItem.data,
        nextItem.templateType,
        nextItem.sendUserCopy
      );
      
      if (result.success) {
        // Mark as completed
        nextItem.status = 'completed';
        logger.info('Email sent successfully from queue', { id: nextItem.id, messageId: result.messageId });
      } else {
        // Increment retry count
        nextItem.retries++;
        
        if (nextItem.retries >= nextItem.maxRetries) {
          // Mark as failed if max retries reached
          nextItem.status = 'failed';
          nextItem.error = result.message;
          logger.error('Email failed after max retries', { id: nextItem.id, error: result.message });
        } else {
          // Reset to pending for retry
          nextItem.status = 'pending';
          logger.warn('Email sending failed, will retry', { 
            id: nextItem.id, 
            error: result.message,
            attempt: nextItem.retries,
            maxRetries: nextItem.maxRetries
          });
        }
      }
    } catch (error) {
      // Handle unexpected errors
      nextItem.retries++;
      nextItem.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (nextItem.retries >= nextItem.maxRetries) {
        nextItem.status = 'failed';
        logger.error('Unexpected error sending email from queue', { id: nextItem.id, error: nextItem.error });
      } else {
        nextItem.status = 'pending';
        logger.warn('Unexpected error, will retry', { 
          id: nextItem.id, 
          error: nextItem.error,
          attempt: nextItem.retries,
          maxRetries: nextItem.maxRetries
        });
      }
    } finally {
      // Decrement processing counter
      this.currentProcessing--;
      
      // Save queue state
      this.saveQueue();
    }
  }

  // Get queue status
  public getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.status === 'pending').length,
      processing: this.queue.filter(item => item.status === 'processing').length,
      completed: this.queue.filter(item => item.status === 'completed').length,
      failed: this.queue.filter(item => item.status === 'failed').length
    };
  }

  // Clear completed and failed items
  public clearCompleted(): void {
    this.queue = this.queue.filter(item => 
      item.status !== 'completed' && item.status !== 'failed'
    );
    this.saveQueue();
    logger.info('Cleared completed and failed emails from queue');
  }

  // Retry failed items
  public retryFailed(): void {
    this.queue.forEach(item => {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.retries = 0;
        item.error = undefined;
      }
    });
    
    this.saveQueue();
    this.startProcessing();
    logger.info('Reset failed emails for retry');
  }

  // Save queue to localStorage (client-side only)
  private saveQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('email_queue', JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Error saving email queue to localStorage', error);
    }
  }

  // Load queue from localStorage (client-side only)
  private loadQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const savedQueue = localStorage.getItem('email_queue');
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        
        // Convert string dates back to Date objects
        this.queue.forEach(item => {
          if (item.lastAttempt) {
            item.lastAttempt = new Date(item.lastAttempt);
          }
        });
        
        logger.info('Loaded email queue from localStorage', { 
          total: this.queue.length,
          pending: this.queue.filter(item => item.status === 'pending').length
        });
        
        // If there are pending items, start processing
        if (this.queue.some(item => item.status === 'pending')) {
          this.startProcessing();
        }
      }
    } catch (error) {
      logger.error('Error loading email queue from localStorage', error);
      this.queue = [];
    }
  }
}

// Helper function to get the queue instance
export function getEmailQueue(): EmailQueue {
  return EmailQueue.getInstance();
}

// Helper function to add an email to the queue
export function queueEmail(
  data: EmailData,
  templateType: EmailTemplateType = EmailTemplateType.ADMIN_NOTIFICATION,
  sendUserCopy: boolean = false,
  priority: number = 1
): string {
  return getEmailQueue().addToQueue(data, templateType, sendUserCopy, priority);
}