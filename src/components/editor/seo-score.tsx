"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface SEOScoreProps {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  wordCount: number;
}

interface Check {
  label: string;
  pass: boolean;
  warn: boolean;
  message: string;
}

export function SEOScore({
  title,
  content,
  metaTitle,
  metaDescription,
  focusKeyword,
  wordCount,
}: SEOScoreProps) {
  const checks = useMemo((): Check[] => {
    const kw = focusKeyword.toLowerCase();
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    const metaTitleLower = metaTitle.toLowerCase();
    const metaDescLower = metaDescription.toLowerCase();

    // First 150 words of content
    const intro = contentLower.split(/\s+/).slice(0, 150).join(" ");

    return [
      {
        label: "Focus keyword in title",
        pass: kw ? titleLower.includes(kw) : false,
        warn: false,
        message: kw
          ? titleLower.includes(kw)
            ? "Keyword found in title"
            : "Add keyword to H1 title"
          : "Set a focus keyword",
      },
      {
        label: "Focus keyword in intro",
        pass: kw ? intro.includes(kw) : false,
        warn: false,
        message: kw
          ? intro.includes(kw)
            ? "Keyword in first 150 words"
            : "Add keyword to intro paragraph"
          : "Set a focus keyword",
      },
      {
        label: "Meta title length",
        pass: metaTitle.length >= 30 && metaTitle.length <= 60,
        warn: metaTitle.length > 0 && (metaTitle.length < 30 || metaTitle.length > 60),
        message:
          metaTitle.length === 0
            ? "Write a meta title"
            : metaTitle.length < 30
              ? `Too short (${metaTitle.length}/60)`
              : metaTitle.length > 60
                ? `Too long (${metaTitle.length}/60)`
                : `Good length (${metaTitle.length}/60)`,
      },
      {
        label: "Meta description length",
        pass: metaDescription.length >= 120 && metaDescription.length <= 155,
        warn: metaDescription.length > 0 && (metaDescription.length < 120 || metaDescription.length > 155),
        message:
          metaDescription.length === 0
            ? "Write a meta description"
            : metaDescription.length < 120
              ? `Too short (${metaDescription.length}/155)`
              : metaDescription.length > 155
                ? `Too long (${metaDescription.length}/155)`
                : `Good length (${metaDescription.length}/155)`,
      },
      {
        label: "Keyword in meta title",
        pass: kw ? metaTitleLower.includes(kw) : false,
        warn: false,
        message: kw
          ? metaTitleLower.includes(kw)
            ? "Keyword in meta title"
            : "Add keyword to meta title"
          : "Set a focus keyword",
      },
      {
        label: "Keyword in meta description",
        pass: kw ? metaDescLower.includes(kw) : false,
        warn: false,
        message: kw
          ? metaDescLower.includes(kw)
            ? "Keyword in meta description"
            : "Add keyword to meta description"
          : "Set a focus keyword",
      },
      {
        label: "Content length",
        pass: wordCount >= 1000,
        warn: wordCount >= 600 && wordCount < 1000,
        message:
          wordCount < 600
            ? `Too short (${wordCount} words, aim for 1000+)`
            : wordCount < 1000
              ? `Could be longer (${wordCount} words)`
              : `Good length (${wordCount} words)`,
      },
      {
        label: "Has H2 headings",
        pass: content.includes("## "),
        warn: false,
        message: content.includes("## ")
          ? "Has H2 subheadings"
          : "Add H2 headings for structure",
      },
    ];
  }, [title, content, metaTitle, metaDescription, focusKeyword, wordCount]);

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  const scoreColor =
    score >= 80
      ? "text-green-600"
      : score >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">SEO Score</span>
        <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
      </div>
      <Progress value={score} className="h-2" />
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2">
            {check.pass ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            ) : check.warn ? (
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-medium">{check.label}</p>
              <p className="text-xs text-muted-foreground">{check.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
