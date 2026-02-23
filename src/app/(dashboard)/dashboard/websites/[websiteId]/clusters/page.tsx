"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Network, Loader2 } from "lucide-react";
import { useClusters } from "@/components/clusters/useClusters";
import { AiSuggestionsPanel } from "@/components/clusters/AiSuggestionsPanel";
import { ClusterCard } from "@/components/clusters/ClusterCard";
import { AddClusterDialog } from "@/components/clusters/AddClusterDialog";
import { SeedTopicInput } from "@/components/clusters/SeedTopicInput";

export default function ClustersPage() {
  const params = useParams();
  const websiteId = params.websiteId as string;

  const {
    clusters,
    isLoading,
    isGenerating,
    isAdding,
    isSaving,
    expandedId,
    setExpandedId,
    clusterKeywordSelection,
    addingToQueueId,
    showAddDialog,
    setShowAddDialog,
    suggestions,
    stepStatus,
    selectedSuggestions,
    seedTopic,
    setSeedTopic,
    newCluster,
    setNewCluster,
    clusterSteps,
    handleAIGenerate,
    handleCancelGenerate,
    handleSaveSuggestions,
    toggleSuggestion,
    handleRemoveSuggestion,
    selectAllSuggestions,
    dismissSuggestions,
    handleAddManual,
    handleDelete,
    toggleClusterKeyword,
    toggleAllClusterKeywords,
    handleAddToQueue,
  } = useClusters(websiteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AiSuggestionsPanel
        isGenerating={isGenerating}
        suggestions={suggestions}
        stepStatus={stepStatus}
        selectedSuggestions={selectedSuggestions}
        isSaving={isSaving}
        clusterSteps={clusterSteps}
        onSaveSuggestions={handleSaveSuggestions}
        onToggleSuggestion={toggleSuggestion}
        onSelectAll={selectAllSuggestions}
        onDismiss={dismissSuggestions}
        onCancelGenerate={handleCancelGenerate}
        onRemoveSuggestion={handleRemoveSuggestion}
      />

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Topic Clusters
          </h2>
          <p className="text-muted-foreground mt-1">
            Organize content around pillar topics to dominate search rankings
          </p>
        </div>
        <div className="flex gap-2">
          <AddClusterDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            newCluster={newCluster}
            onNewClusterChange={setNewCluster}
            onSubmit={handleAddManual}
            isAdding={isAdding}
          />
        </div>
      </div>

      <SeedTopicInput
        seedTopic={seedTopic}
        onSeedTopicChange={setSeedTopic}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
      />

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Network className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">What are topic clusters?</p>
            <p className="text-muted-foreground mt-0.5">
              A pillar page covers a broad topic, while supporting pages cover related subtopics.
              Internal linking between them signals authority to Google.{" "}
              <span className="text-foreground font-medium">
                AI crawls your actual website
              </span>{" "}
              before generating — so results are specific to your business.
            </p>
          </div>
        </CardContent>
      </Card>

      {clusters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Network className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No topic clusters yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Enter a topic above and click Generate — AI will research and
              build a pillar + supporting keyword cluster around it.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clusters.map((cluster) => (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              isExpanded={expandedId === cluster.id}
              onToggleExpand={() => setExpandedId(expandedId === cluster.id ? null : cluster.id)}
              onDelete={() => handleDelete(cluster.id)}
              keywordSelection={clusterKeywordSelection[cluster.id]}
              onToggleKeyword={(kw) => toggleClusterKeyword(cluster.id, kw)}
              onToggleAllKeywords={() => toggleAllClusterKeywords(cluster)}
              isAddingToQueue={addingToQueueId === cluster.id}
              onAddToQueue={() => handleAddToQueue(cluster)}
            />
          ))}
        </div>
      )}

      {clusters.length > 0 && (
        <div className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            {clusters.length} cluster{clusters.length !== 1 ? "s" : ""} ·{" "}
            {clusters.reduce((acc, c) => acc + c.supportingKeywords.length, 0)} supporting keywords total
          </p>
        </div>
      )}
    </div>
  );
}
