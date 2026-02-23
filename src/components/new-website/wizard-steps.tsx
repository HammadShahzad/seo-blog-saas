"use client";

import type { Dispatch, SetStateAction } from "react";
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
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { AiLoading, AI_STEPS } from "@/components/ui/ai-loading";

// ── Shared types ──────────────────────────────────────────────

export interface AIRawData {
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

export interface WizardFormData {
  name: string;
  domain: string;
  brandName: string;
  brandUrl: string;
  primaryColor: string;
  niche: string;
  description: string;
  targetAudience: string;
  tone: string;
  uniqueValueProp: string;
  competitors: string[];
  keyProducts: string[];
  targetLocation: string;
  ctaText: string;
  ctaUrl: string;
  writingStyle: string;
}

export interface AIFieldProps {
  formData: WizardFormData;
  updateField: (field: string, value: string | string[]) => void;
  aiRawData: AIRawData | null;
  aiSelections: Record<string, number>;
  selectAiOption: (aiKey: string, formKey: string, index: number) => void;
  setAiSelections: Dispatch<SetStateAction<Record<string, number>>>;
  aiAnalyzed: boolean;
}

export const VALID_WRITING_STYLES = [
  "informative", "conversational", "technical",
  "storytelling", "persuasive", "humorous",
];

// ── Option picker (shared UI) ─────────────────────────────────

export function OptionPicker({
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

// ── Step 1: Basic Info ────────────────────────────────────────

export function BasicInfoStep({
  formData,
  updateField,
  isAnalyzing,
}: {
  formData: WizardFormData;
  updateField: (field: string, value: string | string[]) => void;
  isAnalyzing: boolean;
}) {
  return (
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
            placeholder="e.g., example.com or https://example.com/page"
            value={formData.domain}
            onChange={(e) => updateField("domain", e.target.value)}
            disabled={isAnalyzing}
          />
          <p className="text-xs text-muted-foreground">
            Domain or full URL — we&apos;ll extract the hostname automatically
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
  );
}

// ── Step 2: Brand Details ─────────────────────────────────────

export function BrandDetailsStep({
  formData,
  updateField,
  aiRawData,
  aiSelections,
  selectAiOption,
  setAiSelections,
  aiAnalyzed,
  isAnalyzing,
  handleReAnalyze,
}: AIFieldProps & {
  isAnalyzing: boolean;
  handleReAnalyze: () => void;
}) {
  return (
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
  );
}

// ── Step 3: Content Strategy (first card) ─────────────────────

export function ContentStrategyStep({
  formData,
  updateField,
  aiRawData,
  aiSelections,
  selectAiOption,
  setAiSelections,
  aiAnalyzed,
}: AIFieldProps) {
  return (
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
  );
}
