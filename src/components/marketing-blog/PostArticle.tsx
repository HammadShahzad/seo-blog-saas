import { Calendar, Clock, User, Tag, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

export interface PostArticleProps {
  post: {
    title: string;
    category: string | null;
    excerpt: string | null;
    publishedAt: Date | null;
    featuredImage: string | null;
    featuredImageAlt: string | null;
  };
  readingTime: number;
  cleanContent: string;
  tags: string[];
  postUrl: string;
}

const sanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "table", "thead", "tbody", "tr", "th", "td",
    "details", "summary",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] || []), "className", "class"],
    a: [...(defaultSchema.attributes?.a || []), "href", "title", "target", "rel"],
    img: [...(defaultSchema.attributes?.img || []), "src", "alt", "title", "width", "height", "loading"],
  },
};

export function PostArticle({
  post,
  readingTime,
  cleanContent,
  tags,
  postUrl,
}: PostArticleProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {post.category && (
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
          {post.category}
        </span>
      )}

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-4 leading-tight tracking-tight">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="text-lg text-muted-foreground leading-relaxed mb-2">
          {post.excerpt}
        </p>
      )}

      <div className="flex items-center gap-4 mt-4 mb-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          StackSerp
        </span>
        {post.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.publishedAt.toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {readingTime} min read
        </span>
      </div>

      {post.featuredImage && (
        <figure className="mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="w-full rounded-2xl object-cover max-h-[500px]"
            loading="eager"
            width={1200}
            height={630}
          />
          {post.featuredImageAlt && (
            <figcaption className="text-center text-xs text-muted-foreground mt-2">
              {post.featuredImageAlt}
            </figcaption>
          )}
        </figure>
      )}

      <section className="prose prose-slate prose-lg max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground [&_table]:block [&_table]:overflow-x-auto [&_table]:whitespace-nowrap sm:[&_table]:table sm:[&_table]:whitespace-normal [&_th]:bg-slate-100 [&_th]:border [&_th]:border-slate-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-sm [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_table]:border-collapse [&_table]:w-full [&_table]:text-base sm:[&_th]:px-4 sm:[&_td]:px-4 sm:[&_th]:text-base sm:[&_td]:text-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeSanitize, sanitizeOptions], rehypeSlug]}
        >
          {cleanContent}
        </ReactMarkdown>
      </section>

      {tags.length > 0 && (
        <aside className="mt-12 pt-8 border-t flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </aside>
      )}

      <aside className="mt-10 p-6 bg-slate-50 rounded-2xl border flex items-start gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground flex-shrink-0">
          <Logo className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">StackSerp</p>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered blog generation and SEO automation platform. Generate high-quality,
            SEO-optimized content in minutes.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:underline"
            >
              Visit StackSerp
            </Link>
            <Link
              href="/blogs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              More Articles
            </Link>
          </div>
        </div>
      </aside>

      <div className="mt-10 pt-6 border-t flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Found this helpful?</p>
          <p className="text-xs text-muted-foreground">Share it with your network</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" /> Tweet
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" /> LinkedIn
          </a>
        </div>
      </div>

      <div className="mt-10 p-8 rounded-2xl text-center bg-gradient-to-r from-primary to-purple-600">
        <h2 className="text-2xl font-bold text-white mb-2">
          Ready to automate your SEO content?
        </h2>
        <p className="text-white/80 mb-6">
          Generate high-quality blog posts in minutes, not hours.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
        >
          Start for Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
