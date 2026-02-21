import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold">StackSerp</span>
          </Link>
          <p className="text-muted-foreground max-w-xs leading-relaxed mt-2">
            The automated SEO content platform. Build topical authority and drive organic traffic on autopilot.
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href="https://twitter.com/stackserp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-sm font-bold"
              aria-label="Twitter / X"
            >
              X
            </a>
            <a
              href="https://linkedin.com/company/stackserp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-sm font-bold"
              aria-label="LinkedIn"
            >
              in
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Product</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
            <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Resources</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="/docs" className="hover:text-primary transition-colors">Developer Docs</Link></li>
            <li><Link href="/blogs" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link href="/use-cases" className="hover:text-primary transition-colors">Use Cases</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Legal</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/dpa" className="hover:text-primary transition-colors">DPA</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} StackSerp Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          All systems operational
        </div>
      </div>
    </footer>
  );
}
