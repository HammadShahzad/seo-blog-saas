import { Key } from "lucide-react";
import { CodeBlock, SectionAnchor, Note } from "./docs-shared";

export function ApiKeysSection() {
  return (
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
  );
}
