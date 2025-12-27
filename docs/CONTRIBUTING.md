# Contributing to Jacob Barkin's Portfolio Website

Thank you for considering contributing to this project! This document outlines the process for contributing to the project and provides guidelines for code style, testing, and more.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Style](#code-style)
4. [Testing](#testing)
5. [Accessibility](#accessibility)
6. [Security](#security)
7. [Performance](#performance)
8. [Documentation](#documentation)
9. [Pull Request Process](#pull-request-process)
10. [Code of Conduct](#code-of-conduct)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Cloudflare account (for deployment)
- Clerk account (for authentication)

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jacobbarkin.com.git
   cd jacobbarkin.com
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the values with your Cloudflare/Clerk credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

3. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request from your fork to the main repository

## Code Style

This project uses ESLint and Prettier for code formatting and linting. Please ensure your code follows these standards:

- Run linting before committing:
  ```bash
  npm run lint
  ```

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single responsibility

## Testing

All new features and bug fixes should include tests:

- Run tests before submitting a pull request:
  ```bash
  npm test
  ```

- Write unit tests for utility functions and components
- Write integration tests for critical user flows
- Aim for high test coverage for critical code paths

## Accessibility

Accessibility is a priority for this project:

- Run accessibility checks before submitting a pull request:
  ```bash
  npm run check-a11y
  ```

- Ensure all components are keyboard navigable
- Use semantic HTML elements
- Provide appropriate ARIA attributes
- Ensure sufficient color contrast
- Test with screen readers

## Security

Security is critical for this project:

- Run security checks before submitting a pull request:
  ```bash
  npm run security-scan
  ```

- Never expose API keys or secrets in client-side code
- Implement proper input validation and sanitization
- Follow security best practices for authentication and authorization
- Report security vulnerabilities privately to the project maintainer

## Performance

Performance is important for a good user experience:

- Run performance checks before submitting a pull request:
  ```bash
  npm run analyze-bundle
  ```

- Optimize images and assets
- Use code splitting and lazy loading
- Minimize dependencies
- Follow performance best practices

## Documentation

Good documentation is essential:

- Update documentation for any changes to APIs or components
- Document complex logic with comments
- Update the README.md if necessary
- Add JSDoc comments for functions and components

## Pull Request Process

1. Ensure your code passes all tests, linting, and accessibility checks
2. Update documentation as necessary
3. Fill out the pull request template completely
4. Request a review from a maintainer
5. Address any feedback from the review
6. Once approved, your pull request will be merged

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Questions?

If you have any questions or need help, please open an issue or contact the project maintainer.
