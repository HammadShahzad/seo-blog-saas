import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocsCta() {
  return (
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
  );
}
