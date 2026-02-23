import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export interface BlogPostLayoutProps {
  children: React.ReactNode;
  jsonLdObjects: unknown[];
  subdomain: string;
  website: {
    brandName: string;
    brandUrl: string;
    domain: string;
  };
  post: {
    title: string;
    category: string | null;
  };
}

export function BlogPostLayout({
  children,
  jsonLdObjects,
  subdomain,
  website,
  post,
}: BlogPostLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {jsonLdObjects.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}

      <header className="sticky top-0 z-50">
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link
              href={`/blog/${subdomain}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {website.brandName} Blog
            </Link>
            <a
              href={website.brandUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {website.domain} ↗
            </a>
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <a href={website.brandUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            {website.brandName}
          </a>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/blog/${subdomain}`} className="hover:text-foreground transition-colors">
            Blog
          </Link>
          {post.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-muted-foreground">{post.category}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
        </nav>
      </div>

      <main>{children}</main>

      <footer className="border-t bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a href={website.brandUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {website.brandName}
            </a>
          </p>
          <div className="flex gap-4">
            <Link href={`/blog/${subdomain}`} className="hover:text-foreground">
              Blog
            </Link>
            <a href={website.brandUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Website
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
