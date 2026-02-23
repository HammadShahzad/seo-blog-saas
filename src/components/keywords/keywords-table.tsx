"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KeyRound,
  Loader2,
  MoreVertical,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { type Keyword, STATUS_COLORS, INTENT_COLORS } from "./types";

interface KeywordsTableProps {
  isLoading: boolean;
  keywords: Keyword[];
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onGetSuggestions: () => void;
  onShowAddDialog: () => void;
  websiteId: string;
}

export function KeywordsTable({
  isLoading,
  keywords,
  selected,
  setSelected,
  onToggleSelect,
  onDelete,
  onGetSuggestions,
  onShowAddDialog,
  websiteId,
}: KeywordsTableProps) {
  return (
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
            <p className="text-muted-foreground max-w-sm mb-4 text-sm">
              Add keywords manually, import a CSV, or let AI suggest the best keywords for your niche.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onGetSuggestions}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Suggest Keywords
              </Button>
              <Button onClick={onShowAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Manually
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === keywords.length && keywords.length > 0}
                    onCheckedChange={(v) => {
                      if (v) setSelected(new Set(keywords.map(k => k.id)));
                      else setSelected(new Set());
                    }}
                  />
                </TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((kw) => (
                <TableRow key={kw.id} className={selected.has(kw.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(kw.id)}
                      onCheckedChange={() => onToggleSelect(kw.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{kw.keyword}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[kw.status] || "bg-gray-100 text-gray-800"}`}>
                      {kw.status.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {kw.intent ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${INTENT_COLORS[kw.intent] || "bg-gray-50 text-gray-700"}`}>
                        {kw.intent}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{kw.priority}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                      {kw.notes || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {kw.status === "PENDING" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/websites/${websiteId}/generator`}>
                              <Zap className="mr-2 h-4 w-4" />
                              Generate Now
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(kw.id)}>
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
  );
}
