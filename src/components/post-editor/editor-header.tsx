"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Plug,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  CalendarClock,
  X,
  Globe,
  Download,
  Sparkles,
} from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { type Post, type CmsResult, type StatusCfg } from "./types";

interface EditorHeaderProps {
  isNew: boolean;
  websiteId: string;
  postId: string;
  post: Partial<Post>;
  statusCfg: StatusCfg;
  wordCount: number;
  readingTime: number;
  liveUrl: string | null;
  isSaving: boolean;
  isPublishing: boolean;
  isRegeneratingImage: boolean;
  isFixingSEO: boolean;
  hasCMSIntegration: boolean;
  integrations: { wp: boolean; shopify: boolean };
  onSave: (statusOverride?: string) => Promise<void>;
  onPublish: () => Promise<void>;
  onRegenerateImage: () => void;
  onPostUpdate: (updates: Partial<Post>) => void;
}

export function EditorHeader({
  isNew, websiteId, postId, post, statusCfg, wordCount, readingTime,
  liveUrl, isSaving, isPublishing, isRegeneratingImage, isFixingSEO,
  hasCMSIntegration, integrations,
  onSave, onPublish, onRegenerateImage, onPostUpdate,
}: EditorHeaderProps) {
  const [isPushingToCMS, setIsPushingToCMS] = useState(false);
  const [cmsResult, setCmsResult] = useState<CmsResult>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const prefillScheduleDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduleDate(
      `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`
    );
  };

  const handleSchedule = async () => {
    if (!scheduleDate) { toast.error("Please pick a date and time"); return; }
    const scheduledAt = new Date(scheduleDate);
    if (scheduledAt <= new Date()) { toast.error("Scheduled time must be in the future"); return; }
    if (!post.title?.trim() || !post.content?.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setIsScheduling(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post, wordCount, readingTime,
          status: "SCHEDULED",
          scheduledAt: scheduledAt.toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule");
      const saved = await res.json();
      onPostUpdate({ status: saved.status, scheduledAt: saved.scheduledAt });
      setShowScheduler(false);
      toast.success(`Scheduled for ${scheduledAt.toLocaleString()}`);
    } catch {
      toast.error("Failed to schedule post");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleUnschedule = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT", scheduledAt: null }),
      });
      if (res.ok) {
        onPostUpdate({ status: "DRAFT", scheduledAt: null });
        setShowScheduler(false);
        toast.success("Schedule removed — post is now a Draft");
      }
    } catch { toast.error("Failed to unschedule"); }
  };

  const handlePushToWordPress = async (status: "draft" | "publish") => {
    if (isNew) { toast.error("Save the post first"); return; }
    setIsPushingToCMS(true);
    setCmsResult(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/wordpress/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setCmsResult({ type: "wp", viewUrl: data.wpPostUrl, editUrl: data.wpEditUrl });
        if (data.wpPostUrl) onPostUpdate({ externalUrl: data.wpPostUrl });
        toast.success(`Pushed to WordPress as ${status}!`);
      } else {
        toast.error(data.error || "Failed to push to WordPress");
      }
    } catch { toast.error("Failed to push to WordPress"); }
    finally { setIsPushingToCMS(false); }
  };

  const handlePushToShopify = async (status: "draft" | "published") => {
    if (isNew) { toast.error("Save the post first"); return; }
    setIsPushingToCMS(true);
    setCmsResult(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/shopify/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setCmsResult({ type: "shopify", viewUrl: data.articleUrl, editUrl: data.adminUrl });
        if (data.articleUrl) onPostUpdate({ externalUrl: data.articleUrl });
        toast.success(`Pushed to Shopify as ${status}!`);
      } else {
        toast.error(data.error || "Failed to push to Shopify");
      }
    } catch { toast.error("Failed to push to Shopify"); }
    finally { setIsPushingToCMS(false); }
  };

  const handleDownloadPDF = async () => {
    if (!post.content?.trim()) { toast.error("No content to export"); return; }
    setIsDownloadingPDF(true);
    try {
      const { Marked } = await import("marked");
      const md = new Marked({ gfm: true, breaks: false });
      const htmlContent = md.parse(post.content) as string;

      const slug = post.slug || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "blog-post";
      const safeTitle = (post.title || "Untitled").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) { toast.error("Please allow popups to download PDF"); setIsDownloadingPDF(false); return; }

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { background: #fff; }
    body { padding: 48px 56px; font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; line-height: 1.75; font-size: 14px; background: #fff; }
    .pdf-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e5e5; }
    .pdf-header h1 { font-size: 26px; margin: 0 0 10px; line-height: 1.3; color: #111; }
    .pdf-meta { font-size: 12px; color: #777; margin-top: 6px; }
    h2 { font-size: 20px; margin: 28px 0 10px; color: #111; border-bottom: 1px solid #eee; padding-bottom: 6px; page-break-after: avoid; }
    h3 { font-size: 17px; margin: 20px 0 8px; color: #222; page-break-after: avoid; }
    h4 { font-size: 15px; margin: 16px 0 6px; color: #333; }
    p { margin: 0 0 12px; orphans: 3; widows: 3; }
    ul, ol { margin: 0 0 12px; padding-left: 24px; }
    li { margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; page-break-inside: avoid; }
    th { background: #f5f5f5; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #ddd; }
    td { padding: 8px 12px; border: 1px solid #ddd; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    blockquote { margin: 16px 0; padding: 12px 20px; border-left: 4px solid #ccc; color: #555; background: #f9f9f9; }
    code { background: #f3f3f3; padding: 1px 5px; border-radius: 3px; font-size: 12px; font-family: 'Courier New', monospace; }
    pre { background: #f3f3f3; padding: 12px 16px; border-radius: 4px; overflow: auto; font-size: 12px; margin: 0 0 12px; }
    a { color: #1d4ed8; }
    img { max-width: 100%; height: auto; margin: 12px 0; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
    @media print {
      html, body { background: #fff !important; }
      body { padding: 0; max-width: 100%; }
      @page { margin: 20mm 20mm 20mm 20mm; size: A4; background: #fff; }
      h2, h3 { page-break-after: avoid; }
      table, figure { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <h1>${safeTitle}</h1>
    <div class="pdf-meta">
      ${post.focusKeyword ? `Focus keyword: <strong>${post.focusKeyword.replace(/</g, "&lt;")}</strong>` : ""}
      ${post.focusKeyword && post.wordCount ? " &nbsp;&middot;&nbsp; " : ""}
      ${post.wordCount ? `${post.wordCount.toLocaleString()} words &middot; ${post.readingTime || Math.ceil(post.wordCount / 200)} min read` : ""}
    </div>
  </div>
  ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${safeTitle}" style="max-width:100%; height:auto; margin: 0 0 28px; border-radius: 6px; display:block;" />` : ""}
  ${htmlContent}
  <script>
    window.onload = function() {
      document.title = ${JSON.stringify(slug)};
      setTimeout(function() { window.print(); }, 800);
    };
  <\/script>
</body>
</html>`);
      printWindow.document.close();

      toast.success("Print dialog opened — choose 'Save as PDF'");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <>
      {/* No image banner */}
      {!isNew && !post.featuredImage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0" />
            <span className="font-medium">No featured image.</span>
            <span className="text-amber-700">Auto-generation failed or was skipped during post creation.</span>
          </div>
          <Button size="sm" variant="outline"
            className="shrink-0 h-7 text-xs border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800"
            disabled={isRegeneratingImage}
            onClick={() => onRegenerateImage()}>
            {isRegeneratingImage
              ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              : <Sparkles className="mr-1.5 h-3 w-3" />}
            Generate Now
          </Button>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: back + title + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={`/dashboard/websites/${websiteId}/posts`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{isNew ? "New Post" : (post.title || "Edit Post")}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge
                variant={statusCfg.variant}
                className={statusCfg.className}
              >
                {post.status === "SCHEDULED" && <CalendarClock className="mr-1 h-3 w-3" />}
                {statusCfg.label}
              </Badge>
              {post.status === "SCHEDULED" && post.scheduledAt && (
                <span className="text-xs text-blue-600 font-medium">
                  {new Date(post.scheduledAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {wordCount.toLocaleString()} words · {readingTime} min read
              </span>
              {isFixingSEO && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Optimizing…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Save — always visible */}
          <Button variant="outline" size="sm" onClick={() => onSave()} disabled={isSaving || isPublishing}>
            {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Save
          </Button>

          {/* View Live — hidden on mobile, shown on sm+ */}
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50">
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden md:inline">View Live</span>
                <span className="sm:hidden md:hidden"><Globe className="h-3.5 w-3.5" /></span>
              </Button>
            </a>
          )}

          {/* Primary publish action — always visible */}
          {post.status === "SCHEDULED" ? (
            <Button size="sm" onClick={onPublish} disabled={isPublishing || isSaving}
              className="bg-green-600 hover:bg-green-700 text-white">
              {isPublishing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Publish Now</span>
              <span className="sm:hidden">Publish</span>
            </Button>
          ) : post.status === "PUBLISHED" ? (
            <Button size="sm" variant="outline" onClick={() => onSave("DRAFT")} disabled={isSaving}
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
              Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={onPublish} disabled={isPublishing || isSaving}
              className="bg-green-600 hover:bg-green-700 text-white">
              {isPublishing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
              Publish
            </Button>
          )}

          {/* Overflow "More" dropdown — secondary actions collapsed on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Unschedule (scheduled posts) */}
              {post.status === "SCHEDULED" && (
                <DropdownMenuItem onClick={handleUnschedule} className="text-sm cursor-pointer">
                  <X className="mr-2 h-3.5 w-3.5" />
                  Unschedule
                </DropdownMenuItem>
              )}

              {/* Mark as Review (draft posts) */}
              {post.status === "DRAFT" && !isNew && (
                <DropdownMenuItem onClick={() => onSave("REVIEW")} disabled={isSaving} className="text-sm cursor-pointer">
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Mark for Review
                </DropdownMenuItem>
              )}

              {/* Schedule */}
              {!isNew && post.status !== "PUBLISHED" && (
                <DropdownMenuItem onClick={() => { prefillScheduleDate(); setShowScheduler((v) => !v); }} className="text-sm cursor-pointer">
                  <CalendarClock className="mr-2 h-3.5 w-3.5" />
                  Schedule Post
                </DropdownMenuItem>
              )}

              {/* View Live on mobile */}
              {liveUrl && (
                <DropdownMenuItem asChild className="text-sm cursor-pointer sm:hidden">
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    View Live
                  </a>
                </DropdownMenuItem>
              )}

              {/* Push to CMS */}
              {!isNew && hasCMSIntegration && (
                <>
                  <DropdownMenuSeparator />
                  {integrations.wp && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">WordPress</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handlePushToWordPress("draft")} disabled={isPushingToCMS} className="text-sm cursor-pointer">
                        <Plug className="mr-2 h-3.5 w-3.5 text-[#21759b]" />
                        Push as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePushToWordPress("publish")} disabled={isPushingToCMS} className="text-sm cursor-pointer">
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-[#21759b]" />
                        Publish to WordPress
                      </DropdownMenuItem>
                    </>
                  )}
                  {integrations.wp && integrations.shopify && <DropdownMenuSeparator />}
                  {integrations.shopify && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Shopify</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handlePushToShopify("draft")} disabled={isPushingToCMS} className="text-sm cursor-pointer">
                        <Plug className="mr-2 h-3.5 w-3.5 text-[#5c8a1e]" />
                        Push as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePushToShopify("published")} disabled={isPushingToCMS} className="text-sm cursor-pointer">
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-[#5c8a1e]" />
                        Publish to Shopify
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}

              {/* Download PDF */}
              {!isNew && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloadingPDF || !post.content?.trim()} className="text-sm cursor-pointer">
                    {isDownloadingPDF ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
                    Download PDF
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scheduler Panel */}
      {showScheduler && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm flex-wrap">
          <CalendarClock className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="font-medium text-blue-800 shrink-0">Schedule publish:</span>
          <input
            type="datetime-local"
            value={scheduleDate}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button size="sm" onClick={handleSchedule} disabled={isScheduling || !scheduleDate}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            {isScheduling ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CalendarClock className="mr-1.5 h-3.5 w-3.5" />}
            Confirm
          </Button>
          <button type="button" onClick={() => setShowScheduler(false)} className="ml-auto text-blue-400 hover:text-blue-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Scheduled banner */}
      {post.status === "SCHEDULED" && post.scheduledAt && !showScheduler && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm">
          <CalendarClock className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-blue-800">
            Scheduled to publish on{" "}
            <strong>
              {new Date(post.scheduledAt).toLocaleString(undefined, {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </strong>
          </span>
          <button type="button" onClick={() => {
            const d = new Date(post.scheduledAt!);
            const pad = (n: number) => String(n).padStart(2, "0");
            setScheduleDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
            setShowScheduler(true);
          }}
            className="ml-auto text-xs text-blue-600 hover:underline font-medium whitespace-nowrap">
            Change date
          </button>
        </div>
      )}

      {/* CMS push result banner */}
      {cmsResult && (
        <div className={`flex items-center justify-between p-3 rounded-lg text-sm ${cmsResult.type === "wp" ? "bg-[#21759b]/10 border border-[#21759b]/20" : "bg-[#96bf48]/10 border border-[#96bf48]/20"}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${cmsResult.type === "wp" ? "text-[#21759b]" : "text-[#5c8a1e]"}`} />
            <span className={`font-medium ${cmsResult.type === "wp" ? "text-[#21759b]" : "text-[#5c8a1e]"}`}>
              Pushed to {cmsResult.type === "wp" ? "WordPress" : "Shopify"} successfully
            </span>
          </div>
          <div className="flex gap-3">
            {cmsResult.viewUrl && (
              <a href={cmsResult.viewUrl} target="_blank" rel="noopener noreferrer"
                className={`text-xs hover:underline flex items-center gap-1 ${cmsResult.type === "wp" ? "text-[#21759b]" : "text-[#5c8a1e]"}`}>
                View Post <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {cmsResult.editUrl && (
              <a href={cmsResult.editUrl} target="_blank" rel="noopener noreferrer"
                className={`text-xs hover:underline flex items-center gap-1 ${cmsResult.type === "wp" ? "text-[#21759b]" : "text-[#5c8a1e]"}`}>
                Edit <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button type="button" onClick={() => setCmsResult(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
