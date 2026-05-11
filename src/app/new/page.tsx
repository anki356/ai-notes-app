"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNote } from "@/lib/actions";
import { useAppStore } from "@/lib/store";
import { X, Sparkles, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function NewNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const router = useRouter();
  const setCurrentNote = useAppStore((state) => state.setCurrentNote);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsSaving(true);
    try {
      const note = await createNote({
        title: title.trim() || "Untitled Note",
        content: content.trim(),
      });
      setCurrentNote(note as any);
      router.push("/");
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, handleSave]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0F172A] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] -ml-40 -mb-40 pointer-events-none" />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-border z-10 bg-white/50 dark:bg-transparent backdrop-blur-md">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Draft Mode</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Create Note"}</span>
          </button>
        </div>
      </header>

      {/* Content Form */}
      <main className="flex-1 overflow-y-auto px-8 py-16 z-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Note Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your note a title..."
              className="w-full text-5xl font-black tracking-tight bg-transparent border-none outline-none placeholder:text-gray-200 dark:placeholder:text-slate-800 focus:ring-0"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Content</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
                >
                  {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <Sparkles className="w-3 h-3 text-[#6366f1]" />
                  <span>AI will summarize this after saving</span>
                </div>
              </div>
            </div>
            {isPreviewMode ? (
              <div className="w-full min-h-[400px] overflow-y-auto prose prose-slate dark:prose-invert max-w-none prose-lg">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start capturing your thoughts..."
                className="w-full min-h-[400px] text-xl leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-gray-100 dark:placeholder:text-slate-800/50 focus:ring-0"
              />
            )}
          </div>
        </div>
      </main>

      {/* Action Bar */}
      <div className="h-16 border-t border-border flex items-center justify-center px-8 z-10 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
             <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-foreground">Alt</span>
             <span>+</span>
             <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-foreground">S</span>
             <span className="ml-2">to quick save</span>
           </div>
        </div>
      </div>
    </div>
  );
}
