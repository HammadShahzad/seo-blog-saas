"use client";

import { useMemo } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bot, X, Plus, CalendarDays, Clock, Image, Sparkles, Globe, Palette } from "lucide-react";
import type { WebsiteData, BlogSettingsData, UpdateFieldFn } from "./settings-types";

const ALL_DAYS = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
  { key: "SAT", label: "Sat" },
  { key: "SUN", label: "Sun" },
] as const;

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "America/Toronto", "America/Vancouver",
  "America/Sao_Paulo", "America/Argentina/Buenos_Aires", "America/Mexico_City",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Amsterdam",
  "Europe/Rome", "Europe/Madrid", "Europe/Zurich", "Europe/Stockholm",
  "Europe/Warsaw", "Europe/Moscow", "Europe/Istanbul",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok",
  "Asia/Singapore", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Tokyo", "Asia/Seoul",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
];

function getTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value || "";
    return `${tz.replace(/_/g, " ")} (${offset})`;
  } catch {
    return tz;
  }
}

function computeNextPublishDate(
  publishDays: string,
  publishTime: string,
  timezone: string,
): Date | null {
  if (!publishDays || !publishTime) return null;
  const days = publishDays.split(",").map((d) => d.trim().toUpperCase());
  const dayMap: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
  const targetDayNumbers = days.map((d) => dayMap[d]).filter((n) => n !== undefined);
  if (targetDayNumbers.length === 0) return null;

  const tz = timezone || "UTC";
  const now = new Date();

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now.getTime() + offset * 86400000);
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(candidate);
      const weekday = (parts.find((p) => p.type === "weekday")?.value || "").toUpperCase().slice(0, 3);
      const dayNum = dayMap[weekday];
      if (!targetDayNumbers.includes(dayNum)) continue;

      const localDateStr = `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}`;
      const scheduledLocal = new Date(`${localDateStr}T${publishTime}:00`);
      const localNowStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(now);
      const [datePart, timePart] = localNowStr.split(", ");
      const localNow = new Date(`${datePart}T${timePart}:00`);

      if (offset === 0 && scheduledLocal <= localNow) continue;

      const offsetMs = now.getTime() - localNow.getTime();
      return new Date(scheduledLocal.getTime() + offsetMs);
    } catch {
      continue;
    }
  }
  return null;
}

interface ContentSettingsProps {
  website: WebsiteData;
  updateField: UpdateFieldFn;
  blogSettings: BlogSettingsData;
  setBlogSettings: React.Dispatch<React.SetStateAction<BlogSettingsData>>;
  avoidTopicInput: string;
  setAvoidTopicInput: (v: string) => void;
}

export function ContentSettings({
  website, updateField, blogSettings, setBlogSettings,
  avoidTopicInput, setAvoidTopicInput,
}: ContentSettingsProps) {
  const nextPublish = useMemo(() => {
    if (!website.autoPublish) return null;
    return computeNextPublishDate(
      website.publishDays || "MON,WED,FRI",
      website.publishTime || "09:00",
      website.timezone || "UTC",
    );
  }, [website.autoPublish, website.publishDays, website.publishTime, website.timezone]);

  const toggleDay = (dayKey: string) => {
    const current = (website.publishDays || "MON,WED,FRI").split(",").map((d) => d.trim());
    const updated = current.includes(dayKey)
      ? current.filter((d) => d !== dayKey)
      : [...current, dayKey];
    if (updated.length === 0) return;
    const ordered = ALL_DAYS.map((d) => d.key).filter((k) => updated.includes(k));
    updateField("publishDays", ordered.join(","));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Content &amp; AI
        </CardTitle>
        <CardDescription>
          Control what the AI writes, how it writes, and when it publishes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Writing Style</Label>
            <Select value={blogSettings.writingStyle} onValueChange={(v) => setBlogSettings((p) => ({ ...p, writingStyle: v }))}>
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
          </div>
          <div className="space-y-2">
            <Label>Default Article Length</Label>
            <Select value={blogSettings.contentLength} onValueChange={(v) => setBlogSettings((p) => ({ ...p, contentLength: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SHORT">Short (~800 words)</SelectItem>
                <SelectItem value="MEDIUM">Medium (~1,500 words)</SelectItem>
                <SelectItem value="LONG">Long (~2,500 words)</SelectItem>
                <SelectItem value="PILLAR">Pillar (~4,000 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" /> Image Style
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "AI_GENERATED", label: "AI Images", icon: Sparkles, desc: "AI-generated photorealistic images" },
              { value: "WEB_IMAGES", label: "Web Images", icon: Globe, desc: "Stock photos from Pexels" },
              { value: "ILLUSTRATION", label: "Illustrations", icon: Palette, desc: "AI-generated illustrations" },
            ] as const).map((opt) => {
              const active = blogSettings.imageSource === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBlogSettings((p) => ({ ...p, imageSource: opt.value }))}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-[11px] leading-tight opacity-70">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Call-to-Action Text</Label>
            <Input
              placeholder="e.g., Start your free trial"
              value={blogSettings.ctaText || ""}
              onChange={(e) => setBlogSettings((p) => ({ ...p, ctaText: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Call-to-Action URL</Label>
            <Input
              placeholder="e.g., https://yoursite.com/signup"
              value={blogSettings.ctaUrl || ""}
              onChange={(e) => setBlogSettings((p) => ({ ...p, ctaUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Topics to Avoid</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Type and press Enter to add"
              value={avoidTopicInput}
              onChange={(e) => setAvoidTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const val = avoidTopicInput.trim().replace(/,$/, "");
                  if (val && !(blogSettings.avoidTopics || []).includes(val)) {
                    setBlogSettings((p) => ({ ...p, avoidTopics: [...(p.avoidTopics || []), val] }));
                  }
                  setAvoidTopicInput("");
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const val = avoidTopicInput.trim();
              if (val && !(blogSettings.avoidTopics || []).includes(val)) {
                setBlogSettings((p) => ({ ...p, avoidTopics: [...(p.avoidTopics || []), val] }));
              }
              setAvoidTopicInput("");
            }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {(blogSettings.avoidTopics || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(blogSettings.avoidTopics || []).map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                  {t}
                  <button type="button" onClick={() => setBlogSettings((p) => ({ ...p, avoidTopics: (p.avoidTopics || []).filter((x) => x !== t) }))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="grid gap-x-8 gap-y-3 md:grid-cols-3">
          <div className="flex items-center justify-between">
            <Label>Auto-Publish</Label>
            <Switch checked={website.autoPublish} onCheckedChange={(v) => updateField("autoPublish", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>FAQ Section</Label>
            <Switch checked={blogSettings.includeFAQ} onCheckedChange={(v) => setBlogSettings((p) => ({ ...p, includeFAQ: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Pro Tips</Label>
            <Switch checked={blogSettings.includeProTips} onCheckedChange={(v) => setBlogSettings((p) => ({ ...p, includeProTips: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Table of Contents</Label>
            <Switch checked={blogSettings.includeTableOfContents} onCheckedChange={(v) => setBlogSettings((p) => ({ ...p, includeTableOfContents: v }))} />
          </div>
        </div>

        {website.autoPublish && (
          <>
            <Separator />
            <div className="space-y-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Publish Schedule
              </p>
              <div className="space-y-2">
                <Label>Publish Days</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => {
                    const active = (website.publishDays || "MON,WED,FRI").split(",").map((d) => d.trim()).includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</Label>
                  <Input type="time" value={website.publishTime || "09:00"} onChange={(e) => updateField("publishTime", e.target.value)} className="w-32" />
                </div>
                <div className="space-y-2">
                  <Label>Posts/Week</Label>
                  <Select value={String(website.postsPerWeek)} onValueChange={(v) => updateField("postsPerWeek", parseInt(v))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 7, 10, 14].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}/week</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={website.timezone || "UTC"} onValueChange={(v) => updateField("timezone", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{getTimezoneLabel(tz)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {nextPublish && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <span className="font-medium">Next post:</span>{" "}
                  {nextPublish.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: website.timezone || "UTC" })}
                  {" at "}
                  {nextPublish.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: website.timezone || "UTC" })}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
