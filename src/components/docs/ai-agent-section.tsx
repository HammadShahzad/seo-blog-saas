import { Cpu, Copy, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionAnchor, Note } from "./docs-shared";

const agentPrompt = `You are integrating StackSerp (an AI SEO blog platform) into a website.
StackSerp generates blog posts automatically. Your job is to receive those
posts and display them on this website.

== CREDENTIALS ==
API Key: <PASTE_YOUR_API_KEY_HERE>
Website ID: <PASTE_YOUR_WEBSITE_ID_HERE>
Webhook Secret: <PASTE_YOUR_WEBHOOK_SECRET_HERE>

== HOW IT WORKS ==
StackSerp publishes blog posts via two methods. Use whichever fits your stack:

METHOD 1 — WEBHOOK (recommended)
StackSerp POSTs a JSON payload to your endpoint every time a post is published.
Create an API route to receive it.

Webhook payload:
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
    "featuredImageAlt": "string or null",
    "tags": ["string"],
    "category": "string or null",
    "status": "PUBLISHED",
    "publishedAt": "ISO8601",
    "wordCount": 1500,
    "readingTime": 7
  }
}

Verify the signature before processing:
  Header: X-StackSerp-Signature: sha256=<hmac>
  Compute: HMAC-SHA256(raw_body, webhook_secret) → compare hex digest

Example webhook handler (Next.js App Router):

  // app/api/stackserp-webhook/route.ts
  import crypto from "crypto";
  import { NextResponse } from "next/server";

  export async function POST(req: Request) {
    const secret = process.env.STACKSERP_WEBHOOK_SECRET!;
    const body = await req.text();
    const sig = req.headers.get("x-stackserp-signature") || "";
    const expected = "sha256=" +
      crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (sig !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { event, post } = JSON.parse(body);

    if (event === "post.published") {
      // Save to your database, write as MDX file, or however you store content.
      // Fields available: post.title, post.slug, post.content (markdown),
      // post.contentHtml (ready-to-render HTML), post.excerpt, post.metaTitle,
      // post.metaDescription, post.featuredImage, post.featuredImageAlt,
      // post.tags, post.category, post.wordCount, post.readingTime
      await savePostToDatabase(post);
    }

    return NextResponse.json({ received: true });
  }

Then set your webhook URL in StackSerp dashboard → Settings → Webhook:
  https://yoursite.com/api/stackserp-webhook

METHOD 2 — PULL VIA API
Fetch posts on demand. Useful for static site builds or initial sync.

Base URL: https://stackserp.com/api/v1
Auth header: Authorization: Bearer <your_api_key>

LIST POSTS (paginated):
  GET /api/v1/websites/{websiteId}/posts?page=1&limit=20&status=PUBLISHED
  Returns: { posts: [{ id, title, slug, excerpt, metaTitle, metaDescription,
  focusKeyword, featuredImage, status, publishedAt, wordCount, readingTime,
  category, tags }], pagination: { page, limit, total, totalPages } }

GET SINGLE POST (full content):
  GET /api/v1/websites/{websiteId}/posts/{slug}
  Returns full post object including content (markdown) and contentHtml

RSS FEED:
  GET /api/v1/websites/{websiteId}/feed.xml
  Returns RSS 2.0 XML — useful for feed readers or static site ingestion

SITEMAP:
  GET /api/v1/websites/{websiteId}/sitemap.xml
  Returns XML sitemap of all published posts

== POST DATA GUIDE ==
- content: raw Markdown — convert to HTML yourself, or use contentHtml
- contentHtml: pre-rendered HTML — ready to inject into your page
- featuredImage: CDN URL — use directly in <img> tags
- metaTitle / metaDescription: use in <head> for SEO
- slug: URL-safe lowercase string with hyphens — use as your URL path
- tags: array of strings — use for filtering, tag pages, or related posts
- category: string or null — use for blog sections

== INSTRUCTIONS ==
- When asked to set up StackSerp integration, create the webhook handler above
- When asked to display blog posts, fetch from the API or read from your DB
- When asked to build a blog page, use the post fields to render the layout
- Post content is Markdown — use contentHtml for direct rendering
- featuredImage is a CDN URL — use directly, no download needed
- Handle 429 rate limit responses with exponential backoff on API calls`;

export function AiAgentSection() {
  return (
    <section>
      <SectionAnchor id="ai-agent-prompt" />
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-500/10"><Cpu className="h-5 w-5 text-violet-500" /></div>
        <h2 className="text-2xl font-bold">AI Agent Prompt</h2>
      </div>
      <p className="text-muted-foreground mb-2">
        Building a website and want it to auto-receive blog posts from StackSerp? Copy the prompt below and paste it
        into your AI coding tool. Fill in your credentials — that&apos;s it.
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Works with <strong>Cursor</strong>, <strong>Claude Code</strong>, <strong>Windsurf</strong>,{" "}
        <strong>GitHub Copilot</strong>, <strong>v0</strong>, <strong>Bolt</strong>, and any other AI coding assistant.
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
        Replace <code className="font-mono text-xs">&lt;PASTE_YOUR_API_KEY_HERE&gt;</code>,{" "}
        <code className="font-mono text-xs">&lt;PASTE_YOUR_WEBSITE_ID_HERE&gt;</code>, and{" "}
        <code className="font-mono text-xs">&lt;PASTE_YOUR_WEBHOOK_SECRET_HERE&gt;</code> with your actual values
        from the StackSerp dashboard before pasting into your AI coding tool.
      </Note>

      <div className="mt-8 p-6 rounded-xl border bg-muted/30">
        <h3 className="font-semibold mb-3">Example agent tasks this prompt enables</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "\"Set up StackSerp webhook to receive blog posts\"",
            "\"Build a blog listing page using posts from StackSerp\"",
            "\"Create a dynamic blog post page with SEO meta tags\"",
            "\"Fetch all published posts and display them on the homepage\"",
            "\"Add an RSS feed page that pulls from StackSerp\"",
            "\"Build a blog with categories and tag filtering\"",
          ].map((task) => (
            <div key={task} className="flex items-start gap-2 text-sm">
              <Terminal className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground italic">{task}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
