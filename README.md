# Jacob Barkin Portfolio Website

A modern, responsive portfolio website built with Next.js 15, Tailwind CSS 4, and shadcn UI, featuring accessibility, dark mode support, and a fully integrated Appwrite backend. This project showcases a professional portfolio with optimized performance, SEO, and user experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router - Modern React framework with server components
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn UI](https://ui.shadcn.com/) - Accessible and customizable component library
- **Theme Switching**: [next-themes](https://github.com/pacocoursey/next-themes) - Dark/light mode with system preference detection
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react) - Beautiful, consistent icon set
- **Animations**: [Aceternity UI](https://ui.aceternity.com/) - Modern UI components with advanced animations
- **Backend**: [Appwrite](https://appwrite.io/) - Open-source backend with:
  - Database for contact form submissions
  - Functions for email notifications
  - Authentication for admin dashboard
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Static Export**: Configured for Cloudflare Pages deployment with optimized caching

## ✨ Features

### User Experience
- **Modern, Responsive Design**: Fully responsive layout that works on all devices
- **Light and Dark Mode**: Automatic theme switching based on user preference
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Fast Page Loads**: Optimized performance with 90+ Lighthouse scores
- **Blue-to-Green Gradient Theme**: Consistent visual identity throughout the site

### Technical Features
- **Type Safety**: Built with TypeScript for robust code quality
- **Turbopack**: Faster development with Next.js Turbopack
- **GitHub Integration**: Automatic project card generation from GitHub repositories
- **Image Optimization**: Automatic WebP conversion and responsive sizing
- **Lazy Loading**: Components and images load only when needed
- **SEO Optimization**: Proper metadata, structured data, and semantic HTML
- **Progressive Web App (PWA)**: Installable with offline support

### Contact & Admin Features
- **Appwrite-Powered Contact Form**: Secure form submission with backend validation
- **Email Notifications**: Automatic email notifications for new submissions
- **Form Persistence**: Auto-save and recovery of form data
- **Real-Time Validation**: Instant feedback on form inputs
- **Admin Dashboard**: Secure dashboard for managing contact form submissions
- **Project Analytics**: View tracking and user engagement metrics
- **User Feedback System**: Collect and manage feedback on projects

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: Version 18.17 or later (required for Next.js 15)
- **Package Manager**: npm (8.x) or yarn (1.22.x)
- **Appwrite Account**: Free account at [appwrite.io](https://appwrite.io) for backend functionality
- **Git**: For cloning the repository and version control

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JSB2010/jacobbarkin.com.git
   cd jacobbarkin.com
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy the template to your local environment file:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and update the values with your Appwrite credentials:
     - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite project ID
     - `NEXT_PUBLIC_APPWRITE_FUNCTION_ID`: Your Appwrite function ID for email notifications
     - Other variables as needed (see [Environment Configuration](./ENV_CONFIGURATION.md))

4. **Set up Appwrite backend**:
   - This script creates the necessary database, collections, and functions:
     ```bash
     npm run setup-appwrite-complete
     ```
   - If you encounter any issues, see the [Appwrite Setup Troubleshooting](#appwrite-setup-troubleshooting) section

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### Appwrite Setup Troubleshooting

If you encounter issues with the Appwrite setup:

1. Ensure your Appwrite API key has sufficient permissions
2. Check that your project ID and endpoint are correct in `.env.local`
3. Run the setup script with verbose logging:
   ```bash
   NODE_ENV=development DEBUG=appwrite:* npm run setup-appwrite-complete
   ```
4. For manual setup, see the [Appwrite Manual Setup Guide](./docs/architecture/appwrite-integration.md)

## 📋 Available Scripts

### Development Scripts
- `npm run dev` - Start the development server with Turbopack
- `npm run dev:no-turbo` - Start the development server without Turbopack
- `npm run build` - Build the site for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

### Accessibility Scripts
- `npm run check-a11y` - Check for accessibility issues on the homepage
- `npm run check-a11y-all` - Check accessibility on all pages
- `npm run test-site` - Run comprehensive site tests

### Optimization Scripts
- `npm run optimize-images` - Optimize images in the public/images directory
- `npm run optimize-all-images` - Optimize all images in the project
- `npm run test:images` - Test image optimization results
- `npm run optimize-app-icons` - Optimize app icons and test results
- `npm run optimize-dependencies` - Analyze and optimize dependencies
- `npm run analyze-bundle` - Analyze the JavaScript bundle size

### Appwrite Scripts
- `npm run setup-appwrite-complete` - Set up all Appwrite resources
- `npm run setup-appwrite` - Set up basic Appwrite schema
- `npm run setup-appwrite-enhanced` - Set up enhanced Appwrite schema
- `npm run setup-appwrite-auth` - Set up Appwrite authentication
- `npm run update-appwrite-schema` - Update existing Appwrite schema
- `npm run setup-appwrite-function` - Deploy Appwrite functions
- `npm run test:email` - Test email notification function

### Backup Scripts
- `npm run backup-appwrite` - Create a backup of Appwrite data
- `npm run list-appwrite-backups` - List available backups
- `npm run restore-appwrite-backup` - Restore from a backup

### Utility Scripts
- `npm run clean` - Remove build directories
- `npm run clean:api` - Clean API routes for static export
- `npm run security-scan` - Run security audit

## 🏗️ Project Structure

```
jacobbarkin.com/
├── .github/                # GitHub Actions workflows and configuration
├── docs/                   # Documentation files
├── functions/              # Appwrite serverless functions
│   ├── email-notification-updated/  # Email notification function
│   └── email-notification/          # Legacy email function (deprecated)
├── public/                 # Static assets
│   ├── images/             # Image assets
│   │   └── optimized/      # WebP optimized images
│   ├── fonts/              # Font files
│   └── _headers            # Cloudflare custom headers
├── scripts/                # Utility scripts for development and deployment
├── src/                    # Source code
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (main)/         # Main site pages (home, about, etc.)
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── api/            # API routes (server-side)
│   │   └── layout.tsx      # Root layout with providers
│   ├── components/         # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── contact/        # Contact form components
│   │   ├── layout/         # Layout components (header, footer)
│   │   ├── projects/       # Project-related components
│   │   └── ui/             # UI components
│   │       ├── aceternity/ # Aceternity UI components
│   │       └── shadcn/     # shadcn UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and libraries
│   │   ├── appwrite/       # Appwrite configuration and utilities
│   │   ├── utils/          # General utility functions
│   │   └── validation/     # Form validation schemas
│   └── types/              # TypeScript type definitions
├── .env.example            # Example environment variables
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── next.config.mjs         # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Key Directories

- **src/app/**: Next.js App Router pages and layouts
- **src/components/**: Reusable React components
- **src/lib/**: Utility functions and configuration
- **src/hooks/**: Custom React hooks for shared logic
- **functions/**: Appwrite serverless functions
- **public/**: Static assets (images, fonts, etc.)
- **docs/**: Project documentation
- **scripts/**: Utility scripts for development and deployment

## 🚢 Deployment

### Cloudflare Pages Deployment

This project is configured for deployment to Cloudflare Pages with optimized caching and performance settings:

1. **GitHub Integration**:
   - Push your changes to GitHub
   - The GitHub Actions workflow will automatically build and deploy to Cloudflare Pages
   - See `.github/workflows/cloudflare-pages.yml` for the workflow configuration

2. **Manual Cloudflare Setup**:
   - Log in to the Cloudflare Dashboard
   - Navigate to Pages > Create a project
   - Connect your GitHub repository
   - Configure the build settings:
     - Build command: `npm run build`
     - Build output directory: `out`
     - Node.js version: 18.x (or later)
   - Add environment variables:
     - Copy all `NEXT_PUBLIC_*` variables from your `.env.local`
     - Add any other required environment variables

3. **Custom Domain Setup**:
   - In Cloudflare Pages, go to your project > Custom domains
   - Add your domain (e.g., `jacobbarkin.com`)
   - Configure DNS settings as instructed by Cloudflare
   - Enable HTTPS with Cloudflare's SSL certificate

4. **Performance Optimizations**:
   - Custom caching rules are defined in `public/_headers`
   - Content Security Policy headers are configured for security
   - Assets are optimized and served with proper cache headers

### Appwrite Functions Deployment

The project includes Appwrite serverless functions for backend operations:

1. **Automated Deployment**:
   ```bash
   npm run setup-appwrite-function
   ```
   This script:
   - Creates or updates the function in your Appwrite project
   - Uploads the function code
   - Sets required environment variables
   - Creates necessary API endpoints

2. **Manual Deployment**:
   - Navigate to the Appwrite Console
   - Go to Functions > Create Function
   - Set the runtime to Node.js 18.0
   - Upload the code from `functions/email-notification-updated`
   - Set the entrypoint to `src/main.js`
   - Configure environment variables:
     - `EMAIL_USER`: Your email address
     - `EMAIL_PASSWORD`: Your app-specific password

3. **Function Configuration**:
   - The function is triggered via HTTP requests from the contact form
   - It sends email notifications for new form submissions
   - It logs activity for monitoring and debugging

### Continuous Deployment

The project uses GitHub Actions for continuous integration and deployment:

1. **Automatic Deployments**:
   - Pushes to the main branch trigger automatic deployments
   - Pull requests trigger preview deployments

2. **Quality Checks**:
   - Linting and type checking
   - Accessibility checks
   - Performance monitoring

3. **Monitoring**:
   - Cloudflare Analytics for traffic monitoring
   - Lighthouse performance metrics
   - Error tracking and reporting

## 🤝 Contributing

Contributions are welcome! This project follows standard open source practices for contributions.

### Contribution Process

1. **Fork the Repository**:
   - Click the "Fork" button on GitHub to create your own copy

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jacobbarkin.com.git
   cd jacobbarkin.com
   ```

3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**:
   - Follow the code style and organization of the project
   - Update documentation for any changed functionality

5. **Verify Your Changes**:
   ```bash
   npm run lint
   npm run check-a11y
   ```

6. **Commit Your Changes**:
   ```bash
   git commit -m 'Add feature: detailed description of your changes'
   ```

7. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Provide a clear description of your changes

For more detailed guidelines, see the [Contributing Guide](./docs/CONTRIBUTING.md).

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 Jacob Barkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📚 Documentation

For more detailed documentation, see the [docs](./docs) directory:

- [Architecture Documentation](./docs/architecture/)
- [API Documentation](./docs/api/)
- [Monitoring Guide](./docs/MONITORING.md) - **Important for uptime monitoring setup**
- [Performance Optimization Guide](./docs/performance-optimization-guide.md)
- [Security Guide](./docs/security-guide.md)

### Health Check Endpoint

The site includes a dedicated health check endpoint at `/api/healthz` for monitoring:

```bash
# Test locally
npm run test:health

# Test production
npm run test:health:prod
```

Perfect for use with:
- Uptime Kuma
- Better Stack
- UptimeRobot
- StatusCake
- Any HTTP monitoring tool

See the [Monitoring Guide](./docs/MONITORING.md) for complete setup instructions.

## 📞 Contact

- **Developer**: Jacob Barkin
- **Website**: [jacobbarkin.com](https://jacobbarkin.com)
- **Contact**: [Contact Form](https://jacobbarkin.com/contact)
- **GitHub**: [JSB2010](https://github.com/JSB2010)
- **Project Repository**: [github.com/JSB2010/jacobbarkin.com](https://github.com/JSB2010/jacobbarkin.com)
