"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, BlogSettingsData, UpdateFieldFn } from "./settings-types";

interface AIRawData {
  brandName: string; brandUrl: string; primaryColor: string[];
  niche: string[]; description: string[]; targetAudience: string[]; tone: string[];
  uniqueValueProp: string[]; competitors: string[]; keyProducts: string[];
  targetLocation: string; suggestedCtaText: string[]; suggestedCtaUrl: string;
  suggestedWritingStyle: string[];
}

const MULTI_FIELDS = [
  { key: "niche", label: "Niche / Industry", group: "General" },
  { key: "description", label: "Description", group: "General" },
  { key: "targetAudience", label: "Target Audience", group: "General" },
  { key: "tone", label: "Writing Tone", group: "Brand" },
  { key: "primaryColor", label: "Brand Color", group: "Brand" },
  { key: "uniqueValueProp", label: "Value Proposition", group: "Brand" },
  { key: "suggestedCtaText", label: "Call-to-Action", group: "Content" },
  { key: "suggestedWritingStyle", label: "Writing Style", group: "Content" },
] as const;

const SINGLE_FIELDS = [
  { key: "brandName", label: "Brand Name", group: "Brand" },
  { key: "brandUrl", label: "Brand URL", group: "Brand" },
  { key: "targetLocation", label: "Location", group: "Brand" },
  { key: "suggestedCtaUrl", label: "CTA URL", group: "Content" },
] as const;

interface AIResearchDialogProps {
  website: WebsiteData;
  updateField: UpdateFieldFn;
  setBlogSettings: React.Dispatch<React.SetStateAction<BlogSettingsData>>;
}

export function AIResearchDialog({ website, updateField, setBlogSettings }: AIResearchDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRaw, setAiRaw] = useState<AIRawData | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPicks, setAiPicks] = useState<Record<string, number>>({});
  const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [polishingField, setPolishingField] = useState<string | null>(null);

  const handleImproveField = async (fieldKey: string) => {
    const text = customValues[fieldKey]?.trim();
    if (!text) { toast.error("Type something first"); return; }
    setPolishingField(fieldKey);
    try {
      const res = await fetch("/api/websites/improve-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: fieldKey,
          value: text,
          brandName: website.brandName || "",
          niche: website.niche || "",
        }),
      });
      if (!res.ok) { toast.error("AI rewrite failed"); return; }
      const { improved } = await res.json();
      if (improved) setCustomValues((p) => ({ ...p, [fieldKey]: improved }));
    } catch {
      toast.error("AI rewrite failed");
    } finally {
      setPolishingField(null);
    }
  };

  const handleAIResearch = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/websites/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: website.name || website.brandName, domain: website.domain }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "AI analysis failed");
        return;
      }
      const data = await res.json() as AIRawData;
      setAiRaw(data);
      const picks: Record<string, number> = {};
      const enabled: Record<string, boolean> = {};
      for (const f of MULTI_FIELDS) { picks[f.key] = 0; enabled[f.key] = true; }
      for (const f of SINGLE_FIELDS) { enabled[f.key] = true; }
      enabled["competitors"] = true;
      enabled["keyProducts"] = true;
      setAiPicks(picks);
      setAiEnabled(enabled);
      setAiDialogOpen(true);
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPickedValue = (key: string): string => {
    if (!aiRaw) return "";
    const raw = (aiRaw as unknown as Record<string, unknown>)[key];
    if (Array.isArray(raw)) return raw[aiPicks[key] ?? 0] || raw[0] || "";
    return String(raw || "");
  };

  const handleAIApply = () => {
    if (!aiRaw) return;
    let applied = 0;
    const pick = (k: string) => getPickedValue(k);
    const custom = (k: string) => customValues[k]?.trim() || "";

    const resolve = (k: string, aiVal?: string): string | null => {
      if (aiEnabled[k]) return aiVal ?? pick(k);
      const c = custom(k);
      return c || null;
    };

    const v = resolve("niche"); if (v) { updateField("niche", v); applied++; }
    const d = resolve("description"); if (d) { updateField("description", d); applied++; }
    const ta = resolve("targetAudience"); if (ta) { updateField("targetAudience", ta); applied++; }
    const bn = resolve("brandName", aiRaw.brandName); if (bn) { updateField("brandName", bn); applied++; }
    const bu = resolve("brandUrl", aiRaw.brandUrl); if (bu) { updateField("brandUrl", bu); applied++; }
    const t = resolve("tone"); if (t) { updateField("tone", t); applied++; }
    const pc = resolve("primaryColor"); if (pc) { updateField("primaryColor", pc); applied++; }
    const uvp = resolve("uniqueValueProp"); if (uvp) { updateField("uniqueValueProp", uvp); applied++; }
    const tl = resolve("targetLocation", aiRaw.targetLocation); if (tl) { updateField("targetLocation", tl); applied++; }

    if (aiEnabled.competitors && aiRaw.competitors?.length) { updateField("competitors", aiRaw.competitors); applied++; }
    if (aiEnabled.keyProducts && aiRaw.keyProducts?.length) { updateField("keyProducts", aiRaw.keyProducts); applied++; }

    const cta = resolve("suggestedCtaText");
    if (cta) { setBlogSettings((p) => ({ ...p, ctaText: cta })); applied++; }
    const ctaUrl = resolve("suggestedCtaUrl", aiRaw.suggestedCtaUrl);
    if (ctaUrl) { setBlogSettings((p) => ({ ...p, ctaUrl })); applied++; }

    if (aiEnabled.suggestedWritingStyle) {
      const style = pick("suggestedWritingStyle");
      if (["informative", "conversational", "technical", "storytelling", "persuasive", "humorous"].includes(style)) {
        setBlogSettings((p) => ({ ...p, writingStyle: style })); applied++;
      }
    } else if (custom("suggestedWritingStyle")) {
      const style = custom("suggestedWritingStyle").toLowerCase();
      if (["informative", "conversational", "technical", "storytelling", "persuasive", "humorous"].includes(style)) {
        setBlogSettings((p) => ({ ...p, writingStyle: style })); applied++;
      }
    }

    setAiDialogOpen(false);
    toast.success(`Applied ${applied} field${applied !== 1 ? "s" : ""} — review and save`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAIResearch}
        disabled={isAnalyzing}
        className="border-violet-300 text-violet-700 hover:bg-violet-50"
      >
        {isAnalyzing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
        {isAnalyzing ? "Researching..." : "AI Auto-Fill"}
      </Button>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              AI Research Results
            </DialogTitle>
            <DialogDescription>
              Pick an AI option or toggle to &quot;Custom&quot; to write your own. Use the Improve button to let AI polish your text.
            </DialogDescription>
          </DialogHeader>

          {aiRaw && (
            <div className="space-y-5 py-2">
              {["General", "Brand", "Content"].map((group) => (
                <div key={group}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group}</p>
                  <div className="space-y-3">
                    {MULTI_FIELDS.filter((f) => f.group === group).map((field) => {
                      const options = (aiRaw as unknown as Record<string, unknown>)[field.key];
                      if (!Array.isArray(options) || options.length === 0) return null;
                      const selected = aiPicks[field.key] ?? 0;
                      const enabled = aiEnabled[field.key] !== false;

                      return (
                        <div key={field.key} className={`rounded-lg border p-3 transition-colors ${enabled ? "border-border" : "border-border bg-muted/10"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{field.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{enabled ? "AI picks" : "Custom"}</span>
                              <Switch checked={enabled} onCheckedChange={(val) => setAiEnabled((p) => ({ ...p, [field.key]: val }))} />
                            </div>
                          </div>
                          {enabled ? (
                            field.key === "primaryColor" ? (
                              <div className="flex gap-2">
                                {options.map((color: string, i: number) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setAiPicks((p) => ({ ...p, [field.key]: i }))}
                                    className={`h-10 w-10 rounded-lg border-2 transition-all ${selected === i ? "border-violet-500 scale-110 ring-2 ring-violet-200" : "border-transparent hover:scale-105"}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {options.map((opt: string, i: number) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setAiPicks((p) => ({ ...p, [field.key]: i }))}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border ${
                                      selected === i
                                        ? "bg-violet-50 border-violet-300 text-violet-900 ring-1 ring-violet-200"
                                        : "bg-muted/30 border-transparent hover:bg-muted/60 text-muted-foreground"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                {field.key === "primaryColor" ? (
                                  <Input
                                    type="color"
                                    value={customValues[field.key] || "#4F46E5"}
                                    onChange={(e) => setCustomValues((p) => ({ ...p, [field.key]: e.target.value }))}
                                    className="h-9 w-16 p-1 cursor-pointer"
                                  />
                                ) : ["description", "uniqueValueProp", "targetAudience"].includes(field.key) ? (
                                  <Textarea
                                    placeholder={`Write your own ${field.label.toLowerCase()}...`}
                                    value={customValues[field.key] || ""}
                                    onChange={(e) => setCustomValues((p) => ({ ...p, [field.key]: e.target.value }))}
                                    className="text-sm min-h-[60px] flex-1"
                                    rows={2}
                                  />
                                ) : (
                                  <Input
                                    placeholder={`Write your own ${field.label.toLowerCase()}...`}
                                    value={customValues[field.key] || ""}
                                    onChange={(e) => setCustomValues((p) => ({ ...p, [field.key]: e.target.value }))}
                                    className="text-sm flex-1"
                                  />
                                )}
                                {field.key !== "primaryColor" && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!customValues[field.key]?.trim() || polishingField === field.key}
                                    onClick={() => handleImproveField(field.key)}
                                    className="shrink-0 gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50"
                                    title="AI will rewrite your text to be more polished"
                                  >
                                    {polishingField === field.key ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-3.5 w-3.5" />
                                    )}
                                    Improve
                                  </Button>
                                )}
                              </div>
                              {customValues[field.key]?.trim() && field.key !== "primaryColor" && (
                                <p className="text-[11px] text-muted-foreground">Type your version, then click Improve to let AI polish it</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {SINGLE_FIELDS.filter((f) => f.group === group).map((field) => {
                      const val = (aiRaw as unknown as Record<string, unknown>)[field.key];
                      if (!val) return null;
                      const enabled = aiEnabled[field.key] !== false;
                      return (
                        <div key={field.key} className={`rounded-lg border p-3 transition-colors ${enabled ? "border-border" : "border-border bg-muted/10"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{field.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{enabled ? "AI" : "Custom"}</span>
                              <Switch checked={enabled} onCheckedChange={(val) => setAiEnabled((p) => ({ ...p, [field.key]: val }))} />
                            </div>
                          </div>
                          {enabled ? (
                            <p className="text-sm text-muted-foreground">{String(val)}</p>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder={`Write your own ${field.label.toLowerCase()}...`}
                                value={customValues[field.key] || ""}
                                onChange={(e) => setCustomValues((p) => ({ ...p, [field.key]: e.target.value }))}
                                className="text-sm flex-1"
                              />
                              {!["brandUrl", "suggestedCtaUrl"].includes(field.key) && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={!customValues[field.key]?.trim() || polishingField === field.key}
                                  onClick={() => handleImproveField(field.key)}
                                  className="shrink-0 gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50"
                                >
                                  {polishingField === field.key ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                  )}
                                  Improve
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {group === "Brand" && (
                      <>
                        {aiRaw.competitors?.length > 0 && (
                          <div className={`rounded-lg border p-3 transition-colors ${aiEnabled.competitors !== false ? "border-border" : "border-muted opacity-50"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">Competitors</p>
                              <Switch checked={aiEnabled.competitors !== false} onCheckedChange={(val) => setAiEnabled((p) => ({ ...p, competitors: val }))} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {aiRaw.competitors.map((c: string) => (
                                <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {aiRaw.keyProducts?.length > 0 && (
                          <div className={`rounded-lg border p-3 transition-colors ${aiEnabled.keyProducts !== false ? "border-border" : "border-muted opacity-50"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">Products / Features</p>
                              <Switch checked={aiEnabled.keyProducts !== false} onCheckedChange={(val) => setAiEnabled((p) => ({ ...p, keyProducts: val }))} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {aiRaw.keyProducts.map((p: string) => (
                                <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAIApply} className="bg-violet-600 hover:bg-violet-700">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Apply Fields
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
