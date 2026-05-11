"use client";

import { Search, Bell, Cloud, Mic, Filter, Download, Sparkles, StopCircle, Play, Pause } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getNotes, createNote } from "@/lib/actions";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function VoiceGallery() {
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);
  const isLoading = useAppStore((state) => state.isLoading);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const setCurrentNote = useAppStore((state) => state.setCurrentNote);
  const router = useRouter();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;
      };
      
      recognitionRef.current = recognition;
    }

    // Check permission status proactively
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((status) => {
        setPermissionStatus(status.state);
        status.onchange = () => setPermissionStatus(status.state);
      }).catch(err => console.error("Permission query failed:", err));
    }

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

  const voiceNotes = notes.filter(n => n.isVoice);

  const startRecording = async () => {
    setError(null);
    setTranscript("");
    transcriptRef.current = "";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        const finalContent = transcriptRef.current.trim() || "Spoken thought captured via microphone.";

        await createNote({
          title: `Voice Note - ${new Date().toLocaleTimeString()}`,
          content: finalContent,
          isVoice: true
        });
        
        // Refresh
        const data = await getNotes();
        setNotes(data as any);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      if (recognitionRef.current) recognitionRef.current.start();

      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone access denied. Please enable it in browser settings.");
      } else {
        setError("Microphone not found or access failed.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectNote = (note: any) => {
    setCurrentNote(note);
    router.push("/");
  };

  return (
    <div className="flex h-full min-w-0 bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10">
          <div className="relative w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search voice notes..." 
              className="w-full bg-white dark:bg-slate-800 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6">
            <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
            <Cloud className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 border border-border" />
          </div>
        </header>

        <div className="px-10 py-6">
          {/* Page Title & Record Button */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">Voice Gallery</h2>
              <p className="text-muted-foreground text-lg">Your spoken thoughts, captured and analyzed by AI.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              {isRecording ? (
                <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/10 px-6 py-3 rounded-2xl border border-red-200 animate-in fade-in zoom-in duration-300">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono text-xl font-bold text-red-600">{formatTime(recordingTime)}</span>
                  <button 
                    onClick={stopRecording}
                    className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-900/20"
                  >
                    <StopCircle className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-blue-900/20 group"
                >
                  <Mic className="w-8 h-8 group-hover:animate-pulse" />
                </button>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 dark:text-blue-400">
                {isRecording ? "Recording..." : "Record New"}
              </span>
              {isRecording && transcript && (
                <div className="absolute bottom-full mb-8 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/20 px-6 py-4 rounded-3xl shadow-2xl z-50 min-w-[320px] max-w-[400px] animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-blue-800 dark:text-blue-300 italic leading-relaxed text-center">
                    "{transcript}..."
                  </p>
                </div>
              )}
              {permissionStatus && (
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${
                  permissionStatus === 'granted' ? 'bg-green-50 text-green-600 border-green-100' :
                  permissionStatus === 'denied' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {permissionStatus}
                </span>
              )}
              {error && (
                <div className="absolute top-full mt-4 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/20 px-6 py-4 rounded-2xl shadow-xl z-50 min-w-[240px] animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold leading-snug">
                    {error}
                  </p>
                  {permissionStatus === 'denied' && (
                    <p className="text-[10px] text-muted-foreground mt-3 font-medium border-t border-red-50 dark:border-red-900/10 pt-3">
                      <span className="text-foreground font-bold">How to fix:</span> Click the lock icon 🔒 in your browser's address bar and set Microphone to "Allow".
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-10">
            <FilterPill label="All Notes" active />
            <FilterPill label="Meetings" />
            <FilterPill label="Ideation" />
            <FilterPill label="Personal" />
            <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="space-y-6 max-w-4xl">
            {isLoading && voiceNotes.length === 0 ? (
               <div className="text-center py-20">
                 <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-muted-foreground">Loading voice notes...</p>
               </div>
            ) : voiceNotes.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-border border-dashed">
                <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold">No voice notes yet</h3>
                <p className="text-muted-foreground">Record your first thought above.</p>
              </div>
            ) : (
              voiceNotes.map(note => (
                <VoiceCard 
                  key={note.id}
                  title={note.title} 
                  date={new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                  time={new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} 
                  duration="0:00" 
                  status={note.content.includes("Transcribing") ? "Processing..." : "Transcribed"}
                  takeaway={note.summary || "Summary pending..."}
                  isProcessing={note.content.includes("Transcribing")}
                  onClick={() => handleSelectNote(note)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Global Insights Sidebar */}
      <aside className="w-[340px] border-l border-border bg-white/50 dark:bg-transparent p-8 flex flex-col gap-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Global Insights</h3>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Weekly Summary</h4>
            <p className="text-sm leading-relaxed text-foreground font-medium">
              You've recorded {voiceNotes.length} notes this week.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Trending Tags</h3>
          <div className="flex flex-wrap gap-2">
            <TagPill label="#product" />
            <TagPill label="#roadmap" />
            <TagPill label="#ui-ux" />
            <TagPill label="#cognition" />
          </div>
        </div>

        <div className="relative group cursor-pointer overflow-hidden rounded-3xl h-[200px] bg-gradient-to-br from-slate-900 to-blue-900 p-8 flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-10 -mt-10" />
          <div className="z-10">
            <div className="flex items-center gap-2 mb-2 text-white/90">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-bold text-lg">Generate Map</h4>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Visualize connections and discover hidden patterns between your voice notes.
            </p>
          </div>
        </div>

        <button className="mt-auto w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-sm transition-all">
          <Download className="w-5 h-5" />
          Export All Audio
        </button>
      </aside>
    </div>
  );
}

function FilterPill({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
      active 
        ? "bg-[#1e1b4b] text-white shadow-lg" 
        : "bg-white dark:bg-slate-800 border border-border text-muted-foreground hover:bg-gray-50"
    }`}>
      {label}
    </button>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900/30">
      {label}
    </span>
  );
}

function VoiceCard({ title, date, time, duration, status, takeaway, isProcessing = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-border p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
            {isProcessing ? <Cloud className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">{title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mt-1">
              <span>{date}</span>
              <span>•</span>
              <span>{time}</span>
              <span>•</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isProcessing ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}>
          {status}
        </div>
      </div>

      {/* Waveform Placeholder */}
      <div className="h-20 bg-gray-50 dark:bg-slate-900/50 rounded-2xl mb-6 flex items-center justify-center px-8 gap-1 overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1 min-w-[2px] rounded-full bg-blue-300 dark:bg-blue-900/50 ${isProcessing ? 'animate-pulse' : ''}`} 
            style={{ height: `${Math.random() * 80 + 10}%` }} 
          />
        ))}
      </div>

      {/* Key Takeaway */}
      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-border border-dashed">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Key Takeaway</span>
        </div>
        {isProcessing ? (
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full animate-pulse" />
        ) : (
          <p className="font-mono text-sm leading-relaxed text-foreground/80">
            {takeaway}
          </p>
        )}
      </div>
    </div>
  );
}
