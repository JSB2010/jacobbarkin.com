// Type declarations for custom HTML elements
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'jb-credit': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'data-variant'?: 'prominent' | 'chip' | 'badge' | 'logo' | 'minimal' | 'text';
          'data-theme'?: 'light' | 'dark' | 'auto';
          'data-position'?: 'inline' | 'fixed';
          'data-size'?: 'small' | 'default' | 'large';
          'data-align'?: 'left' | 'right' | 'center';
          'data-no-track'?: string | boolean;
        },
        HTMLElement
      >;
    }
  }
}
