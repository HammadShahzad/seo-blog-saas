"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface ShopifyBlogOption {
  id: number;
  title: string;
  handle: string;
}

export function ShopifySettings({ websiteId }: { websiteId: string }) {
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [blogId, setBlogId] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogs, setBlogs] = useState<ShopifyBlogOption[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  const [connected, setConnected] = useState(false);
  const [connectedStore, setConnectedStore] = useState("");
  const [connectedBlog, setConnectedBlog] = useState("");

  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    shopName?: string;
    shopDomain?: string;
    email?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/websites/${websiteId}/shopify`)
      .then((r) => r.json())
      .then(
        (d: {
          connected?: boolean;
          storeUrl?: string;
          blogId?: string;
          blogTitle?: string;
        }) => {
          if (d.connected) {
            setConnected(true);
            setConnectedStore(d.storeUrl || "");
            setConnectedBlog(d.blogTitle || "");
            setStoreUrl(d.storeUrl || "");
            setBlogId(d.blogId || "");
            setBlogTitle(d.blogTitle || "");
          }
        }
      )
      .catch(() => {});
  }, [websiteId]);

  const handleFetchBlogs = async () => {
    if (!storeUrl || !accessToken) return;
    setLoadingBlogs(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/shopify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list-blogs", storeUrl, accessToken }),
      });
      const data = await res.json();
      if (data.blogs?.length) {
        setBlogs(data.blogs);
        if (!blogId) {
          setBlogId(String(data.blogs[0].id));
          setBlogTitle(data.blogs[0].title);
        }
      }
    } catch {
      /* silent */
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleTest = async () => {
    if (!storeUrl || !accessToken) {
      toast.error("Enter store URL and access token");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/shopify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", storeUrl, accessToken }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        toast.success(`Connected to ${data.shopName}!`);
        handleFetchBlogs();
      } else {
        toast.error(data.error || "Connection failed");
      }
    } catch {
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!storeUrl || !accessToken) {
      toast.error("Enter store URL and access token");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/shopify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl, accessToken, blogId, blogTitle }),
      });
      if (res.ok) {
        setConnected(true);
        setConnectedStore(storeUrl.replace(/^https?:\/\//i, ""));
        setConnectedBlog(blogTitle);
        toast.success("Shopify connected!");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch(`/api/websites/${websiteId}/shopify`, { method: "DELETE" });
      setConnected(false);
      setConnectedStore("");
      setConnectedBlog("");
      setStoreUrl("");
      setAccessToken("");
      setBlogId("");
      setBlogTitle("");
      setBlogs([]);
      setTestResult(null);
      toast.success("Shopify disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Connected banner */}
      {connected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Shopify Connected</p>
                <p className="text-sm text-green-700">
                  {connectedStore}
                  {connectedBlog && (
                    <span className="ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                      Blog: {connectedBlog}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 text-green-800"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Disconnect"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connection form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" />
            Shopify Integration
          </CardTitle>
          <CardDescription>
            Publish AI-generated posts directly to your Shopify blog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* How-to info */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              How to get your Access Token
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Go to your Shopify Admin →{" "}
                <strong>Apps → App and sales channel settings</strong>
              </li>
              <li>
                Click <strong>Develop apps</strong> →{" "}
                <strong>Create an app</strong>
              </li>
              <li>
                Under <strong>Configuration</strong>, add{" "}
                <strong>write_content, read_content</strong> Admin API scopes
              </li>
              <li>
                Click <strong>Install app</strong> → copy the{" "}
                <strong>Admin API access token</strong>
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label>Shopify Store URL</Label>
            <Input
              placeholder="mystore.myshopify.com"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your store&apos;s .myshopify.com domain
            </p>
          </div>

          <div className="space-y-2">
            <Label>Admin API Access Token</Label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Test result */}
          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                testResult.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <div>
                {testResult.success ? (
                  <>
                    <p className="font-medium text-green-800">
                      {testResult.shopName}
                    </p>
                    <p className="text-xs text-green-700">
                      {testResult.shopDomain} · {testResult.email}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-red-800">
                    {testResult.error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Blog selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Target Blog</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFetchBlogs}
                disabled={loadingBlogs || !storeUrl || !accessToken}
                className="h-7 text-xs"
              >
                {loadingBlogs ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <ChevronDown className="mr-1 h-3 w-3" />
                )}
                {blogs.length ? "Refresh blogs" : "Fetch blogs"}
              </Button>
            </div>
            {blogs.length > 0 ? (
              <Select
                value={blogId}
                onValueChange={(id) => {
                  setBlogId(id);
                  const found = blogs.find((b) => String(b.id) === id);
                  if (found) setBlogTitle(found.title);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a blog" />
                </SelectTrigger>
                <SelectContent>
                  {blogs.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Leave blank to use your first blog automatically"
                value={blogId}
                onChange={(e) => setBlogId(e.target.value)}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Articles will be posted to this Shopify blog. Click &quot;Fetch
              blogs&quot; after testing to see available options.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !storeUrl || !accessToken}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !storeUrl || !accessToken}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save & Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
