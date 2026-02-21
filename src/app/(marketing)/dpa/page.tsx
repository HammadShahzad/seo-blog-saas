import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement (DPA) | StackSerp",
  description:
    "StackSerp Data Processing Agreement — outlines how we process personal data on behalf of our customers in accordance with GDPR and applicable data protection laws.",
  alternates: { canonical: "https://stackserp.com/dpa" },
};

export default function DpaPage() {
  return (
    <>
      <main className="max-w-3xl mx-auto py-20 px-4 prose prose-neutral dark:prose-invert">
        <h1>Data Processing Agreement (DPA)</h1>
        <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>

        <p>
          This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the Terms of Service between StackSerp Inc. (&ldquo;Processor&rdquo;) and the customer (&ldquo;Controller&rdquo;) and governs the processing of personal data as defined under applicable data protection legislation, including the General Data Protection Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;).
        </p>

        <h2>1. Definitions</h2>
        <ul>
          <li><strong>Personal Data</strong> — any information relating to an identified or identifiable natural person.</li>
          <li><strong>Processing</strong> — any operation performed on personal data, including collection, storage, use, or deletion.</li>
          <li><strong>Controller</strong> — the customer who determines the purposes and means of data processing.</li>
          <li><strong>Processor</strong> — StackSerp Inc., which processes data on behalf of the Controller.</li>
          <li><strong>Sub-processor</strong> — third parties engaged by StackSerp to assist in data processing.</li>
        </ul>

        <h2>2. Scope and Purpose of Processing</h2>
        <p>
          StackSerp processes personal data solely as necessary to provide the services described in our Terms of Service. This includes storing account information, processing payments via Stripe, and transmitting content generation prompts to AI sub-processors (such as Google AI and Perplexity) to fulfill service requests.
        </p>

        <h2>3. Controller Obligations</h2>
        <p>The Controller agrees to:</p>
        <ul>
          <li>Ensure a lawful basis exists for all personal data provided to StackSerp for processing</li>
          <li>Provide appropriate notice to data subjects about StackSerp&apos;s role as a processor</li>
          <li>Not instruct StackSerp to process personal data in violation of applicable laws</li>
        </ul>

        <h2>4. Processor Obligations</h2>
        <p>StackSerp agrees to:</p>
        <ul>
          <li>Process personal data only on documented instructions from the Controller</li>
          <li>Ensure personnel authorized to process personal data are bound by confidentiality obligations</li>
          <li>Implement appropriate technical and organizational security measures</li>
          <li>Assist the Controller in fulfilling data subject rights requests</li>
          <li>Delete or return all personal data upon termination of the services agreement</li>
          <li>Provide all information necessary to demonstrate compliance with this DPA</li>
        </ul>

        <h2>5. Sub-Processors</h2>
        <p>StackSerp currently uses the following categories of sub-processors:</p>
        <ul>
          <li><strong>Cloud Infrastructure</strong> — Vercel, DigitalOcean (hosting and database)</li>
          <li><strong>Payment Processing</strong> — Stripe (billing and subscription management)</li>
          <li><strong>AI Services</strong> — Google AI Studio / Gemini (content generation), Perplexity AI (research)</li>
          <li><strong>File Storage</strong> — Backblaze B2 (image storage)</li>
        </ul>
        <p>
          StackSerp will notify the Controller of any intended changes to sub-processors with reasonable advance notice. The Controller may object to new sub-processors by providing written notice within 14 days.
        </p>

        <h2>6. International Data Transfers</h2>
        <p>
          Personal data may be transferred to and processed in countries outside the European Economic Area (EEA). StackSerp ensures such transfers are subject to appropriate safeguards, including Standard Contractual Clauses (SCCs) where required.
        </p>

        <h2>7. Security Measures</h2>
        <p>StackSerp implements the following technical and organizational measures:</p>
        <ul>
          <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
          <li>Access controls and authentication requirements for all personnel</li>
          <li>Regular security assessments and vulnerability management</li>
          <li>Incident response procedures with breach notification timelines</li>
          <li>Logical separation of customer data in multi-tenant environments</li>
        </ul>

        <h2>8. Data Subject Rights</h2>
        <p>
          StackSerp will assist the Controller in responding to data subject requests for access, rectification, erasure, restriction, portability, or objection within applicable timeframes. Requests can be submitted to privacy@stackserp.com.
        </p>

        <h2>9. Data Breach Notification</h2>
        <p>
          In the event of a personal data breach, StackSerp will notify the Controller without undue delay and within 72 hours of becoming aware, providing sufficient information to allow the Controller to meet its own notification obligations.
        </p>

        <h2>10. Data Retention and Deletion</h2>
        <p>
          Upon termination of the services agreement, StackSerp will delete or return all personal data within 30 days, unless longer retention is required by law. Anonymized or aggregated data may be retained for analytics purposes.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          This DPA is governed by the laws applicable to the main Terms of Service agreement between the parties.
        </p>

        <p className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          For DPA-related inquiries, contact: <a href="mailto:privacy@stackserp.com" className="text-primary hover:underline">privacy@stackserp.com</a>
        </p>
      </main>
    </>
  );
}
