import Link from "next/link";
import { Clock } from "lucide-react";

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  readingTime: number | null;
  publishedAt: Date | null;
  category: string | null;
}

interface RelatedPostsProps {
  related: RelatedPost[];
}

export function RelatedPosts({ related }: RelatedPostsProps) {
  return (
    <section className="border-t py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold mb-6">Related Articles</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/blogs/${r.slug}`}
              className="group block border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            >
              {r.featuredImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={r.featuredImage}
                  alt={r.featuredImageAlt || r.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
              <div className="p-4">
                {r.category && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {r.category}
                  </span>
                )}
                <p className="font-semibold text-sm line-clamp-2 group-hover:text-primary mt-1">
                  {r.title}
                </p>
                {r.readingTime && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {r.readingTime} min read
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
