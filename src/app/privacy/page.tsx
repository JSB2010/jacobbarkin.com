import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Database, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy | Jacob Barkin",
  description:
    "Privacy Policy for jacobbarkin.com, the contact form, admin authentication, and the Jacob Barkin credit embed.",
  alternates: {
    canonical: "https://jacobbarkin.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Jacob Barkin",
    description:
      "How jacobbarkin.com collects, uses, shares, retains, and protects personal information.",
    url: "https://jacobbarkin.com/privacy",
    siteName: "Jacob Barkin Portfolio",
    locale: "en_US",
    type: "website",
  },
};

const lastUpdated = "May 25, 2026";

const collectedData = [
  {
    title: "Contact information",
    body: "Name, email address, subject, message content, timestamp, source label, IP address, and browser user agent when you submit the contact form.",
  },
  {
    title: "Embed telemetry",
    body: "Page URL, host, path, title, referrer, UTM parameters, viewport size, device type, language, timezone offset, connection type, embed configuration, event type, session ID, page-view ID, and a daily session fingerprint derived from IP address, user agent, and page host.",
  },
  {
    title: "Operations data",
    body: "Server request data, sampled Cloudflare logs and traces, admin authentication records handled by Clerk, and public repository data fetched from GitHub.",
  },
];

const serviceProviders = [
  "Cloudflare, for hosting, Workers, D1 database storage, image optimization, security, logs, and analytics/observability.",
  "Resend, for delivering contact form notification emails.",
  "Clerk, for administrator authentication and related security telemetry.",
  "GitHub, for displaying public repository and project information.",
  "Google Docs and Microsoft OneDrive, when public project materials are embedded on project pages.",
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-10 space-y-5">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Privacy Policy</p>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            This Privacy Policy explains how Jacob Barkin collects, uses, discloses, retains, and protects
            information through jacobbarkin.com, the public contact form, administrator tools, and the
            embeddable &quot;Designed by Jacob Barkin&quot; credit component.
          </p>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/contact">Contact Jacob</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/embed">Embed Details</Link>
          </Button>
        </div>
      </section>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-primary" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Contact form submissions are used to respond to messages, prevent abuse, and maintain a record
            of communications.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-primary" />
              Embed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The credit embed uses limited analytics and heartbeat telemetry unless disabled with
            {" "}
            <code className="rounded bg-muted px-1 py-0.5">data-no-track</code>
            {" "}
            or Global Privacy Control.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Personal information is kept only as needed for the purposes described here and is protected
            using reasonable technical and organizational safeguards.
          </CardContent>
        </Card>
      </section>

      <article className="space-y-10 text-sm leading-7 text-muted-foreground sm:text-base">
        <PolicySection title="1. Who Operates This Site">
          <p>
            This website and the related embed service are operated by Jacob Barkin in Colorado, United
            States. For privacy questions or requests, contact{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="mailto:jacobsamuelbarkin@gmail.com">
              jacobsamuelbarkin@gmail.com
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection title="2. Scope">
          <p>
            This Privacy Policy applies to jacobbarkin.com, public pages on this domain, the contact form,
            administrator areas, API endpoints, hosted email-signature pages, and the Jacob Barkin credit
            embed served from this domain. It does not apply to independent third-party websites linked from
            this site, including GitHub, LinkedIn, Ask The Kidz, Google, Microsoft, Clerk, Resend, or
            Cloudflare websites, except to the extent those providers process information for this site.
          </p>
        </PolicySection>

        <PolicySection title="3. Information Collected">
          <div className="grid gap-4">
            {collectedData.map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-4">
                <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <p>
            Public visitors do not need an account to browse this site. The public site does not process
            payments, run a newsletter, or intentionally collect government identifiers, financial account
            numbers, health data, precise geolocation, or other sensitive personal information.
          </p>
          <p>
            Some pages include public project materials through third-party frames or links. Those providers
            may receive technical information from your browser when their content loads.
          </p>
        </PolicySection>

        <PolicySection title="4. How Information Is Used">
          <p>Information is used for the following purposes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>To receive, store, review, and respond to contact form submissions.</li>
            <li>To send contact form notification emails to Jacob Barkin.</li>
            <li>To operate, secure, debug, and improve the website and related services.</li>
            <li>To prevent spam, abuse, unauthorized access, and security incidents.</li>
            <li>To authenticate and manage administrator access.</li>
            <li>
              To measure the installation, performance, impressions, clicks, errors, rule activity, and
              heartbeat status of the credit embed.
            </li>
            <li>To comply with applicable legal, security, and operational obligations.</li>
          </ul>
        </PolicySection>

        <PolicySection title="5. Cookies, Local Storage, and Similar Technologies">
          <p>
            The site may use browser storage for preferences such as theme selection. Administrator
            authentication through Clerk may use cookies or similar technologies required for sign-in,
            security, and session management.
          </p>
          <p>
            The credit embed uses session storage to store a temporary session ID, page-view ID, and short
            lived rule-cache entries. It does not require third-party advertising cookies. Site owners can
            disable embed analytics and heartbeats with the
            {" "}
            <code className="rounded bg-muted px-1 py-0.5">data-no-track</code>
            {" "}
            attribute.
          </p>
        </PolicySection>

        <PolicySection title="6. Online Tracking, Do Not Track, and Global Privacy Control">
          <p>
            The credit embed can collect information about a visitor&apos;s interaction with the embed across
            pages where the embed is installed. This is used for operational analytics, installation health,
            debugging, and rule reporting, not for targeted advertising.
          </p>
          <p>
            Browser &quot;Do Not Track&quot; signals are not standardized, and the site does not respond to them in
            a separate way. The credit embed does honor Global Privacy Control by disabling embed analytics
            and heartbeat telemetry when that signal is available in the visitor&apos;s browser. Visitors and
            site owners may also disable embed telemetry by using
            {" "}
            <code className="rounded bg-muted px-1 py-0.5">data-no-track</code>.
          </p>
        </PolicySection>

        <PolicySection title="7. How Information Is Shared">
          <p>
            Personal information is not sold. Personal information is not shared for cross-context behavioral
            advertising or targeted advertising. Information may be disclosed to service providers and
            infrastructure vendors that help operate this site:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            {serviceProviders.map((provider) => (
              <li key={provider}>{provider}</li>
            ))}
          </ul>
          <p>
            Information may also be disclosed if required by law, to protect rights and safety, to investigate
            abuse or security incidents, or with your direction or consent.
          </p>
        </PolicySection>

        <PolicySection title="8. Your Choices and Privacy Requests">
          <p>
            You may request access to, correction of, or deletion of personal information associated with
            you by emailing{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="mailto:jacobsamuelbarkin@gmail.com">
              jacobsamuelbarkin@gmail.com
            </a>
            . To help locate records, include the email address you used in the contact form or, for embed
            telemetry, the website/page where the embed appeared and the approximate date of the event.
          </p>
          <p>
            Some records may be retained where reasonably necessary for security, troubleshooting, legal
            compliance, fraud prevention, or legitimate administrative purposes. If a request cannot be
            completed, the response will explain why when appropriate.
          </p>
        </PolicySection>

        <PolicySection title="9. California and Colorado Privacy Information">
          <p>
            This policy identifies the categories of personally identifiable information collected, the
            categories of third parties with whom information may be shared, the process for privacy requests,
            the process for policy changes, and the effective date.
          </p>
          <p>
            If a state privacy law gives you additional rights, such as the right to know, access, correct,
            delete, or opt out of certain uses of personal information, you may use the contact method above.
            This site does not sell personal information and does not use personal information for targeted
            advertising. If those practices change, this policy will be updated and any required opt-out
            mechanism will be provided.
          </p>
        </PolicySection>

        <PolicySection title="10. Data Retention">
          <p>
            Contact form submissions are generally retained for up to 24 months unless a longer period is
            needed for communication history, security, dispute resolution, or legal reasons. Raw embed
            telemetry is generally retained for up to 12 months. Aggregated embed metrics that do not directly
            identify an individual may be retained longer for reporting and historical analysis.
          </p>
          <p>
            Server logs, observability data, authentication records, and email delivery records are retained
            according to operational needs and the retention settings of the relevant service providers.
          </p>
        </PolicySection>

        <PolicySection title="11. Security">
          <p>
            Reasonable administrative, technical, and organizational safeguards are used to protect personal
            information. These include access controls for administrator areas, managed infrastructure
            providers, database-backed storage, and limiting collection to information that is reasonably
            useful for the purposes described in this policy. No website or internet transmission can be
            guaranteed completely secure.
          </p>
        </PolicySection>

        <PolicySection title="12. Children and Minors">
          <p>
            This site is a general audience portfolio and developer site. It is not directed to children under
            13, and it does not knowingly collect personal information from children under 13. If you believe
            a child under 13 submitted personal information through this site, email the contact address above
            and the information will be reviewed and deleted where appropriate.
          </p>
          <p>
            Some site content discusses education, youth financial literacy, and school-related projects.
            That content is informational and does not mean the site is intended to collect personal
            information from children.
          </p>
        </PolicySection>

        <PolicySection title="13. International Visitors">
          <p>
            This site is operated from the United States and uses service providers that may process
            information in the United States or other jurisdictions. By using the site or embed, information
            may be processed in locations where privacy laws differ from those in your place of residence.
          </p>
        </PolicySection>

        <PolicySection title="14. Changes to This Policy">
          <p>
            This policy may be updated from time to time. Material changes will be posted on this page by
            updating the &quot;Last updated&quot; date and, when appropriate, adding a more prominent notice.
          </p>
        </PolicySection>

        <PolicySection title="15. Contact">
          <p>
            Privacy questions and requests may be sent to{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="mailto:jacobsamuelbarkin@gmail.com">
              jacobsamuelbarkin@gmail.com
            </a>
            .
          </p>
        </PolicySection>
      </article>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: Readonly<{
  title: string;
  children: ReactNode;
}>) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
