/**
 * Tests for the AdminLoginPage component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLoginPage from '../page';
import { useAdminAuth } from '@/components/admin/auth-context';

// Mock the hooks
jest.mock('@/components/admin/auth-context', () => ({
  useAdminAuth: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AdminLoginPage', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock useAdminAuth hook
    (useAdminAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn().mockResolvedValue(false),
      clearError: jest.fn(),
    });
  });
  
  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the login form with all fields', () => {
    render(<AdminLoginPage />);
    
    // Check that all form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('updates form data when fields change', () => {
    render(<AdminLoginPage />);
    
    // Fill out the email field
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    
    // Check that the value was updated
    expect(emailInput.value).toBe('admin@example.com');
  });
  
  it('calls signIn when form is submitted', async () => {
    const mockSignIn = jest.fn().mockResolvedValue(false);
    (useAdminAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      clearError: jest.fn(),
    });
    
    render(<AdminLoginPage />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check that signIn was called with the correct values
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'password123');
    });
  });
  
  it('displays error message when authentication fails', () => {
    (useAdminAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: 'Invalid email or password',
      signIn: jest.fn().mockResolvedValue(false),
      clearError: jest.fn(),
    });
    
    render(<AdminLoginPage />);
    
    // Check that the error message is displayed
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
