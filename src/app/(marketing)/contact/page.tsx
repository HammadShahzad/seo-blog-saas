import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, MapPin } from "lucide-react";

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
      {/* Navigation */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Let's talk about <br />
                <span className="text-primary">your growth.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10">
                Have questions about pricing, features, or enterprise plans? 
                Fill out the form, and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Email Us</h3>
                    <p className="text-muted-foreground">support@stackserp.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Live Chat</h3>
                    <p className="text-muted-foreground">Available inside the app</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px]" />
                </div>
                <Button className="w-full text-lg h-12" type="button">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
