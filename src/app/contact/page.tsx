import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactFormZustand } from "@/components/contact/contact-form-zustand";
import { Mail, Github, Linkedin } from "lucide-react";
import { LazyLoad } from "@/components/ui/lazy-load";
import { PageHero } from "@/components/ui/page-hero";

// Configure this page for static export
export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Contact | Jacob Barkin",
  description: "Get in touch with Jacob Barkin for collaboration, questions, or just to say hello.",
  alternates: {
    canonical: "https://jacobbarkin.com/contact",
  },
  openGraph: {
    title: "Contact | Jacob Barkin",
    description: "Get in touch with Jacob Barkin for collaboration, questions, or just to say hello.",
    url: "https://jacobbarkin.com/contact",
    siteName: "Jacob Barkin Portfolio",
    images: [
      {
        url: "/images/Updated logo.png",
        width: 800,
        height: 600,
        alt: "Jacob Barkin Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Jacob Barkin",
    description: "Get in touch with Jacob Barkin for collaboration, questions, or just to say hello.",
    images: ["/images/Updated logo.png"],
    creator: "@jacobbarkin",
    site: "@jacobbarkin",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Get In Touch"
        description="Have a question or want to collaborate? I'd love to hear from you!"
        backgroundImage="/images/mountains-bg.jpg"
        badge="Always Open to Connect"
        badgeIcon={true}
        tags={["Collaboration", "Questions", "Feedback"]}
      />

      {/* Contact Form Section */}
      <LazyLoad>
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">Send Me a Message</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                  Fill out the form below and I&apos;ll get back to you as soon as possible. I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>

                <ContactFormZustand />
              </div>

              <div className="mt-8 lg:mt-0">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">Connect With Me</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                  You can also reach out to me through these platforms or follow my work.
                </p>

                <div className="grid grid-cols-1 gap-6">
                  <ContactCard
                    icon={<Mail className="h-6 w-6" />}
                    title="Email"
                    description="Send me an email directly for any inquiries or collaboration opportunities."
                    actionText="Email Me"
                    actionLink="mailto:Jacobsamuelbarkin@gmail.com"
                    gradient="from-blue-500 to-cyan-500"
                  />

                  <ContactCard
                    icon={<Linkedin className="h-6 w-6" />}
                    title="LinkedIn"
                    description="Connect with me professionally and stay updated on my career journey."
                    actionText="Connect on LinkedIn"
                    actionLink="https://www.linkedin.com/in/jacob-barkin/"
                    gradient="from-blue-600 to-blue-800"
                  />

                  <ContactCard
                    icon={<Github className="h-6 w-6" />}
                    title="GitHub"
                    description="Check out my code repositories and development projects."
                    actionText="Follow on GitHub"
                    actionLink="https://github.com/JSB2010"
                    gradient="from-gray-700 to-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazyLoad>
    </>
  );
}

function ContactCard({
  icon,
  title,
  description,
  actionText,
  actionLink,
  gradient
}: Readonly<{
  icon: React.ReactNode,
  title: string,
  description: string,
  actionText: string,
  actionLink: string,
  gradient: string
}>) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 sm:h-2 bg-gradient-to-r ${gradient}`}></div>
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{description}</p>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 text-sm w-full sm:w-auto"
            >
              <Link
                href={actionLink}
                target={actionLink.startsWith('http') ? "_blank" : undefined}
                rel={actionLink.startsWith('http') ? "noopener noreferrer" : undefined}
              >
                {actionText}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
