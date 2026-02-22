"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Globe,
  Palette,
  Target,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Search,
  Brain,
  FileText,
  Eye,
  Plus,
  X,
} from "lucide-react";
import { AiLoading, AI_STEPS } from "@/components/ui/ai-loading";
import Link from "next/link";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Basic Info", icon: Globe },
  { id: 2, title: "Brand Details", icon: Palette },
  { id: 3, title: "Content Strategy", icon: Target },
];

interface AIRawData {
  brandName: string;
  brandUrl: string;
  primaryColor: string[];
  niche: string[];
  description: string[];
  targetAudience: string[];
  tone: string[];
  uniqueValueProp: string[];
  competitors: string[];
  keyProducts: string[];
  targetLocation: string;
  suggestedCtaText: string[];
  suggestedCtaUrl: string;
  suggestedWritingStyle: string[];
}

// ── Inline option picker ────────────────────────────────────────
function OptionPicker({
  options,
  selectedIndex,
  onSelect,
  isTextarea = false,
}: {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isTextarea?: boolean;
}) {
  if (!options || options.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-all ${
            selectedIndex === i
              ? "bg-violet-50 border-violet-300 text-violet-900 ring-1 ring-violet-200"
              : "bg-muted/30 border-transparent hover:bg-muted/60 text-muted-foreground"
          } ${isTextarea ? "leading-relaxed" : ""}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const VALID_WRITING_STYLES = ["informative", "conversational", "technical", "storytelling", "persuasive", "humorous"];

export default function NewWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  // Full raw AI response (for 3-option pickers)
  const [aiRawData, setAiRawData] = useState<AIRawData | null>(null);
  // Which option index is selected per field
  const [aiSelections, setAiSelections] = useState<Record<string, number>>({});

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
    uniqueValueProp: "",
    competitors: [] as string[],
    keyProducts: [] as string[],
    targetLocation: "",
    // Content & AI (saved to BlogSettings on creation)
    ctaText: "",
    ctaUrl: "",
    writingStyle: "informative",
  });

  const [competitorInput, setCompetitorInput] = useState("");
  const [keyProductInput, setKeyProductInput] = useState("");

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Pick an AI option for a given field
  const selectAiOption = (aiKey: string, formKey: string, index: number) => {
    if (!aiRawData) return;
    const options = (aiRawData as unknown as Record<string, unknown>)[aiKey];
    if (!Array.isArray(options)) return;
    setAiSelections((prev) => ({ ...prev, [aiKey]: index }));
    updateField(formKey, options[index] as string);
  };

  const addChip = (field: "competitors" | "keyProducts", input: string, setInput: (v: string) => void) => {
    const val = input.trim().replace(/,$/, "");
    if (val && !formData[field].includes(val)) {
      updateField(field, [...formData[field], val]);
    }
    setInput("");
  };

  const removeChip = (field: "competitors" | "keyProducts", val: string) => {
    updateField(field, formData[field].filter((v) => v !== val));
  };

  const canProceedStep1 = formData.name.trim() && formData.domain.trim();

  const applyAIData = (data: AIRawData, prevName: string, prevDomain: string, prevColor: string, prevTone: string) => {
    const pick = (val: unknown, fallback: string) =>
      Array.isArray(val) ? (val[0] as string) || fallback : (val as string) || fallback;

    const rawStyle = Array.isArray(data.suggestedWritingStyle)
      ? data.suggestedWritingStyle[0]?.toLowerCase() || "informative"
      : "informative";
    const writingStyle = VALID_WRITING_STYLES.includes(rawStyle) ? rawStyle : "informative";

    // Store raw data and reset selections to option 0
    setAiRawData(data);
    const selections: Record<string, number> = {};
    for (const key of ["niche", "description", "targetAudience", "tone", "uniqueValueProp", "primaryColor", "suggestedCtaText", "suggestedWritingStyle"]) {
      selections[key] = 0;
    }
    setAiSelections(selections);

    setFormData((prev) => ({
      ...prev,
      brandName: pick(data.brandName, prevName),
      brandUrl: pick(data.brandUrl, `https://${prevDomain}`),
      primaryColor: pick(data.primaryColor, prevColor),
      niche: pick(data.niche, ""),
      description: pick(data.description, ""),
      targetAudience: pick(data.targetAudience, ""),
      tone: pick(data.tone, prevTone),
      uniqueValueProp: pick(data.uniqueValueProp, ""),
      competitors: Array.isArray(data.competitors) ? data.competitors : [],
      keyProducts: Array.isArray(data.keyProducts) ? data.keyProducts : [],
      targetLocation: pick(data.targetLocation, ""),
      ctaText: pick(data.suggestedCtaText, ""),
      ctaUrl: data.suggestedCtaUrl || "",
      writingStyle,
    }));
  };

  const handleAnalyzeAndNext = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/websites/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, domain: formData.domain }),
      });

      if (res.ok) {
        const data = await res.json() as AIRawData;
        applyAIData(data, formData.name, formData.domain, formData.primaryColor, formData.tone);
        setAiAnalyzed(true);
        toast.success("AI analyzed your website — pick your preferred options below");
      } else {
        toast.error("Could not analyze website, please fill in manually");
        setFormData((prev) => ({
          ...prev,
          brandName: prev.name,
          brandUrl: `https://${prev.domain}`,
        }));
      }
    } catch {
      toast.error("Analysis failed, please fill in manually");
    } finally {
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  const handleReAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalyzed(false);
    try {
      const res = await fetch("/api/websites/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, domain: formData.domain }),
      });

      if (res.ok) {
        const data = await res.json() as AIRawData;
        applyAIData(data, formData.name, formData.domain, formData.primaryColor, formData.tone);
        setAiAnalyzed(true);
        toast.success("Re-analyzed — pick your preferred options");
      }
    } catch {
      toast.error("Re-analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canProceedStep2 = formData.brandName && formData.brandUrl;
  const canProceedStep3 = formData.niche && formData.description && formData.targetAudience;

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

      {/* ── STEP 1: Basic Info ── */}
      {step === 1 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter your website name and domain — AI will handle the rest
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
                  disabled={isAnalyzing}
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
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-muted-foreground">
                  Your website&apos;s domain name (without https://)
                </p>
              </div>

              {!isAnalyzing && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    AI will research your website and give you 3 options for each field to choose from
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {isAnalyzing && (
            <AnalysisProgressCard domain={formData.domain} />
          )}
        </>
      )}

      {/* ── STEP 2: Brand Details ── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Brand Details
                  {aiAnalyzed && !isAnalyzing && (
                    <Badge variant="secondary" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3" />
                      AI filled
                    </Badge>
                  )}
                  {isAnalyzing && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing…
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isAnalyzing
                    ? "Researching your website with AI…"
                    : aiAnalyzed
                      ? "Pick your preferred option for each field, or edit freely"
                      : "Review and adjust the brand details"}
                </CardDescription>
              </div>
              {!isAnalyzing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground"
                  onClick={handleReAnalyze}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Re-analyze
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnalyzing ? (
              <AiLoading steps={[...AI_STEPS.analyze]} />
            ) : (
              <>
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

                {/* Brand Color — show 3 swatches when AI analyzed */}
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Brand Color</Label>
                  {aiRawData?.primaryColor && aiRawData.primaryColor.length > 1 ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {aiRawData.primaryColor.map((color, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectAiOption("primaryColor", "primaryColor", i)}
                            className={`h-10 w-10 rounded-lg border-2 transition-all ${
                              aiSelections.primaryColor === i
                                ? "border-violet-500 scale-110 ring-2 ring-violet-200"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => {
                            updateField("primaryColor", e.target.value);
                            setAiSelections((p) => ({ ...p, primaryColor: -1 }));
                          }}
                          className="h-8 w-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => updateField("primaryColor", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: Content Strategy ── */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Content Strategy
                {aiAnalyzed && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3" />
                    AI filled
                  </Badge>
                )}
                <Sparkles className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription>
                {aiAnalyzed
                  ? "Click any option to select it, or edit the field directly"
                  : "Fill in your content strategy details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Niche */}
              <div className="space-y-2">
                <Label>Niche / Industry</Label>
                {aiRawData?.niche && aiRawData.niche.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.niche}
                      selectedIndex={aiSelections.niche ?? 0}
                      onSelect={(i) => selectAiOption("niche", "niche", i)}
                    />
                    <Input
                      placeholder="Or type your own…"
                      value={formData.niche}
                      onChange={(e) => {
                        updateField("niche", e.target.value);
                        setAiSelections((p) => ({ ...p, niche: -1 }));
                      }}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <Input
                    placeholder="e.g., invoicing software for small businesses"
                    value={formData.niche}
                    onChange={(e) => updateField("niche", e.target.value)}
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Business Description</Label>
                {aiRawData?.description && aiRawData.description.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.description}
                      selectedIndex={aiSelections.description ?? 0}
                      onSelect={(i) => selectAiOption("description", "description", i)}
                      isTextarea
                    />
                    <Textarea
                      placeholder="Or type your own…"
                      value={formData.description}
                      onChange={(e) => {
                        updateField("description", e.target.value);
                        setAiSelections((p) => ({ ...p, description: -1 }));
                      }}
                      rows={2}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <Textarea
                    placeholder="e.g., Cloud-based invoicing and accounting platform…"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                  />
                )}
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                {aiRawData?.targetAudience && aiRawData.targetAudience.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.targetAudience}
                      selectedIndex={aiSelections.targetAudience ?? 0}
                      onSelect={(i) => selectAiOption("targetAudience", "targetAudience", i)}
                    />
                    <Input
                      placeholder="Or type your own…"
                      value={formData.targetAudience}
                      onChange={(e) => {
                        updateField("targetAudience", e.target.value);
                        setAiSelections((p) => ({ ...p, targetAudience: -1 }));
                      }}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <Textarea
                    placeholder="e.g., Freelancers, small business owners, accountants…"
                    value={formData.targetAudience}
                    onChange={(e) => updateField("targetAudience", e.target.value)}
                    rows={2}
                  />
                )}
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label>Writing Tone</Label>
                {aiRawData?.tone && aiRawData.tone.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.tone}
                      selectedIndex={aiSelections.tone ?? 0}
                      onSelect={(i) => selectAiOption("tone", "tone", i)}
                    />
                    <Input
                      placeholder="Or type your own…"
                      value={formData.tone}
                      onChange={(e) => {
                        updateField("tone", e.target.value);
                        setAiSelections((p) => ({ ...p, tone: -1 }));
                      }}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <Input
                    placeholder="e.g., professional yet conversational"
                    value={formData.tone}
                    onChange={(e) => updateField("tone", e.target.value)}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  The writing style AI should use for your content
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Brand Intelligence */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                Brand Intelligence
                {aiAnalyzed && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3" />
                    AI filled
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                The more context you give, the more targeted your AI articles become
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Unique Value Prop */}
              <div className="space-y-2">
                <Label>Unique Value Proposition</Label>
                {aiRawData?.uniqueValueProp && aiRawData.uniqueValueProp.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.uniqueValueProp}
                      selectedIndex={aiSelections.uniqueValueProp ?? 0}
                      onSelect={(i) => selectAiOption("uniqueValueProp", "uniqueValueProp", i)}
                      isTextarea
                    />
                    <Textarea
                      placeholder="Or type your own…"
                      value={formData.uniqueValueProp}
                      onChange={(e) => {
                        updateField("uniqueValueProp", e.target.value);
                        setAiSelections((p) => ({ ...p, uniqueValueProp: -1 }));
                      }}
                      rows={2}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <Textarea
                    placeholder="e.g., The only platform that generates, publishes, and internally links SEO articles automatically."
                    value={formData.uniqueValueProp}
                    onChange={(e) => updateField("uniqueValueProp", e.target.value)}
                    rows={2}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  What makes you different? AI uses this to write differentiating CTAs.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Geographic Focus</Label>
                <Input
                  placeholder="e.g., United States, Global, UK and Europe"
                  value={formData.targetLocation}
                  onChange={(e) => updateField("targetLocation", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  AI will use locally relevant prices, tools, and examples.
                </p>
              </div>

              {/* Key Products */}
              <div className="space-y-2">
                <Label>Key Products / Features</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a product or feature name, press Enter"
                    value={keyProductInput}
                    onChange={(e) => setKeyProductInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addChip("keyProducts", keyProductInput, setKeyProductInput);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => addChip("keyProducts", keyProductInput, setKeyProductInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.keyProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.keyProducts.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {p}
                        <button type="button" onClick={() => removeChip("keyProducts", p)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Competitors */}
              <div className="space-y-2">
                <Label>Top Competitors</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a competitor name, press Enter"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addChip("competitors", competitorInput, setCompetitorInput);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => addChip("competitors", competitorInput, setCompetitorInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.competitors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.competitors.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium">
                        {c}
                        <button type="button" onClick={() => removeChip("competitors", c)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  AI uses this to write differentiated positioning content.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content & AI Settings */}
          <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50/40 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Content &amp; AI Settings
                {aiAnalyzed && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3" />
                    AI suggested
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Pre-configure how AI writes for you — editable anytime in Settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Writing Style */}
              <div className="space-y-2">
                <Label>Writing Style</Label>
                {aiRawData?.suggestedWritingStyle && aiRawData.suggestedWritingStyle.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.suggestedWritingStyle}
                      selectedIndex={aiSelections.suggestedWritingStyle ?? 0}
                      onSelect={(i) => {
                        if (!aiRawData) return;
                        const raw = aiRawData.suggestedWritingStyle[i]?.toLowerCase() || "informative";
                        const style = VALID_WRITING_STYLES.includes(raw) ? raw : "informative";
                        setAiSelections((p) => ({ ...p, suggestedWritingStyle: i }));
                        updateField("writingStyle", style);
                      }}
                    />
                    <Select
                      value={formData.writingStyle}
                      onValueChange={(v) => {
                        updateField("writingStyle", v);
                        setAiSelections((p) => ({ ...p, suggestedWritingStyle: -1 }));
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <Select value={formData.writingStyle} onValueChange={(v) => updateField("writingStyle", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  Applied to every article generated for this website.
                </p>
              </div>

              {/* CTA Text */}
              <div className="space-y-2">
                <Label>Call-to-Action Text</Label>
                {aiRawData?.suggestedCtaText && aiRawData.suggestedCtaText.length > 1 ? (
                  <>
                    <OptionPicker
                      options={aiRawData.suggestedCtaText}
                      selectedIndex={aiSelections.suggestedCtaText ?? 0}
                      onSelect={(i) => selectAiOption("suggestedCtaText", "ctaText", i)}
                    />
                    <Input
                      placeholder="Or type your own CTA…"
                      value={formData.ctaText}
                      onChange={(e) => {
                        updateField("ctaText", e.target.value);
                        setAiSelections((p) => ({ ...p, suggestedCtaText: -1 }));
                      }}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <Input
                    placeholder="e.g., Start your free trial"
                    value={formData.ctaText}
                    onChange={(e) => updateField("ctaText", e.target.value)}
                  />
                )}
              </div>

              {/* CTA URL */}
              <div className="space-y-2">
                <Label>Call-to-Action URL</Label>
                <Input
                  placeholder="e.g., https://yoursite.com/signup"
                  value={formData.ctaUrl}
                  onChange={(e) => updateField("ctaUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  AI places this CTA link in every article conclusion.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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

        {step === 1 ? (
          <Button
            onClick={handleAnalyzeAndNext}
            disabled={!canProceedStep1 || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze &amp; Continue
              </>
            )}
          </Button>
        ) : step === 2 ? (
          <Button
            onClick={() => setStep(3)}
            disabled={!canProceedStep2 || isAnalyzing}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceedStep3 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Website
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Analysis Progress Card ──────────────────────────────── */

const ANALYSIS_STEPS = [
  { label: "Connecting to website", icon: Globe, duration: 2000 },
  { label: "Crawling pages & extracting content", icon: Search, duration: 3000 },
  { label: "Researching brand with deep AI analysis", icon: Brain, duration: 6000 },
  { label: "Understanding niche & audience", icon: Target, duration: 3000 },
  { label: "Generating brand profile", icon: FileText, duration: 4000 },
  { label: "Finalizing analysis", icon: Eye, duration: 2000 },
];

function AnalysisProgressCard({ domain }: { domain: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const advance = (step: number) => {
      if (step >= ANALYSIS_STEPS.length) return;
      setActiveStep(step);
      timeout = setTimeout(() => advance(step + 1), ANALYSIS_STEPS[step].duration);
    };
    advance(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-primary/20 animate-ping" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm">Analyzing {domain}</p>
            <p className="text-xs text-muted-foreground">This takes 15-30 seconds</p>
          </div>
        </div>

        <div className="space-y-1">
          {ANALYSIS_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < activeStep;
            const isCurrent = i === activeStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                  isCurrent ? "bg-primary/10 border border-primary/20" :
                  isDone ? "opacity-70" :
                  "opacity-40"
                }`}
              >
                <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <Icon className={`h-4 w-4 shrink-0 ${
                  isCurrent ? "text-primary" :
                  isDone ? "text-green-600" :
                  "text-muted-foreground/50"
                }`} />
                <span className={`text-sm ${
                  isCurrent ? "font-medium text-foreground" :
                  isDone ? "text-muted-foreground" :
                  "text-muted-foreground/50"
                }`}>
                  {s.label}
                  {isDone && <span className="text-green-600 ml-1.5 text-xs">Done</span>}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
