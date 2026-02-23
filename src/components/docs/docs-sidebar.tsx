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

export function DocsSidebar() {
  return (
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
  );
}
