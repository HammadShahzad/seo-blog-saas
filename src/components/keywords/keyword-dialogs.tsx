"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Loader2, Zap } from "lucide-react";
import { type Keyword } from "./types";

interface KeywordDialogsProps {
  showAddDialog: boolean;
  setShowAddDialog: (open: boolean) => void;
  newKeyword: string;
  setNewKeyword: (value: string) => void;
  newNotes: string;
  setNewNotes: (value: string) => void;
  onAdd: () => void;
  isAdding: boolean;

  showBulkDialog: boolean;
  setShowBulkDialog: (open: boolean) => void;
  bulkText: string;
  setBulkText: (value: string) => void;
  onBulkImport: (keywords: string[]) => void;
  isImporting: boolean;

  showBulkGenDialog: boolean;
  setShowBulkGenDialog: (open: boolean) => void;
  selectedCount: number;
  bulkCount: number;
  setBulkCount: (n: number) => void;
  pendingKeywords: Keyword[];
  onBulkGenerate: () => void;
  isBulkGenerating: boolean;
}

export function KeywordDialogs({
  showAddDialog,
  setShowAddDialog,
  newKeyword,
  setNewKeyword,
  newNotes,
  setNewNotes,
  onAdd,
  isAdding,
  showBulkDialog,
  setShowBulkDialog,
  bulkText,
  setBulkText,
  onBulkImport,
  isImporting,
  showBulkGenDialog,
  setShowBulkGenDialog,
  selectedCount,
  bulkCount,
  setBulkCount,
  pendingKeywords,
  onBulkGenerate,
  isBulkGenerating,
}: KeywordDialogsProps) {
  return (
    <>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Keyword</DialogTitle>
            <DialogDescription>Add a target keyword to the generation queue</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="e.g., how to create an invoice" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === "Enter" && onAdd()} />
            <Textarea placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={onAdd} disabled={isAdding || !newKeyword.trim()}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Keyword
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paste Keywords</DialogTitle>
            <DialogDescription>One keyword per line. Duplicates will be skipped.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={"how to create an invoice\nbest invoicing software\ninvoice template free\n..."}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            rows={10}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
            <Button
              onClick={() => onBulkImport(bulkText.split("\n"))}
              disabled={isImporting || !bulkText.trim()}
            >
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {bulkText.split("\n").filter(Boolean).length} Keywords
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkGenDialog} onOpenChange={setShowBulkGenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Bulk Generate Posts
            </DialogTitle>
            <DialogDescription>
              {selectedCount > 0
                ? `Generate posts for ${selectedCount} selected keyword${selectedCount !== 1 ? "s" : ""}`
                : `Generate posts from the top pending keywords`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedCount === 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">How many posts to generate?</p>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map(n => (
                    <Button
                      key={n}
                      variant={bulkCount === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBulkCount(n)}
                      disabled={n > pendingKeywords.length}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingKeywords.length} pending keywords available
                </p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <p className="font-medium">This will use {selectedCount > 0 ? selectedCount : bulkCount} post credits from your monthly limit.</p>
              <p className="text-xs mt-0.5">Posts will be saved as drafts unless auto-publish is enabled.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkGenDialog(false)}>Cancel</Button>
            <Button onClick={onBulkGenerate} disabled={isBulkGenerating}>
              {isBulkGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting…</>
              ) : (
                <><Zap className="mr-2 h-4 w-4" />Start Generating</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
