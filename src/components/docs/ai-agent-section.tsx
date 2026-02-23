import { Cpu, Copy, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionAnchor, Note } from "./docs-shared";

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

export function AiAgentSection() {
  return (
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
  );
}
