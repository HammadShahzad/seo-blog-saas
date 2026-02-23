import Link from "next/link";
import { Zap } from "lucide-react";
import { CodeBlock, SectionAnchor, Step } from "./docs-shared";

export function QuickStartSection() {
  return (
    <section>
      <SectionAnchor id="quickstart" />
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10"><Zap className="h-5 w-5 text-primary" /></div>
        <h2 className="text-2xl font-bold">Quick Start</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        You can be pulling live blog content from StackSerp in under 5 minutes. Here&apos;s the fastest path:
      </p>

      <div className="space-y-0">
        <Step n={1} title="Create a free StackSerp account">
          <p>
            Go to{" "}
            <Link href="/register" className="text-primary underline">
              stackserp.com/register
            </Link>{" "}
            and create your account. No credit card required.
          </p>
        </Step>
        <Step n={2} title="Add your website">
          <p>
            In your dashboard, click <strong>Add Website</strong>. Enter your domain and niche. StackSerp will
            create a website workspace for you.
          </p>
        </Step>
        <Step n={3} title="Generate your API key">
          <p>
            Go to <strong>Account → API Keys</strong> and create a new key. Copy the key — it&apos;s shown only
            once.
          </p>
        </Step>
        <Step n={4} title="Find your Website ID">
          <p>
            Open your website in the dashboard. The URL will look like{" "}
            <code className="bg-muted px-1 rounded text-xs">/dashboard/websites/YOUR_WEBSITE_ID</code>. Copy
            that UUID.
          </p>
        </Step>
        <Step n={5} title="Make your first API call">
          <p>Fetch your published posts:</p>
          <CodeBlock language="bash">{`curl https://stackserp.com/api/v1/websites/YOUR_WEBSITE_ID/posts \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
        </Step>
      </div>
    </section>
  );
}
