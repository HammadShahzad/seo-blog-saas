import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | StackSerp AI SEO Content Generator",
  description:
    "Simple, transparent pricing for StackSerp. Generate high-quality SEO content for a fraction of the cost of a freelance writer. Start for free.",
  keywords: "StackSerp pricing, AI content generator cost, SEO automation pricing",
  openGraph: {
    title: "StackSerp Pricing | Scale Your Content ROI",
    description:
      "Choose a plan that fits your growth. Generate months of SEO content in minutes. No credit card required to start.",
    type: "website",
    url: "https://stackserp.com/pricing",
  },
  alternates: {
    canonical: "https://stackserp.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
