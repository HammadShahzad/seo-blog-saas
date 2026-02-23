"use client";

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
  Brain,
  Sparkles,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import {
  OptionPicker,
  VALID_WRITING_STYLES,
  type AIFieldProps,
} from "@/components/new-website/wizard-steps";

// ── Brand Intelligence card ───────────────────────────────────

export function BrandIntelligenceCard({
  formData,
  updateField,
  aiRawData,
  aiSelections,
  selectAiOption,
  setAiSelections,
  aiAnalyzed,
  competitorInput,
  setCompetitorInput,
  keyProductInput,
  setKeyProductInput,
  addChip,
  removeChip,
}: AIFieldProps & {
  competitorInput: string;
  setCompetitorInput: (v: string) => void;
  keyProductInput: string;
  setKeyProductInput: (v: string) => void;
  addChip: (field: "competitors" | "keyProducts", input: string, setInput: (v: string) => void) => void;
  removeChip: (field: "competitors" | "keyProducts", val: string) => void;
}) {
  return (
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
  );
}

// ── Content & AI Settings card ────────────────────────────────

export function ContentAISettingsCard({
  formData,
  updateField,
  aiRawData,
  aiSelections,
  selectAiOption,
  setAiSelections,
  aiAnalyzed,
}: AIFieldProps) {
  return (
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
  );
}
