import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | StackSerp",
  description: "StackSerp's Privacy Policy. Learn how we collect, use, and protect your personal data, AI-generated content, and API credentials.",
  keywords: "StackSerp privacy policy, data protection, GDPR, personal data",
  alternates: { canonical: "https://stackserp.com/privacy" },
  openGraph: {
    title: "Privacy Policy | StackSerp",
    description: "How StackSerp collects, uses, and protects your data.",
    type: "website",
    url: "https://stackserp.com/privacy",
  },
};

const LAST_UPDATED = "February 1, 2026";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-20 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">

        <section>
          <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            StackSerp Inc. (&quot;StackSerp&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the StackSerp platform at stackserp.com. This Privacy
            Policy explains what personal data we collect, how we use it, with whom we share it, and the choices you
            have regarding your information. By using StackSerp, you agree to the practices described in this Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>

          <h3 className="text-base font-semibold mb-2 mt-4">2.1 Information you provide directly</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Account data:</strong> Name, email address, and password when you register.</li>
            <li><strong>Profile data:</strong> Organization name, website URLs, industry/niche, and brand settings you configure.</li>
            <li><strong>Payment data:</strong> Billing address and payment method — processed by Stripe. We never store raw card numbers.</li>
            <li><strong>CMS credentials:</strong> API keys, application passwords, and access tokens you add for WordPress, Shopify, Ghost, or other integrations. These are stored encrypted at rest.</li>
            <li><strong>Content inputs:</strong> Keywords, content briefs, brand guidelines, and custom prompts you enter.</li>
            <li><strong>Support communications:</strong> Any messages you send to our support team.</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">2.2 Information collected automatically</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Usage data:</strong> Pages visited, features used, button clicks, and time spent — collected via server logs and optional analytics.</li>
            <li><strong>Device &amp; technical data:</strong> IP address, browser type, operating system, and referring URLs.</li>
            <li><strong>Cookies:</strong> Session cookies for authentication and optional preference cookies. We do not use third-party advertising cookies.</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">2.3 AI-generated content</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you generate content through StackSerp, your prompts (keywords, topics, instructions) are sent to
            third-party AI providers such as Google Gemini. These providers may process this data subject to their own
            privacy policies. We do not use your content inputs to train our own AI models, and we contractually restrict
            providers from using your data for their model training where permitted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>To provision, operate, and improve the Service.</li>
            <li>To authenticate your identity and manage your account.</li>
            <li>To process subscription payments and send billing receipts.</li>
            <li>To fulfill integrations — e.g., publishing content to your CMS using the credentials you provide.</li>
            <li>To send transactional emails (password resets, subscription confirmations, job completion notifications).</li>
            <li>To send product updates, feature announcements, and tips (you can opt out at any time).</li>
            <li>To monitor for abuse and enforce our Terms of Service.</li>
            <li>To comply with legal obligations.</li>
            <li>To generate aggregated, anonymized statistics about platform usage (never identifying individual users).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Legal Basis for Processing (GDPR)</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            If you are in the European Economic Area (EEA) or United Kingdom, our legal bases for processing personal data are:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Contract performance:</strong> Processing necessary to provide the Service you subscribed to.</li>
            <li><strong>Legitimate interests:</strong> Security monitoring, fraud prevention, and product analytics.</li>
            <li><strong>Legal obligation:</strong> Retaining billing records as required by tax laws.</li>
            <li><strong>Consent:</strong> Marketing emails and non-essential cookies, where required.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Data Sharing and Third Parties</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We do not sell your personal data. We share data only with the following categories of parties:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Payment processing:</strong> Stripe Inc. — for billing and subscription management.</li>
            <li><strong>AI providers:</strong> Google (Gemini API, Imagen API) — for content and image generation. Prompts are sent but not permanently stored beyond the request lifecycle under our agreements.</li>
            <li><strong>Cloud infrastructure:</strong> DigitalOcean or equivalent — for hosting the application and database.</li>
            <li><strong>Email delivery:</strong> A transactional email provider (e.g., Resend or SendGrid) — for system emails.</li>
            <li><strong>CMS platforms:</strong> Your credentials are used to connect to platforms you authorize (WordPress, Shopify, etc.). We only transmit content to those platforms on your explicit instruction.</li>
            <li><strong>Legal disclosure:</strong> We may disclose data if required by law, court order, or to protect the rights, property, or safety of StackSerp, its users, or the public.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            All sub-processors are listed in our <Link href="/dpa" className="text-primary underline">Data Processing Agreement (DPA)</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
            <li>Encryption of data in transit using TLS 1.2+.</li>
            <li>Encryption of sensitive credentials (CMS API keys, tokens) at rest using AES-256.</li>
            <li>Hashed and salted storage of passwords (bcrypt).</li>
            <li>Regular security audits and dependency updates.</li>
            <li>Access controls limiting who within StackSerp can access production data.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            No system is perfectly secure. If you discover a security vulnerability, please disclose it responsibly
            to security@stackserp.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data for as long as your account is active or as needed to provide the Service.
            If you delete your account, we begin deletion of your personal data within 30 days, except where retention
            is required by law (e.g., billing records retained for 7 years for tax compliance). Generated content
            (blog posts, keywords) is deleted alongside your account unless you export it beforehand.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We use the following types of cookies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Essential cookies:</strong> Session tokens required for you to stay logged in. Cannot be disabled.</li>
            <li><strong>Preference cookies:</strong> Store your UI preferences (e.g., dark/light mode).</li>
            <li><strong>Analytics cookies:</strong> Aggregate usage analytics to improve the product. No cross-site tracking.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We do not use advertising or retargeting cookies. You can manage non-essential cookies via your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">9. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete data (most data can be updated directly in your account settings).</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated personal data.</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Restriction:</strong> Ask us to restrict processing of your data in certain circumstances.</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Withdraw consent:</strong> Withdraw consent for marketing emails at any time via the unsubscribe link.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            To exercise any of these rights, email us at <a href="mailto:privacy@stackserp.com" className="text-primary underline">privacy@stackserp.com</a>. We will respond within 30 days.
            EEA/UK users have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">10. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed">
            StackSerp is operated from the United States. If you access the Service from the EEA, UK, or other regions
            with data protection laws, your data is transferred to the US and processed there. We rely on Standard
            Contractual Clauses (SCCs) as the legal mechanism for such transfers where applicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">11. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service is not directed at children under 18. We do not knowingly collect personal data from anyone
            under 18. If you believe a child has provided us with personal data, please contact us at privacy@stackserp.com
            and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">12. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. When we make material changes, we will notify you via
            email and update the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after
            changes become effective constitutes your acceptance of the revised Policy.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t space-y-2 text-sm text-muted-foreground">
          <p>Privacy inquiries: <a href="mailto:privacy@stackserp.com" className="text-primary underline">privacy@stackserp.com</a></p>
          <p>
            See also:{" "}
            <Link href="/terms" className="text-primary underline">Terms of Service</Link>
            {" · "}
            <Link href="/dpa" className="text-primary underline">Data Processing Agreement</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
