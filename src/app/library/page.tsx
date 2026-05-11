"use client";

import { Search, Plus, Filter, MoreVertical, FileText, Clock, Tag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotes, searchNotes } from "@/lib/actions";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function Library() {
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);
  const setCurrentNote = useAppStore((state) => state.setCurrentNote);
  const isLoading = useAppStore((state) => state.isLoading);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true);
      try {
        const data = await getNotes();
        setNotes(data as any);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotes();
  }, [setNotes, setIsLoading]);

  const handleSelectNote = (note: any) => {
    setCurrentNote(note);
    router.push("/");
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await searchNotes(query);
      setNotes(results as any);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-10 border-b border-border bg-white/50 dark:bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Library</h2>
          <span className="text-muted-foreground text-sm font-medium">
            {isLoading ? "Loading..." : `${notes.length} Notes`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? "text-blue-500" : "text-muted-foreground"}`} />
            <input 
              type="text" 
              placeholder="Search library semantically..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-border rounded-xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            {searchQuery && !isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-tighter animate-pulse">
                <Sparkles className="w-3 h-3" />
                AI Search
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </header>

      {/* Grid of Notes */}
      <main className="flex-1 overflow-y-auto p-10">
        {isLoading && notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-2">No notes found</h3>
            <p className="max-w-xs mx-auto">Create your first note to start building your knowledge base.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard 
                key={note.id}
                title={note.title} 
                preview={note.content || "No content yet..."}
                date={mounted ? new Date(note.createdAt).toLocaleDateString() : ""}
                isVoice={note.isVoice}
                onClick={() => handleSelectNote(note)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function NoteCard({ title, preview, date, isVoice, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-border p-6 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-transparent hover:border-blue-500/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
          <FileText className="w-5 h-5" />
        </div>
        {isVoice && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Voice
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors truncate">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
        {preview}
      </p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
        <Clock className="w-3.5 h-3.5" />
        <span>{date}</span>
      </div>
    </div>
  );
}
