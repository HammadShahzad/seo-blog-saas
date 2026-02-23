import { Plug, ShoppingBag, Globe, Code2, CheckCircle2 } from "lucide-react";
import { SectionAnchor, Step, Note } from "./docs-shared";

export function WordPressSection() {
  return (
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
  );
}

export function ShopifySection() {
  return (
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
  );
}

export function GhostSection() {
  return (
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
  );
}

export function WebflowSection() {
  return (
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
  );
}
