import { ArrowRight, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DocsHero() {
  return (
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
  );
}
