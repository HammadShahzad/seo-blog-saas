import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | StackSerp",
  description: "Read the StackSerp Terms of Service. Covers account usage, content rights, billing, refund policy, and limitations of liability.",
  alternates: { canonical: "https://stackserp.com/terms" },
};

const LAST_UPDATED = "February 1, 2026";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-20 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">

        <section>
          <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using StackSerp (&quot;Service&quot;, &quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;), operated by StackSerp Inc., you agree to be legally
            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to any part of these Terms, you must not use the Service.
            These Terms apply to all users including visitors, registered users, and paying subscribers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            StackSerp is an AI-powered content generation and SEO automation platform. The Service allows users to generate
            SEO-optimized blog posts, manage keyword research, build topic clusters, automate internal linking, and publish
            content to connected CMS platforms including WordPress, Shopify, Ghost, and custom endpoints. StackSerp also
            provides a hosted blog service on subdomains and custom domains.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Eligibility and Account Registration</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You must be at least 18 years of age to use the Service. By registering an account, you represent that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>All registration information you provide is accurate, current, and complete.</li>
            <li>You will maintain the accuracy of such information.</li>
            <li>You are legally authorized to enter into these Terms.</li>
            <li>You will not create accounts using automated means or under false pretenses.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that
            occur under your account. Notify us immediately at support@stackserp.com if you suspect any unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Permitted Use and Restrictions</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You may use the Service for lawful business purposes only. You agree <strong>not</strong> to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Generate content that is illegal, defamatory, abusive, harassing, or designed to deceive.</li>
            <li>Use the Service to intentionally spread misinformation, create spam, or engage in black-hat SEO tactics.</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the Service.</li>
            <li>Resell or sublicense access to the Service without prior written consent.</li>
            <li>Use automated scripts to scrape, extract, or harvest data from the platform beyond normal API usage.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its underlying systems.</li>
            <li>Use the Service in a way that degrades its performance for other users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Content Rights and Ownership</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong>Your content:</strong> You retain full ownership of all content you input into the Service (keywords,
            brand guidelines, custom instructions) and all AI-generated content produced on your behalf through the Service.
            You are solely responsible for the accuracy, legality, and appropriateness of all content you publish.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong>Third-party AI providers:</strong> Content generated through the Service may be subject to terms of
            underlying AI providers (such as Google Gemini). We do not guarantee perpetual rights to generated content if
            third-party provider terms change.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Our platform:</strong> StackSerp retains all rights to the platform itself, including its design, code,
            branding, documentation, and any aggregate anonymized usage data used to improve the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Subscription, Billing &amp; Refunds</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Paid plans are billed in advance on a monthly or annual basis via Stripe. By providing payment information,
            you authorize StackSerp to charge the applicable subscription fees to your payment method.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Free trial:</strong> New accounts may be eligible for a 14-day free trial. No credit card is required unless stated at sign-up.</li>
            <li><strong>Refunds:</strong> We offer a 14-day money-back guarantee for first-time paid subscriptions. Refund requests after this period are reviewed on a case-by-case basis.</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Access continues until the end of your current billing period. No partial refunds are issued for unused time.</li>
            <li><strong>Price changes:</strong> We will give at least 30 days&apos; notice before increasing subscription prices. Continued use after notice constitutes acceptance.</li>
            <li><strong>Taxes:</strong> Prices are exclusive of applicable taxes. You are responsible for any sales tax, VAT, or other taxes in your jurisdiction.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. API Usage and Rate Limits</h2>
          <p className="text-muted-foreground leading-relaxed">
            API access is included in paid plans subject to rate limits defined in your plan tier. Excessive API usage that
            degrades service for other users may be throttled or suspended. We reserve the right to adjust API rate limits
            with reasonable notice. You are responsible for securing your API keys and for all usage attributed to your keys.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Integrations and Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            StackSerp integrates with third-party services including WordPress, Shopify, Ghost, Webflow, and others. We are
            not responsible for the availability, accuracy, or compliance of those third-party platforms. You are
            responsible for ensuring your use of connected platforms complies with their respective terms of service.
            Credentials you provide for integrations (API keys, passwords) are stored in encrypted form and used solely
            to fulfill the integration service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">9. Uptime and Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed">
            We target 99.5% monthly uptime for the core platform. Scheduled maintenance will be announced in advance
            where possible. Downtime caused by third-party infrastructure (hosting providers, AI APIs, CMS platforms)
            is outside our direct control. We do not offer SLA credits unless agreed in an enterprise agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">10. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            We do not warrant that AI-generated content is accurate, complete, current, or free from errors. You use
            AI-generated content at your own risk and are responsible for reviewing it before publication.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">11. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STACKSERP INC. AND ITS DIRECTORS, EMPLOYEES, PARTNERS, AND
            AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE
            OF OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE SERVICE SHALL NOT EXCEED
            THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM OR (B) USD $100.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">12. Indemnification</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to indemnify, defend, and hold harmless StackSerp Inc. and its affiliates, officers, agents, and
            employees from and against any claims, damages, obligations, losses, liabilities, costs, or expenses (including
            attorney&apos;s fees) arising from: (i) your use of the Service; (ii) your violation of these Terms; (iii) content
            you publish using the Service; or (iv) your violation of any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">13. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may suspend or terminate your account at any time, with or without cause, if we believe you have violated
            these Terms or our Acceptable Use Policy. Upon termination, your right to use the Service ceases immediately.
            You may request an export of your content data within 30 days of termination. After that period, we may
            permanently delete your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">14. Governing Law and Disputes</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law
            principles. Any dispute arising under these Terms shall first be subject to good-faith negotiation. If
            unresolved, disputes shall be settled by binding arbitration under the rules of the American Arbitration
            Association. You waive the right to participate in class action lawsuits against StackSerp.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">15. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. Material changes will be communicated via email to
            your registered address at least 14 days before taking effect. Continued use of the Service after the
            effective date constitutes your acceptance of the revised Terms. The most current version will always be
            available at stackserp.com/terms.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t space-y-2 text-sm text-muted-foreground">
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@stackserp.com" className="text-primary underline">legal@stackserp.com</a></p>
          <p>
            See also:{" "}
            <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>
            {" · "}
            <Link href="/dpa" className="text-primary underline">Data Processing Agreement</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
