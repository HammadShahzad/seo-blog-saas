import { Marked } from "marked";
import type { WordPressConfig } from "./wordpress-types";

export function decodeWordPressConfig(
  cmsApiUrl: string,
  cmsApiKey: string
): WordPressConfig & { mode: "app-password" | "plugin" } {
  const base = (cmsApiUrl || "").replace(/\/$/, "");
  if (cmsApiKey.startsWith("plugin:")) {
    return {
      mode: "plugin",
      siteUrl: base,
      username: "",
      appPassword: "",
      pluginApiKey: cmsApiKey.slice("plugin:".length),
    };
  }
  try {
    const decoded = Buffer.from(cmsApiKey, "base64").toString("utf-8");
    const sep = decoded.indexOf(":::");
    if (sep !== -1) {
      return {
        mode: "app-password",
        siteUrl: base,
        username: decoded.slice(0, sep),
        appPassword: decoded.slice(sep + 3),
      };
    }
  } catch { /* fall through */ }
  return { mode: "app-password", siteUrl: base, username: "", appPassword: "" };
}

export function getAuthHeader(username: string, appPassword: string): string {
  const credentials = `${username}:${appPassword.replace(/\s/g, "")}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "").trim();
}

function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function markdownToHtml(markdown: string): string {
  const stripped = markdown
    .replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  const withoutToc = stripped;

  const md = new Marked({ gfm: true, breaks: false });
  md.use({
    renderer: {
      heading({ text, depth }: { text: string; depth: number }) {
        const id = headingSlug(text);
        const cleanText = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");
        return `<h${depth} id="${id}">${cleanText}</h${depth}>\n`;
      },
    },
  });

  const rawHtml = md.parse(withoutToc) as string;

  const html = rawHtml.replace(
    /<table[\s\S]*?<\/table>/g,
    (table) => {
      const styled = table
        .replace(/<table/g, '<table style="width:100%;border-collapse:collapse;margin:1.5em 0;font-size:0.95em"')
        .replace(/<thead/g, '<thead style="background:#f8f9fa"')
        .replace(/<th(?=[>\s])/g, '<th style="border:1px solid #dee2e6;padding:10px 14px;text-align:left;font-weight:600;background:#f1f3f5"')
        .replace(/<td(?=[>\s])/g, '<td style="border:1px solid #dee2e6;padding:10px 14px"')
        .replace(/<tr(?=[>\s])/g, '<tr style="border-bottom:1px solid #dee2e6"');
      return `<div style="overflow-x:auto;margin:1.5em 0">${styled}</div>`;
    }
  );

  return html;
}
