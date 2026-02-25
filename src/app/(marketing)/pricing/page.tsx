"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying things out",
    monthlyPrice: 0,
    annualPrice: 0,
    highlight: false,
    cta: "Get Started Free",
    features: {
      websites: "1",
      postsPerMonth: "2",
      aiImages: "2",
      apiAccess: false,
      cmsPush: false,
      socialPublishing: false,
      topicClusters: "0",
      analytics: "Basic",
      teamMembers: "1",
      support: "Community",
      whiteLabel: false,
    },
  },
  {
    name: "Starter",
    description: "For individuals & small blogs",
    monthlyPrice: 29,
    annualPrice: 23,
    highlight: false,
    cta: "Get Started",
    features: {
      websites: "3",
      postsPerMonth: "20",
      aiImages: "20",
      apiAccess: true,
      cmsPush: "WordPress",
      socialPublishing: "1 platform",
      topicClusters: "2/month",
      analytics: "Standard",
      teamMembers: "3",
      support: "Email",
      whiteLabel: false,
    },
  },
  {
    name: "Growth",
    description: "For growing businesses",
    monthlyPrice: 79,
    annualPrice: 63,
    highlight: true,
    cta: "Get Started",
    features: {
      websites: "10",
      postsPerMonth: "60",
      aiImages: "60",
      apiAccess: true,
      cmsPush: "All CMS",
      socialPublishing: "All platforms",
      topicClusters: "10/month",
      analytics: "Advanced",
      teamMembers: "10",
      support: "Priority",
      whiteLabel: false,
    },
  },
  {
    name: "Agency",
    description: "For agencies & large teams",
    monthlyPrice: 199,
    annualPrice: 159,
    highlight: false,
    cta: "Get Started",
    features: {
      websites: "50",
      postsPerMonth: "200",
      aiImages: "200",
      apiAccess: true,
      cmsPush: "All CMS",
      socialPublishing: "All platforms",
      topicClusters: "Unlimited",
      analytics: "Advanced",
      teamMembers: "Unlimited",
      support: "Dedicated",
      whiteLabel: true,
    },
  },
];

const featureLabels: Record<string, string> = {
  websites: "Websites",
  postsPerMonth: "Posts/month",
  aiImages: "AI Images/month",
  apiAccess: "API Access",
  cmsPush: "CMS Push",
  socialPublishing: "Social Publishing",
  topicClusters: "Topic Clusters",
  analytics: "Analytics",
  teamMembers: "Team Members",
  support: "Support",
  whiteLabel: "White Label",
};

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at the start of your next billing cycle.",
  },
  {
    question: "What happens when I hit my post limit?",
    answer:
      "When you reach your monthly post limit, queued posts will pause until the next billing cycle. You can upgrade your plan at any time to increase your limit, or purchase additional post credits.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "We offer a generous Free plan with 5 posts/month so you can try the platform risk-free. No credit card required. When you're ready to scale, upgrade to a paid plan.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "Annual billing gives you a 20% discount compared to monthly pricing. You'll be billed once per year. You can cancel anytime and continue using the service until the end of your billing period.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Absolutely. You can cancel at any time from your account settings. Your plan will remain active until the end of your current billing period. No questions asked.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied within the first 14 days, contact support for a full refund.",
  },
  {
    question: "How do team members work?",
    answer:
      "Each plan includes a set number of team seats: Free (1), Starter (3), Growth (10), Agency (unlimited). Team members share the same workspace — websites, posts, and keywords are all accessible to everyone on the team.",
  },
  {
    question: "Can I give different permissions to team members?",
    answer:
      "Yes. Every team member has a role: Owner, Admin, or Member. Owners have full control including billing. Admins can manage websites, generate content, and invite new members. Members can create and edit content but cannot change settings or manage the team.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ── HERO ── dark */}
      <section className="bg-zinc-950 pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
            <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5" />
            Simple Pricing
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Plans that scale with{" "}
            <span className="text-indigo-400">your growth</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-zinc-500"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? "bg-indigo-600" : "bg-zinc-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-zinc-500"}`}>Annual</span>
            {annual && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── light */}
      <section className="py-16 px-4 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl flex flex-col relative transition-shadow ${
                    plan.highlight
                      ? "border-2 border-indigo-500 shadow-xl shadow-indigo-900/20 bg-white"
                      : "border border-zinc-200 bg-white hover:shadow-md"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className={`rounded-t-2xl p-6 pb-5 ${plan.highlight ? "bg-indigo-600" : "bg-zinc-50 border-b border-zinc-100"}`}>
                    <h3 className={`text-lg font-semibold ${plan.highlight ? "text-white" : "text-zinc-900"}`}>{plan.name}</h3>
                    <p className={`text-sm mt-1 ${plan.highlight ? "text-indigo-200" : "text-zinc-500"}`}>{plan.description}</p>
                    <div className="mt-4">
                      <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-zinc-900"}`}>${price}</span>
                      {price > 0 && <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-zinc-500"}`}>/mo</span>}
                      {annual && price > 0 && (
                        <p className={`text-xs mt-1 ${plan.highlight ? "text-indigo-200" : "text-zinc-400"}`}>Billed annually</p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1">
                    <ul className="space-y-3 mb-6">
                      {Object.entries(plan.features).map(([key, value]) => {
                        const isBoolean = typeof value === "boolean";
                        return (
                          <li key={key} className="flex items-center gap-2 text-sm">
                            {isBoolean && !value ? (
                              <X className="h-4 w-4 text-zinc-300 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            )}
                            <span className={isBoolean && !value ? "text-zinc-300" : "text-zinc-600"}>
                              {isBoolean
                                ? featureLabels[key]
                                : `${value} ${featureLabels[key]?.toLowerCase() || key}`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="p-6 pt-0">
                    <Button
                      asChild
                      className={`w-full h-10 font-semibold ${
                        plan.highlight
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                          : "bg-zinc-900 hover:bg-zinc-800 text-white border-0"
                      }`}
                    >
                      <Link href="/register">{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── light */}
      <section className="py-20 px-4 bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-3">
              Frequently asked questions
            </h2>
            <p className="text-zinc-500">
              Everything you need to know about billing and plans
            </p>
          </div>
          <div className="divide-y divide-zinc-200">
            {faqs.map((faq, index) => (
              <div key={index} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="font-semibold text-zinc-900 text-sm md:text-base pr-4 group-hover:text-indigo-600 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180 text-indigo-500" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── dark */}
      <section className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to automate your content marketing?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of businesses using AI to grow their organic traffic.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
            <Link href="/register">
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
