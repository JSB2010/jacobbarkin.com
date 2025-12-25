import { render, screen } from '@testing-library/react';
import { MotionWrapper, fadeIn, slideUp, staggerChildren } from '@/components/ui/motion-wrapper';

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  // Return a div with motion-mock class to confirm the mock is working
  return jest.fn(() => {
    return ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <div
        data-testid="motion-div-mock"
        className={`motion-mock ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  });
});

describe('MotionWrapper Component', () => {
  it('renders children correctly', () => {
    render(
      <MotionWrapper>
        <p>Test Content</p>
      </MotionWrapper>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MotionWrapper className="custom-class">
        <p>Test Content</p>
      </MotionWrapper>
    );
    
    const motionElement = screen.getByTestId('motion-div-mock');
    expect(motionElement).toHaveClass('custom-class');
  });

  it('forwards animation props to motion component', () => {
    const animationProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    };
    
    render(
      <MotionWrapper {...animationProps}>
        <p>Animated Content</p>
      </MotionWrapper>
    );
    
    const motionElement = screen.getByTestId('motion-div-mock');
    
    // In a real test, these would be proper assertions against framer-motion
    // For our mock, we just verify these props are passed to the component
    expect(motionElement).toHaveAttribute('initial');
    expect(motionElement).toHaveAttribute('animate');
    expect(motionElement).toHaveAttribute('transition');
  });
  
  it('exports animation preset variants', () => {
    // Test that the variant objects are exported and have the correct properties
    expect(fadeIn).toEqual({
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    });
    
    expect(slideUp).toEqual({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    });
    
    expect(staggerChildren).toEqual({
      visible: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    });
  });
});