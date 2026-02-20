import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — StackSerp",
  description:
    "Simple, transparent pricing for AI-powered content marketing. Start free with 5 posts/month. Scale as you grow.",
  openGraph: {
    title: "Pricing — StackSerp",
    description:
      "Start free with 5 posts/month. Upgrade when you're ready. No hidden fees.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
