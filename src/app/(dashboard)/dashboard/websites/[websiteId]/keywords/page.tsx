"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Upload,
  Loader2,
  MoreVertical,
  Trash2,
  ArrowUp,
  ArrowDown,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Keyword {
  id: string;
  keyword: string;
  status: string;
  priority: number;
  searchVolume: number | null;
  difficulty: number | null;
  intent: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  RESEARCHING: "bg-blue-100 text-blue-800",
  GENERATING: "bg-purple-100 text-purple-800",
  REVIEW: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  SKIPPED: "bg-gray-100 text-gray-800",
};

export default function KeywordsPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchKeywords = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords`);
      if (res.ok) {
        const data = await res.json();
        setKeywords(data);
      }
    } catch {
      toast.error("Failed to load keywords");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [websiteId]);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword, notes: newNotes }),
      });
      if (res.ok) {
        toast.success("Keyword added");
        setNewKeyword("");
        setNewNotes("");
        setShowAddDialog(false);
        fetchKeywords();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add keyword");
      }
    } catch {
      toast.error("Failed to add keyword");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkAdd = async () => {
    const keywordList = bulkKeywords
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean);
    if (keywordList.length === 0) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywordList }),
      });
      if (res.ok) {
        toast.success(`${keywordList.length} keywords added`);
        setBulkKeywords("");
        setShowBulkDialog(false);
        fetchKeywords();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add keywords");
      }
    } catch {
      toast.error("Failed to add keywords");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/keywords/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Keyword deleted");
        fetchKeywords();
      }
    } catch {
      toast.error("Failed to delete keyword");
    }
  };

  const statusCounts = {
    pending: keywords.filter((k) => k.status === "PENDING").length,
    generating: keywords.filter((k) =>
      ["RESEARCHING", "GENERATING"].includes(k.status)
    ).length,
    completed: keywords.filter((k) => k.status === "COMPLETED").length,
    failed: keywords.filter((k) => k.status === "FAILED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Keywords</h2>
          <p className="text-muted-foreground">
            Manage your content generation keyword queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Import Keywords</DialogTitle>
                <DialogDescription>
                  Enter one keyword per line
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder={"how to create an invoice\nbest invoicing software\ninvoice template free"}
                value={bulkKeywords}
                onChange={(e) => setBulkKeywords(e.target.value)}
                rows={8}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAdd} disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {bulkKeywords.split("\n").filter(Boolean).length} Keywords
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Keyword
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Keyword</DialogTitle>
                <DialogDescription>
                  Add a new target keyword to the generation queue
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter keyword or phrase"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Notes (optional) - e.g., special instructions"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddKeyword} disabled={isAdding || !newKeyword.trim()}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Keyword
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{statusCounts.generating}</p>
            <p className="text-xs text-muted-foreground">Generating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{statusCounts.failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : keywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <KeyRound className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-2">No keywords yet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Add keywords to start generating AI-powered blog content.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Keyword
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((kw) => (
                  <TableRow key={kw.id}>
                    <TableCell className="font-medium">{kw.keyword}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[kw.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {kw.status.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{kw.priority}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {kw.searchVolume?.toLocaleString() || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {kw.difficulty || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                        {kw.notes || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Increase Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Decrease Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteKeyword(kw.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
