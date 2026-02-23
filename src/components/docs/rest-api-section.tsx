import { Code2, BookOpen, Terminal, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeBlock, SectionAnchor } from "./docs-shared";

export function RestApiSection() {
  return (
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
  );
}
