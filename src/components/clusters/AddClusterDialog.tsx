"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import type { NewClusterForm } from "./types";

interface AddClusterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCluster: NewClusterForm;
  onNewClusterChange: (cluster: NewClusterForm) => void;
  onSubmit: () => void;
  isAdding: boolean;
}

export function AddClusterDialog({
  open,
  onOpenChange,
  newCluster,
  onNewClusterChange,
  onSubmit,
  isAdding,
}: AddClusterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Manual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Topic Cluster</DialogTitle>
          <DialogDescription>Define a pillar topic and its supporting keywords</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Cluster Name</Label>
            <Input placeholder="e.g., Invoicing & Billing"
              value={newCluster.name}
              onChange={(e) => onNewClusterChange({ ...newCluster, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Pillar Keyword</Label>
            <Input placeholder="e.g., invoicing software"
              value={newCluster.pillarKeyword}
              onChange={(e) => onNewClusterChange({ ...newCluster, pillarKeyword: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Supporting Keywords</Label>
            <Input placeholder="keyword1, keyword2, keyword3"
              value={newCluster.supportingKeywords}
              onChange={(e) => onNewClusterChange({ ...newCluster, supportingKeywords: e.target.value })} />
            <p className="text-xs text-muted-foreground">Comma-separated list</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onSubmit} disabled={isAdding || !newCluster.name || !newCluster.pillarKeyword}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Cluster
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
