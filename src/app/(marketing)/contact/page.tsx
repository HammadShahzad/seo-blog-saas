import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | StackSerp",
  description:
    "Get in touch with the StackSerp team. We're here to help with your SEO, AI content generation, and enterprise needs.",
  keywords: "Contact StackSerp, StackSerp support, enterprise SEO",
  openGraph: {
    title: "Contact StackSerp",
    description: "Reach out to our team for support, sales, or partnerships.",
    type: "website",
    url: "https://stackserp.com/contact",
  },
  alternates: {
    canonical: "https://stackserp.com/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* ── FULL SECTION ── dark left + light right */}
      <section className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
        {/* Left: dark side */}
        <div className="md:w-1/2 bg-zinc-950 px-10 py-20 md:py-28 flex flex-col justify-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
          </div>
          <div className="relative max-w-sm mx-auto md:mx-0 md:ml-auto md:pr-12">
            <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-400 mb-6">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
              Let&apos;s talk about <span className="text-indigo-400">your growth.</span>
            </h1>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Have questions about pricing, features, or enterprise plans?
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Email Us</p>
                  <p className="text-sm text-zinc-400">support@stackserp.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Live Chat</p>
                  <p className="text-sm text-zinc-400">Available inside the app</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: light form side */}
        <div className="md:w-1/2 bg-zinc-50 border-l border-zinc-200 px-10 py-20 md:py-28 flex flex-col justify-center">
          <div className="max-w-sm mx-auto md:mx-0 md:mr-auto md:pl-12 w-full">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Send us a message</h2>
            <p className="text-zinc-500 text-sm mb-8">We typically respond within a few hours.</p>

            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-zinc-700 text-sm font-medium">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="border-zinc-200 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-zinc-700 text-sm font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="border-zinc-200 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-700 text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  className="border-zinc-200 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-zinc-700 text-sm font-medium">Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help you?"
                  className="min-h-[140px] border-zinc-200 bg-white resize-none"
                />
              </div>
              <Button
                className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/20"
                type="button"
              >
                Send Message
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
