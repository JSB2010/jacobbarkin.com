import { render, screen } from '@testing-library/react';
import Header from '../header';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock the ThemeToggle component
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    // Ensure alt is always present and convert boolean props to strings
    const imgProps = { ...props };
    if (imgProps.priority === true) {
      (imgProps as Record<string, unknown>).priority = "true";
    }
    return <img alt={props.alt ?? ''} {...imgProps} />;
  },
}));

describe('Header Component', () => {
  it('renders the logo and navigation links', () => {
    render(<Header />);

    // Check if the logo is rendered
    expect(screen.getByText('Jacob Barkin')).toBeInTheDocument();

    // Check if navigation links are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
