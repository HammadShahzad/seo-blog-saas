import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | StackSerp",
  description: "Privacy Policy for StackSerp AI Content Generator.",
  alternates: {
    canonical: "https://stackserp.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <main className="max-w-3xl mx-auto py-20 px-4 prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us when you create an account, subscribe to our service, or communicate with us. This may include your name, email address, payment information, and API keys for your integrated CMS platforms.</p>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
        </ul>

        <h2>AI and Data Privacy</h2>
        <p>When you use StackSerp to generate content, the topics, keywords, and text prompts are sent to third-party AI providers (such as Google or Anthropic) to generate the response. We do not use your private data to train our own foundation models, and we ensure our third-party APIs have strict data privacy agreements.</p>

        <h2>Data Security</h2>
        <p>We implement appropriate technical and organizational security measures to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>

        <h2>Third-Party Services</h2>
        <p>We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., payment processing via Stripe).</p>

        <h2>Your Rights</h2>
        <p>Depending on your location, you may have the right to access, correct, update, or delete your personal information. You can manage your account information within the dashboard or by contacting us.</p>

        <p className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          Contact: privacy@stackserp.com
        </p>
      </main>
    </>
  );
}
