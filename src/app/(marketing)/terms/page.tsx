import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | StackSerp",
  description: "Terms of Service for StackSerp AI Content Generator.",
  alternates: {
    canonical: "https://stackserp.com/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <main className="max-w-3xl mx-auto py-20 px-4 prose prose-neutral dark:prose-invert">
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using StackSerp ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

        <h2>2. Description of Service</h2>
        <p>StackSerp is an AI-powered content generation and SEO platform that automates blog creation, internal linking, and publishing to content management systems.</p>

        <h2>3. User Accounts</h2>
        <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

        <h2>4. Content Rights and Responsibilities</h2>
        <p>You retain all rights to any content you submit, post or display on or through the Service. By generating content using our AI tools, you own the output generated, subject to any third-party AI provider terms (such as OpenAI or Anthropic policies).</p>
        
        <h2>5. Acceptable Use</h2>
        <p>You agree not to use the Service to generate content that is illegal, abusive, harassing, or intended to spread misinformation or harm others.</p>

        <h2>6. Billing and Refunds</h2>
        <p>The Service is billed in advance on a monthly or annual basis. We offer a 14-day refund policy for new subscriptions if you are unsatisfied.</p>

        <h2>7. Limitation of Liability</h2>
        <p>In no event shall StackSerp, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.</p>

        <h2>8. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any material changes via the email associated with your account.</p>

        <p className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          Contact: legal@stackserp.com
        </p>
      </main>
    </>
  );
}
