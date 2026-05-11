"use client";

import { Sparkles, X, Brain, Search, Link, Info, FileText, RefreshCw } from "lucide-react";
import { generateNoteSummary } from "@/lib/actions";
import { useAppStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";

export default function AIInsights() {
  const currentNote = useAppStore((state) => state.currentNote);
  const updateCurrentNoteSummary = useAppStore((state) => state.updateCurrentNoteSummary);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = useCallback(async () => {
    if (!currentNote?.id || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const summary = await generateNoteSummary(currentNote.id);
      if (summary) {
        updateCurrentNoteSummary(summary);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [currentNote?.id, isGenerating, updateCurrentNoteSummary]);

  useEffect(() => {
    // Auto-generate summary only if content exists and no summary yet
    if (currentNote?.content && currentNote.content.length > 50 && !currentNote.summary && !isGenerating) {
      handleGenerateSummary();
    }
  }, [currentNote?.id, currentNote?.content, currentNote?.summary, handleGenerateSummary, isGenerating]);

  if (!currentNote) return null;

  return (
    <aside className="w-[320px] bg-white dark:bg-[#0F172A] border-l border-border flex flex-col p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#6366f1]">
          <Sparkles className="w-5 h-5 fill-current" />
          <h2 className="font-bold text-sm uppercase tracking-tight">AI Insights</h2>
        </div>
        <X className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
      </div>

      <div className="space-y-8">
        {/* Executive Summary */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Summary</span>
            </div>
            {currentNote.summary && (
              <RefreshCw 
                onClick={handleGenerateSummary}
                className={`w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary transition-all ${isGenerating ? 'animate-spin' : ''}`} 
              />
            )}
          </div>
          <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-xl border border-border min-h-[100px] flex flex-col">
            {isGenerating ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-[90%]" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-[80%]" />
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                {currentNote.summary || "Add more content to generate an AI summary..."}
              </p>
            )}
          </div>
        </section>

        {/* Extracted Entities */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Brain className="w-3.5 h-3.5" />
            <span>Extracted Entities</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentNote.title.split(" ").slice(0, 4).map((word, i) => (
              <EntityPill key={i} label={word.replace(/[^a-zA-Z]/g, "")} />
            ))}
            <EntityPill label="Project" />
          </div>
        </section>

        {/* Semantic Matches */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Search className="w-3.5 h-3.5" />
            <span>Semantic Matches</span>
          </div>
          <div className="space-y-3">
            <MatchCard 
              title="Related Concept" 
              description="Exploring similar themes in your previous notes about knowledge management..."
              percentage={85}
            />
          </div>
        </section>
      </div>

      <button 
        onClick={handleGenerateSummary}
        disabled={isGenerating}
        className="mt-8 w-full border border-border hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-all disabled:opacity-50"
      >
        {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {isGenerating ? "Analyzing..." : "Regenerate Summary"}
      </button>
    </aside>
  );
}

function EntityPill({ label }: { label: string }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-[#1E293B] border border-border rounded-full text-[11px] font-medium">
      <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
      {label}
    </div>
  );
}

function MatchCard({ title, description, percentage }: { title: string, description: string, percentage: number }) {
  return (
    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-bold truncate pr-4">{title}</h4>
        <Link className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
        {description}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{percentage}% Match</span>
      </div>
    </div>
  );
}
