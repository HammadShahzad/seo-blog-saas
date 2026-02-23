"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Globe,
  Palette,
  Sparkles,
  CheckCircle2,
  Search,
  Brain,
  Target,
  FileText,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  type AIRawData,
  type WizardFormData,
  VALID_WRITING_STYLES,
  BasicInfoStep,
  BrandDetailsStep,
  ContentStrategyStep,
} from "@/components/new-website/wizard-steps";
import {
  BrandIntelligenceCard,
  ContentAISettingsCard,
} from "@/components/new-website/brand-intelligence";

const STEPS = [
  { id: 1, title: "Basic Info", icon: Globe },
  { id: 2, title: "Brand Details", icon: Palette },
  { id: 3, title: "Content Strategy", icon: Target },
];

export default function NewWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);
  const analyzeAbortRef = useRef<AbortController | null>(null);

  const [aiRawData, setAiRawData] = useState<AIRawData | null>(null);
  const [aiSelections, setAiSelections] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState<WizardFormData>({
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
    competitors: [],
    keyProducts: [],
    targetLocation: "",
    ctaText: "",
    ctaUrl: "",
    writingStyle: "informative",
  });

  const [competitorInput, setCompetitorInput] = useState("");
  const [keyProductInput, setKeyProductInput] = useState("");

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
    analyzeAbortRef.current?.abort();
    const controller = new AbortController();
    analyzeAbortRef.current = controller;

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/websites/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, domain: formData.domain }),
        signal: controller.signal,
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
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("Analysis cancelled");
        return;
      }
      toast.error("Analysis failed, please fill in manually");
    } finally {
      analyzeAbortRef.current = null;
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  const handleReAnalyze = async () => {
    analyzeAbortRef.current?.abort();
    const controller = new AbortController();
    analyzeAbortRef.current = controller;

    setIsAnalyzing(true);
    setAiAnalyzed(false);
    try {
      const res = await fetch("/api/websites/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, domain: formData.domain }),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json() as AIRawData;
        applyAIData(data, formData.name, formData.domain, formData.primaryColor, formData.tone);
        setAiAnalyzed(true);
        toast.success("Re-analyzed — pick your preferred options");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("Analysis cancelled");
        return;
      }
      toast.error("Re-analysis failed");
    } finally {
      analyzeAbortRef.current = null;
      setIsAnalyzing(false);
    }
  };

  const handleCancelAnalyze = () => {
    analyzeAbortRef.current?.abort();
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
        const msg = data.error || "Failed to create website";
        toast.error(msg);
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

  const aiFieldProps = {
    formData,
    updateField,
    aiRawData,
    aiSelections,
    selectAiOption,
    setAiSelections,
    aiAnalyzed,
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
        <>
          <BasicInfoStep
            formData={formData}
            updateField={updateField}
            isAnalyzing={isAnalyzing}
          />
          {isAnalyzing && (
            <AnalysisProgressCard domain={formData.domain} onCancel={handleCancelAnalyze} />
          )}
        </>
      )}

      {/* Step 2: Brand Details */}
      {step === 2 && (
        <BrandDetailsStep
          {...aiFieldProps}
          isAnalyzing={isAnalyzing}
          handleReAnalyze={handleReAnalyze}
        />
      )}

      {/* Step 3: Content Strategy */}
      {step === 3 && (
        <div className="space-y-4">
          <ContentStrategyStep {...aiFieldProps} />
          <BrandIntelligenceCard
            {...aiFieldProps}
            competitorInput={competitorInput}
            setCompetitorInput={setCompetitorInput}
            keyProductInput={keyProductInput}
            setKeyProductInput={setKeyProductInput}
            addChip={addChip}
            removeChip={removeChip}
          />
          <ContentAISettingsCard {...aiFieldProps} />
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

function AnalysisProgressCard({ domain, onCancel }: { domain: string; onCancel?: () => void }) {
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
        {onCancel && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
