"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, Globe, Palette, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Basic Info", icon: Globe },
  { id: 2, title: "Brand Details", icon: Palette },
  { id: 3, title: "Content Strategy", icon: Target },
];

export default function NewWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    brandName: "",
    brandUrl: "",
    primaryColor: "#4F46E5",
    niche: "",
    description: "",
    targetAudience: "",
    tone: "professional yet conversational",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill brand URL when domain changes
    if (field === "domain" && !formData.brandUrl) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        brandUrl: value ? `https://www.${value}` : "",
      }));
    }

    // Auto-fill brand name from name
    if (field === "name" && !formData.brandName) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        brandName: value,
      }));
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.name && formData.domain;
    if (step === 2) return formData.brandName && formData.brandUrl;
    if (step === 3)
      return formData.niche && formData.description && formData.targetAudience;
    return false;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create website");
        return;
      }

      toast.success("Website created successfully!");
      router.push(`/dashboard/websites/${data.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/websites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Add New Website</h2>
          <p className="text-muted-foreground">
            Set up a new website for AI content generation
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                step === s.id
                  ? "bg-primary text-primary-foreground"
                  : step > s.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.title}
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Tell us about your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Website Name</Label>
              <Input
                id="name"
                placeholder="e.g., InvoiceCave Blog"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A display name for this website in your dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., invoicecave.com"
                value={formData.domain}
                onChange={(e) => updateField("domain", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your website&apos;s domain name (without https://)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Brand Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Details</CardTitle>
            <CardDescription>
              Configure your brand identity for content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="e.g., InvoiceCave"
                value={formData.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandUrl">Brand URL</Label>
              <Input
                id="brandUrl"
                placeholder="e.g., https://www.invoicecave.com"
                value={formData.brandUrl}
                onChange={(e) => updateField("brandUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  className="h-10 w-10 rounded border cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Content Strategy */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Content Strategy
              <Sparkles className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription>
              This information helps our AI generate relevant, targeted content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Niche / Industry</Label>
              <Input
                id="niche"
                placeholder="e.g., invoicing software for small businesses"
                value={formData.niche}
                onChange={(e) => updateField("niche", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                What industry or topic area does your content cover?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Cloud-based invoicing and accounting platform that helps freelancers and small businesses manage their finances"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                placeholder="e.g., Freelancers, small business owners, accountants, and solopreneurs"
                value={formData.targetAudience}
                onChange={(e) => updateField("targetAudience", e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Writing Tone</Label>
              <Input
                id="tone"
                placeholder="e.g., professional yet conversational"
                value={formData.tone}
                onChange={(e) => updateField("tone", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The writing style AI should use for your content
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Website
          </Button>
        )}
      </div>
    </div>
  );
}
