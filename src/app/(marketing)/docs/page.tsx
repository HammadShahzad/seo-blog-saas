import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Key,
  Webhook,
  Code2,
  Globe,
  Plug,
  ShoppingBag,
  Zap,
  Copy,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Terminal,
  Cpu,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Developer Docs | StackSerp Integration Guide",
  description:
    "Connect your app, website, or AI agent to StackSerp. Full API reference, webhook setup, CMS integration guides, and a ready-to-use AI agent prompt.",
  keywords: "StackSerp API, webhook integration, REST API docs, connect CMS to StackSerp, developer guide",
  openGraph: {
    title: "StackSerp Developer Docs",
    description: "Connect any CMS or custom app to StackSerp via REST API, webhooks, or direct integrations.",
    type: "website",
    url: "https://stackserp.com/docs",
  },
  alternates: { canonical: "https://stackserp.com/docs" },
};

const NAV = [
  { href: "#quickstart", label: "Quick Start" },
  { href: "#api-keys", label: "API Keys" },
  { href: "#rest-api", label: "REST API" },
  { href: "#webhooks", label: "Webhooks" },
  { href: "#wordpress", label: "WordPress" },
  { href: "#shopify", label: "Shopify" },
  { href: "#ghost", label: "Ghost" },
  { href: "#webflow", label: "Webflow" },
  { href: "#ai-agent-prompt", label: "AI Agent Prompt" },
];

function CodeBlock({ children, language = "bash" }: { children: ReactNode; language?: string }) {
  return (
    <div className="relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden my-4">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <span className="text-xs text-zinc-500 font-mono">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-zinc-200 font-mono leading-relaxed">{children}</code>
      </pre>
    </div>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="-mt-24 pt-24 block" />;
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
        {n}
      </div>
      <div className="flex-1 pb-8 border-b border-border last:border-0">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Note({ type = "info", children }: { type?: "info" | "warning"; children: ReactNode }) {
  const styles =
    type === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
      : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300";
  const Icon = type === "warning" ? AlertCircle : CheckCircle2;
  return (
    <div className={`flex gap-3 rounded-lg border p-4 text-sm my-4 ${styles}`}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

const agentPrompt = `You are integrating with StackSerp — an AI-powered SEO content platform.

== STACKSERP API OVERVIEW ==
Base URL: https://stackserp.com/api/v1
Authentication: Bearer token in Authorization header
  Authorization: Bearer <your_api_key>

== YOUR CREDENTIALS ==
API Key: <PASTE_YOUR_API_KEY_HERE>
Website ID: <PASTE_YOUR_WEBSITE_ID_HERE>

== AVAILABLE ENDPOINTS ==

1. LIST POSTS (published only)
   GET /api/v1/websites/{websiteId}/posts?page=1&limit=20&status=PUBLISHED
   Returns: { posts: [...], total, page, limit }

2. GET SINGLE POST
   GET /api/v1/websites/{websiteId}/posts/{slug}
   Returns full post with: title, slug, content (markdown), contentHtml, excerpt,
   metaTitle, metaDescription, focusKeyword, featuredImage, tags, category,
   status, publishedAt, wordCount, readingTime

3. CREATE POST
   POST /api/v1/websites/{websiteId}/posts
   Body: { title, content, slug?, excerpt?, metaTitle?, metaDescription?,
           focusKeyword?, featuredImage?, tags?, category?, status? }

4. UPDATE POST
   PATCH /api/v1/websites/{websiteId}/posts/{slug}
   Body: (same fields as create, partial update)

5. DELETE POST
   DELETE /api/v1/websites/{websiteId}/posts/{slug}

6. RSS FEED
   GET /api/v1/websites/{websiteId}/feed.xml
   Returns RSS 2.0 XML feed of published posts

7. SITEMAP
   GET /api/v1/websites/{websiteId}/sitemap.xml
   Returns XML sitemap of all published posts

8. TRIGGER CONTENT GENERATION
   POST /api/v1/websites/{websiteId}/generate
   Body: { keyword: string, options?: { tone?, wordCount?, includeImages? } }
   Returns: { jobId, status: "queued" }

9. CHECK JOB STATUS
   GET /api/v1/websites/{websiteId}/jobs/{jobId}
   Returns: { id, status: "pending"|"running"|"completed"|"failed", result? }

10. LIST KEYWORDS
    GET /api/v1/websites/{websiteId}/keywords
    Returns: { keywords: [{ id, keyword, status, difficulty, volume }] }

11. ADD KEYWORD
    POST /api/v1/websites/{websiteId}/keywords
    Body: { keyword: string, priority?: "LOW"|"MEDIUM"|"HIGH" }

== WEBHOOK EVENTS ==
StackSerp POSTs to your webhook URL on:
  - post.published → full post payload

Webhook payload shape:
{
  "event": "post.published",
  "timestamp": "ISO8601",
  "post": {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "content": "markdown string",
    "contentHtml": "html string",
    "excerpt": "string",
    "metaTitle": "string",
    "metaDescription": "string",
    "focusKeyword": "string",
    "featuredImage": "url or null",
    "tags": ["string"],
    "category": "string or null",
    "status": "PUBLISHED",
    "publishedAt": "ISO8601",
    "wordCount": 1500,
    "readingTime": 7,
    "websiteId": "uuid",
    "websiteDomain": "example.com",
    "brandName": "My Brand"
  }
}

Verify webhook signature:
  Header: X-StackSerp-Signature: sha256=<hmac>
  Secret: <your_webhook_secret>
  Compute: HMAC-SHA256(raw_body, secret) and compare hex

== INSTRUCTIONS ==
- Always include Authorization header on every request
- Handle 429 rate limit responses with exponential backoff
- Post content arrives as Markdown — convert to HTML for rendering
- featuredImage is a CDN URL (Backblaze B2) — use directly in <img> tags
- slugs are URL-safe lowercase strings with hyphens

When asked to fetch posts, call endpoint #1.
When asked to publish content, call endpoint #3.
When asked to generate new AI content for a keyword, call endpoint #8 then poll #9.`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Developer Docs</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Connect anything to StackSerp
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            REST API, webhooks, CMS connectors, and a ready-made AI agent prompt — everything you need to pipe
            StackSerp content into your product.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#quickstart">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#ai-agent-prompt">
                <Cpu className="mr-2 h-4 w-4" /> AI Agent Prompt
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* Sticky sidebar nav */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-8 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</p>
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="block text-sm text-muted-foreground hover:text-foreground py-1 hover:underline transition-colors"
              >
                {n.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-20">

          {/* ── QUICK START ── */}
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

          {/* ── API KEYS ── */}
          <section>
            <SectionAnchor id="api-keys" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10"><Key className="h-5 w-5 text-primary" /></div>
              <h2 className="text-2xl font-bold">API Keys</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Every API request requires a Bearer token. Keys are created per account and have configurable scopes.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { scope: "posts:read", desc: "List and fetch blog posts" },
                { scope: "posts:write", desc: "Create, update, and delete posts" },
                { scope: "websites:read", desc: "Read website settings and metadata" },
                { scope: "*", desc: "Full access to all endpoints" },
              ].map((s) => (
                <div key={s.scope} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
                  <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">{s.scope}</code>
                  <span className="text-sm text-muted-foreground">{s.desc}</span>
                </div>
              ))}
            </div>

            <Note>
              API keys are shown <strong>once</strong> at creation. Store them securely in environment variables — never
              commit them to source control.
            </Note>

            <CodeBlock language="bash">{`# All API requests use Bearer authentication
curl https://stackserp.com/api/v1/websites/WEBSITE_ID/posts \\
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx"`}</CodeBlock>
          </section>

          {/* ── REST API ── */}
          <section>
            <SectionAnchor id="rest-api" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10"><Code2 className="h-5 w-5 text-primary" /></div>
              <h2 className="text-2xl font-bold">REST API Reference</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              Base URL: <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">https://stackserp.com/api/v1</code>
            </p>

            <div className="space-y-8">
              {/* Posts */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Posts
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      method: "GET",
                      path: "/websites/{websiteId}/posts",
                      desc: "List posts. Query params: page, limit, status (DRAFT|PUBLISHED|READY).",
                    },
                    {
                      method: "GET",
                      path: "/websites/{websiteId}/posts/{slug}",
                      desc: "Get a single post by slug. Returns full content in Markdown and HTML.",
                    },
                    {
                      method: "POST",
                      path: "/websites/{websiteId}/posts",
                      desc: "Create a new post. Requires posts:write scope.",
                    },
                    {
                      method: "PATCH",
                      path: "/websites/{websiteId}/posts/{slug}",
                      desc: "Partially update a post. Only include fields you want to change.",
                    },
                    {
                      method: "DELETE",
                      path: "/websites/{websiteId}/posts/{slug}",
                      desc: "Delete a post permanently.",
                    },
                  ].map((e) => (
                    <div key={`${e.method}-${e.path}`} className="flex items-start gap-3 p-4 rounded-lg border">
                      <Badge
                        className={`flex-shrink-0 font-mono text-xs ${
                          e.method === "GET"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : e.method === "POST"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : e.method === "PATCH"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {e.method}
                      </Badge>
                      <div>
                        <code className="text-sm font-mono text-foreground">{e.path}</code>
                        <p className="text-xs text-muted-foreground mt-1">{e.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <CodeBlock language="json">{`// GET /api/v1/websites/{websiteId}/posts response
{
  "posts": [
    {
      "id": "clx123...",
      "title": "How to Scale Your SaaS Blog",
      "slug": "how-to-scale-saas-blog",
      "excerpt": "A practical guide to...",
      "content": "## Introduction\\n\\n...",
      "contentHtml": "<h2>Introduction</h2>...",
      "metaTitle": "How to Scale Your SaaS Blog | StackSerp",
      "metaDescription": "Learn how to...",
      "focusKeyword": "saas blog scaling",
      "featuredImage": "https://cdn.stackserp.com/...",
      "tags": ["saas", "content marketing"],
      "category": "Marketing",
      "status": "PUBLISHED",
      "publishedAt": "2026-02-21T10:00:00.000Z",
      "wordCount": 1842,
      "readingTime": 9
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20
}`}</CodeBlock>
              </div>

              {/* Content Generation */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Terminal className="h-4 w-4" /> Content Generation
                </h3>

                <CodeBlock language="bash">{`# Trigger AI content generation for a keyword
curl -X POST https://stackserp.com/api/v1/websites/WEBSITE_ID/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyword": "best project management tools 2026",
    "options": {
      "tone": "professional",
      "wordCount": 2000,
      "includeImages": true
    }
  }'

# Response
{ "jobId": "job_abc123", "status": "queued" }

# Poll job status
curl https://stackserp.com/api/v1/websites/WEBSITE_ID/jobs/job_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Response when done
{ "id": "job_abc123", "status": "completed", "postId": "clx456..." }`}</CodeBlock>
              </div>

              {/* Feed & Sitemap */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Feed & Sitemap
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      path: "/websites/{websiteId}/feed.xml",
                      desc: "RSS 2.0 feed of all published posts. No auth required for hosted blogs.",
                    },
                    {
                      path: "/websites/{websiteId}/sitemap.xml",
                      desc: "XML sitemap of published posts. Useful for headless setups.",
                    },
                  ].map((e) => (
                    <div key={e.path} className="flex items-start gap-3 p-4 rounded-lg border">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-mono text-xs flex-shrink-0">
                        GET
                      </Badge>
                      <div>
                        <code className="text-sm font-mono text-foreground">{e.path}</code>
                        <p className="text-xs text-muted-foreground mt-1">{e.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── WEBHOOKS ── */}
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

          {/* ── WORDPRESS ── */}
          <section>
            <SectionAnchor id="wordpress" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#21759b]/10"><Plug className="h-5 w-5 text-[#21759b]" /></div>
              <h2 className="text-2xl font-bold">WordPress Integration</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Publish AI-generated posts directly to any WordPress site. Two modes — no plugin required for basic use.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl border">
                <h3 className="font-semibold mb-3">Mode 1 — Application Passwords</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Built into WordPress 5.6+. No plugin needed.
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Log into WordPress Admin</li>
                  <li>Go to Users → Your Profile → Application Passwords</li>
                  <li>Create a new password, name it &quot;StackSerp&quot;</li>
                  <li>Copy the generated password</li>
                  <li>Paste your site URL, username, and app password into StackSerp Settings</li>
                </ol>
              </div>
              <div className="p-6 rounded-xl border">
                <h3 className="font-semibold mb-3">Mode 2 — StackSerp Plugin</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For custom post types, Yoast SEO fields, and advanced control.
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Install the StackSerp Connector plugin on your WordPress site</li>
                  <li>Go to Settings → StackSerp → copy your plugin API key</li>
                  <li>Paste your site URL and plugin key into StackSerp Settings</li>
                </ol>
              </div>
            </div>

            <h3 className="font-semibold mb-3">What gets synced</h3>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {["Title", "Content (HTML)", "Excerpt", "Slug", "Featured Image", "Tags", "Category", "Meta Title", "Meta Description", "Focus Keyword (Yoast)"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </section>

          {/* ── SHOPIFY ── */}
          <section>
            <SectionAnchor id="shopify" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#96bf48]/10"><ShoppingBag className="h-5 w-5 text-[#96bf48]" /></div>
              <h2 className="text-2xl font-bold">Shopify Integration</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Publish SEO blog posts straight into your Shopify store&apos;s blog.
            </p>

            <div className="space-y-0">
              <Step n={1} title="Create a Shopify Custom App">
                <p>
                  Go to your Shopify Admin → <strong>Settings → Apps → Develop apps → Create app</strong>. Name it
                  &quot;StackSerp&quot;.
                </p>
              </Step>
              <Step n={2} title="Set the required API scopes">
                <p>
                  Under <strong>Configuration → Admin API access scopes</strong>, enable:
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <code className="text-xs bg-muted px-2 py-1 rounded">read_content</code>
                  <code className="text-xs bg-muted px-2 py-1 rounded">write_content</code>
                </div>
              </Step>
              <Step n={3} title="Install and copy the access token">
                <p>
                  Click <strong>Install app</strong>, then copy the <strong>Admin API access token</strong> (starts with{" "}
                  <code className="bg-muted px-1 rounded text-xs">shpat_</code>).
                </p>
              </Step>
              <Step n={4} title="Connect in StackSerp">
                <p>
                  Go to <strong>Website Settings → Shopify</strong>. Enter your store URL (e.g.{" "}
                  <code className="bg-muted px-1 rounded text-xs">mystore.myshopify.com</code>) and paste your access
                  token.
                </p>
              </Step>
            </div>

            <Note>
              Each Shopify store can have multiple blogs. StackSerp automatically targets your first blog, or you can
              specify a Blog ID in settings.
            </Note>
          </section>

          {/* ── GHOST ── */}
          <section>
            <SectionAnchor id="ghost" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"><Globe className="h-5 w-5 text-zinc-700 dark:text-zinc-300" /></div>
              <h2 className="text-2xl font-bold">Ghost Integration</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Connect StackSerp to any self-hosted or Ghost Pro publication.
            </p>

            <div className="space-y-0">
              <Step n={1} title="Create a Ghost Admin API integration">
                <p>
                  In your Ghost Admin dashboard, go to <strong>Settings → Integrations → Add custom integration</strong>.
                  Name it &quot;StackSerp&quot;.
                </p>
              </Step>
              <Step n={2} title="Copy the Admin API Key">
                <p>
                  Copy the <strong>Admin API Key</strong>. It looks like{" "}
                  <code className="bg-muted px-1 rounded text-xs">64f0a...b3c:ab12...</code> (id:secret format).
                </p>
              </Step>
              <Step n={3} title="Connect in StackSerp">
                <p>
                  Go to <strong>Website Settings → Ghost</strong>. Enter your Ghost site URL and Admin API Key.
                </p>
              </Step>
            </div>

            <Note>
              StackSerp uses Ghost Admin API v5. Make sure your Ghost instance is version 5.x or later.
            </Note>
          </section>

          {/* ── WEBFLOW ── */}
          <section>
            <SectionAnchor id="webflow" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#4353ff]/10"><Code2 className="h-5 w-5 text-[#4353ff]" /></div>
              <h2 className="text-2xl font-bold">Webflow Integration</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Publish AI-generated content directly into your Webflow CMS collection. Perfect for teams using Webflow
              as their primary website platform.
            </p>

            <div className="space-y-0">
              <Step n={1} title="Enable Webflow CMS API access">
                <p>
                  In your Webflow dashboard, go to <strong>Project Settings → Integrations → API Access</strong> and
                  generate a new <strong>API token</strong>. Make sure the token has <strong>CMS read &amp; write</strong> access.
                </p>
              </Step>
              <Step n={2} title="Find your Site ID and Collection ID">
                <p>
                  Your <strong>Site ID</strong> is visible in Project Settings → General. Your <strong>Collection ID</strong> is
                  in the CMS tab — click on your blog collection to find it in the URL or collection settings.
                </p>
              </Step>
              <Step n={3} title="Map your collection fields">
                <p>
                  StackSerp needs to know which Webflow CMS fields map to the post title, body (rich text), slug, and
                  metadata. Common field names: <code className="bg-muted px-1 rounded text-xs">name</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">body</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">slug</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">meta-title</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">meta-description</code>.
                </p>
              </Step>
              <Step n={4} title="Connect in StackSerp">
                <p>
                  Go to <strong>Website Settings → Integrations → Webflow</strong>. Enter your API token, Site ID,
                  and Collection ID. StackSerp will validate the connection and display your collection fields for
                  mapping.
                </p>
              </Step>
              <Step n={5} title="Publish posts to Webflow">
                <p>
                  Once connected, every post in your StackSerp editor will have a <strong>Publish to Webflow</strong>{" "}
                  button. You can also enable auto-publish so content goes live in Webflow automatically when marked
                  as ready.
                </p>
              </Step>
            </div>

            <Note>
              Webflow CMS items are created as <strong>drafts</strong> by default and must be published from the
              Webflow editor or via the Webflow API&apos;s publish endpoint. StackSerp can optionally trigger a site
              publish automatically if configured.
            </Note>
          </section>

          {/* ── AI AGENT PROMPT ── */}
          <section>
            <SectionAnchor id="ai-agent-prompt" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-violet-500/10"><Cpu className="h-5 w-5 text-violet-500" /></div>
              <h2 className="text-2xl font-bold">AI Agent Prompt</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              Building an AI agent or automation that needs to talk to StackSerp? Copy the prompt below and paste it
              into your agent&apos;s system prompt or configuration. Fill in your API key and website ID — that&apos;s it.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Works with <strong>ChatGPT</strong>, <strong>Claude</strong>, <strong>Cursor</strong>,{" "}
              <strong>n8n AI agents</strong>, <strong>LangChain</strong>, <strong>Zapier AI</strong>, and any other LLM
              or automation platform.
            </p>

            <div className="relative rounded-xl bg-zinc-950 border border-violet-500/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs text-zinc-400 font-mono">stackserp-agent-prompt.txt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">Copy & customize</Badge>
                  <Copy className="h-3.5 w-3.5 text-zinc-500" />
                </div>
              </div>
              <pre className="p-6 overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                {agentPrompt}
              </pre>
            </div>

            <Note>
              Replace <code className="font-mono text-xs">&lt;PASTE_YOUR_API_KEY_HERE&gt;</code> and{" "}
              <code className="font-mono text-xs">&lt;PASTE_YOUR_WEBSITE_ID_HERE&gt;</code> with your actual values
              before giving this to your agent.
            </Note>

            <div className="mt-8 p-6 rounded-xl border bg-muted/30">
              <h3 className="font-semibold mb-3">Example agent tasks this prompt enables</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "\"Fetch all published posts and summarize them\"",
                  "\"Generate a new post about [keyword]\"",
                  "\"List posts published this week\"",
                  "\"Check the status of generation job job_abc123\"",
                  "\"Add keyword 'best CRM 2026' to my keyword list\"",
                  "\"Get the full content of post: saas-marketing-guide\"",
                ].map((task) => (
                  <div key={task} className="flex items-start gap-2 text-sm">
                    <Terminal className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground italic">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to connect?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a free account, grab your API key, and start pulling content into your product in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/integrations">View all integrations</Link>
              </Button>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
