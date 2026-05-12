"use client";

import { Share2, MoreVertical, Menu, Calendar, Clock, Bold, Italic, List, Link, Image as ImageIcon, Sparkles, Plus, Eye, EyeOff, Edit3, Mic } from "lucide-react";
import AIInsights from "@/components/AIInsights";
import ReactMarkdown from "react-markdown";
import { useAppStore } from "@/lib/store";
import { useEffect, useState, useCallback, useRef } from "react";
import { updateNote } from "@/lib/actions";
import debounce from "lodash/debounce";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function EditorPage() {
  const currentNote = useAppStore((state) => state.currentNote);
  const updateCurrentNoteContent = useAppStore((state) => state.updateCurrentNoteContent);
  const updateCurrentNoteTitle = useAppStore((state) => state.updateCurrentNoteTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (id: string, title: string, content: string) => {
      setIsSaving(true);
      try {
        await updateNote(id, { title, content });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateCurrentNoteContent(newContent);
    if (currentNote?.id) {
      debouncedSave(currentNote.id, currentNote.title, newContent);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateCurrentNoteTitle(newTitle);
    if (currentNote?.id) {
      debouncedSave(currentNote.id, newTitle, currentNote.content);
    }
  };

  const forceSave = async () => {
    if (currentNote?.id) {
      setIsSaving(true);
      try {
        await updateNote(currentNote.id, { title: currentNote.title, content: currentNote.content });
      } finally {
        setIsSaving(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        forceSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentNote, forceSave]);

  const handleFormat = (type: "bold" | "italic" | "list") => {
    if (!textareaRef.current || !currentNote) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = currentNote.content;
    const selected = text.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        newText = text.substring(0, start) + `**${selected}**` + text.substring(end);
        cursorOffset = selected ? 0 : 2;
        break;
      case "italic":
        newText = text.substring(0, start) + `*${selected}*` + text.substring(end);
        cursorOffset = selected ? 0 : 1;
        break;
      case "list":
        const lines = selected.split("\n").map(l => `- ${l}`).join("\n");
        newText = text.substring(0, start) + lines + text.substring(end);
        break;
    }

    updateCurrentNoteContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + cursorOffset, end + cursorOffset);
      }
    }, 0);

    if (currentNote.id) {
      debouncedSave(currentNote.id, currentNote.title, newText);
    }
  };

  if (!currentNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-8 animate-bounce-subtle">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black mb-3 text-foreground tracking-tight">Your Mind is Empty</h2>
        <p className="max-w-xs text-sm leading-relaxed mb-8">Select a note from the library or create a fresh one to start capturing your brilliance.</p>
        <button 
          onClick={() => (window.location.href = "/new")}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Your First Note
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0">
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-sm">
            <Menu onClick={() => setIsSidebarOpen(true)} className="w-5 h-5 text-muted-foreground cursor-pointer lg:hidden hover:text-foreground" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Workspace</span>
              <span className="text-gray-300">/</span>
              <span className="text-foreground font-medium truncate max-w-[150px]">{currentNote.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div 
              onClick={forceSave}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
              {isSaving ? "Syncing..." : "Saved to Backend"}
            </div>
            <div className="w-px h-6 bg-border mx-2" />
            <button 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground hover:text-foreground"
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm font-medium">{isPreviewMode ? "Edit" : "Preview"}</span>
            </button>
            
            <button 
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${showVoiceRecorder ? "bg-red-50 text-red-600" : "hover:bg-gray-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"}`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Voice</span>
            </button>

            <Share2 className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors ml-2" />
            <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-16 max-w-4xl mx-auto w-full">
          <input 
            type="text"
            value={currentNote.title}
            onChange={handleTitleChange}
            className="text-4xl font-bold mb-6 tracking-tight bg-transparent border-none outline-none w-full focus:ring-0"
            placeholder="Untitled Note"
          />
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-12">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{mounted ? new Date().toLocaleDateString() : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{currentNote.content.split(/\s+/).length} words</span>
            </div>
          </div>

          {isPreviewMode ? (
            <div className="prose prose-lg dark:prose-invert max-w-none w-full min-h-[60vh] pb-32 prose-headings:font-bold prose-a:text-blue-600 prose-p:leading-relaxed">
              <ReactMarkdown>{currentNote.content || "*Nothing to preview yet...*"}</ReactMarkdown>
            </div>
          ) : (
            <textarea 
              ref={textareaRef}
              value={currentNote.content}
              onChange={handleContentChange}
              className="w-full h-[60vh] bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-foreground/90 focus:ring-0 pb-32"
              placeholder="Start writing..."
            />
          )}
        </div>

        {!isPreviewMode && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E293B] border border-border rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-6 z-20">
            <div className="flex items-center gap-4">
              <Bold onClick={() => handleFormat('bold')} className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Italic onClick={() => handleFormat('italic')} className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <List onClick={() => handleFormat('list')} className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-4">
              <Link className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
              <ImageIcon className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
            <div className="w-px h-4 bg-border" />
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI Insights
            </button>
          </div>
        )}
      </main>

      <AIInsights />
      <VoiceRecorder 
        autoSave={false} 
        onTranscriptComplete={(transcribedText) => {
          const newContent = currentNote.content ? `${currentNote.content}\n\n${transcribedText}` : transcribedText;
          updateCurrentNoteContent(newContent);
          if (currentNote.id) {
            debouncedSave(currentNote.id, currentNote.title, newContent);
          }
        }} 
      />
    </div>
  );
}
