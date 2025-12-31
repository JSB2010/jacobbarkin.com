import type { Metadata } from "next";
import SignatureGallery from "./signature-gallery";
import { SITE_BASE_URL, signatures } from "./signatures-data";

export const metadata: Metadata = {
  title: "Email Signatures | Jacob Barkin",
  description: "Hosted email signatures for Jacob Barkin with easy copy-and-paste HTML for email clients.",
  alternates: {
    canonical: "https://jacobbarkin.com/signatures",
  },
};

export default function SignaturesPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 py-12">
      <section className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
          Email signatures
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Hosted signatures</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Copy the HTML below into your email client's signature settings. Email clients block external scripts
            and custom CSS, so these signatures are fully inline-styled and ready to paste. Each card also exposes a
            raw HTML endpoint you can open in the browser when you want a clean copy.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tip: allow remote images in your mail client so the favicons and logos load. The HTML uses only
            accessible tables and inline styles, so it works in Gmail, Outlook, Apple Mail, and most webmail
            providers.
          </p>
        </div>
      </section>

      <SignatureGallery signatures={signatures} siteBase={SITE_BASE_URL} />

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">How to add a signature</h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-medium text-slate-800 dark:text-slate-200">Gmail (web)</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Open Settings → See all settings → General → Signature.</li>
            <li>Click "Create new" or edit an existing one.</li>
            <li>Open the raw HTML link, select all (Cmd+A) → copy, then paste into the signature editor.</li>
            <li>Scroll down and save changes.</li>
          </ol>
          <p className="pt-3 font-medium text-slate-800 dark:text-slate-200">Apple Mail (macOS)</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Mail → Settings → Signatures → choose the account.</li>
            <li>Click "+" to add, name it, then paste the copied HTML into the signature body.</li>
            <li>Close the window to save. Send yourself a test email.</li>
          </ol>
          <p className="pt-3 font-medium text-slate-800 dark:text-slate-200">Outlook (desktop or web)</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Desktop: File → Options → Mail → Signatures. Web: Settings → Mail → Compose and reply.</li>
            <li>Create a new signature, then paste the copied HTML.</li>
            <li>Set the default signature for new messages/replies if desired, then save.</li>
          </ol>
          <p className="pt-3 text-xs text-slate-500 dark:text-slate-400">
            If pasting looks off, use the "Open raw HTML" link, copy from that clean view, and repaste. Some clients
            strip styling when pasting from a rich page.
          </p>
        </div>
      </section>
    </div>
  );
}
