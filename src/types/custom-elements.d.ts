// Type declarations for custom HTML elements
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'jb-credit': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'data-variant'?: 'chip' | 'minimal' | 'badge' | 'text' | 'icon';
          'data-theme'?: 'light' | 'dark' | 'auto';
          'data-position'?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline' | 'fixed';
          'data-size'?: 'small' | 'default' | 'large' | 'sm' | 'md' | 'lg';
          'data-align'?: 'left' | 'right' | 'center';
          'data-no-glow'?: string;
          'data-no-pulse'?: string;
          'data-no-border'?: string;
        },
        HTMLElement
      >;
    }
  }
}

