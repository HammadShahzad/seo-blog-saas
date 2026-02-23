import { Webhook } from "lucide-react";
import { CodeBlock, SectionAnchor, Step, Note } from "./docs-shared";

export function WebhooksSection() {
  return (
    <section>
      <SectionAnchor id="webhooks" />
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10"><Webhook className="h-5 w-5 text-primary" /></div>
        <h2 className="text-2xl font-bold">Webhooks</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Get notified instantly when a post is published. StackSerp sends an HTTP POST to your URL with the full
        post payload — no polling required.
      </p>

      <div className="space-y-0">
        <Step n={1} title="Set up your endpoint">
          <p>
            Create a public HTTPS endpoint on your server that accepts <code className="bg-muted px-1 rounded text-xs">POST</code> requests.
          </p>
        </Step>
        <Step n={2} title="Register it in StackSerp">
          <p>
            Go to <strong>Website Settings → Integrations → Webhook</strong>. Paste your URL and optionally set a
            secret for signature verification.
          </p>
        </Step>
        <Step n={3} title="Receive the payload">
          <p>When any post is published, StackSerp sends:</p>
          <CodeBlock language="json">{`{
  "event": "post.published",
  "timestamp": "2026-02-21T12:00:00.000Z",
  "post": {
    "id": "clx123...",
    "title": "10 Best SaaS Tools in 2026",
    "slug": "best-saas-tools-2026",
    "content": "## Introduction\\n\\n...",
    "contentHtml": "<h2>Introduction</h2>...",
    "excerpt": "A curated list of...",
    "metaTitle": "10 Best SaaS Tools in 2026",
    "metaDescription": "We reviewed 50+ tools...",
    "focusKeyword": "best saas tools 2026",
    "featuredImage": "https://cdn.stackserp.com/images/...",
    "tags": ["saas", "productivity"],
    "category": "Tools",
    "status": "PUBLISHED",
    "publishedAt": "2026-02-21T12:00:00.000Z",
    "wordCount": 2100,
    "readingTime": 10,
    "websiteId": "ws_abc...",
    "websiteDomain": "mysite.com",
    "brandName": "My Brand"
  }
}`}</CodeBlock>
        </Step>
        <Step n={4} title="Verify the signature (recommended)">
          <p>
            If you set a webhook secret, every request includes{" "}
            <code className="bg-muted px-1 rounded text-xs">X-StackSerp-Signature: sha256=&lt;hmac&gt;</code>.
            Verify it:
          </p>
          <CodeBlock language="javascript">{`import crypto from "crypto";

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-stackserp-signature");

  const expected = "sha256=" + crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { event, post } = JSON.parse(rawBody);

  if (event === "post.published") {
    // Save to your DB, push to CDN, trigger rebuild, etc.
    await savePost(post);
  }

  return new Response("OK");
}`}</CodeBlock>
        </Step>
      </div>

      <Note>
        StackSerp expects a <strong>2xx response within 10 seconds</strong>. For slow operations (rebuilds, syncs),
        respond immediately and process in the background.
      </Note>
    </section>
  );
}
