// This is a server component file that exports generateStaticParams
// Used for Next.js static site generation
import ClientPage from './client-page';

// Define the generateStaticParams function directly in this file
export async function generateStaticParams() {
  // For the static export, we'll pre-render a placeholder page
  return [{ id: 'placeholder' }];
}

// Next.js 15 requires params to be a Promise in page components
type PageProps = {
  params: Promise<{ id: string }>;
};

// This acts as a wrapper around the client component
export default async function SubmissionPage({ params }: PageProps) {
  // Await the params Promise (Next.js 15 requirement)
  const { id } = await params;

  // This function will be run at build time to generate the static page
  return <ClientPage params={{ id }} />;
}