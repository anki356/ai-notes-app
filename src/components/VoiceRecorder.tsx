"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, X, Sparkles, Volume2 } from "lucide-react";
import { createNote, getNotes } from "@/lib/actions";
import { useAppStore } from "@/lib/store";

interface VoiceRecorderProps {
  onTranscriptComplete?: (transcript: string) => void;
  autoSave?: boolean;
  mode?: "floating" | "inline";
}

export default function VoiceRecorder({ onTranscriptComplete, autoSave = true, mode = "floating" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isOpen, setIsOpen] = useState(mode === "inline");
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const setNotes = useAppStore((state) => state.setNotes);

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

    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

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
        const finalContent = transcriptRef.current.trim() || "Spoken thought captured via recorder.";
        
        if (autoSave) {
          await createNote({
            title: `Voice Note - ${new Date().toLocaleTimeString()}`,
            content: finalContent,
            isVoice: true,
          });
          
          const updatedNotes = await getNotes();
          setNotes(updatedNotes as any);
        }

        if (onTranscriptComplete) {
          onTranscriptComplete(finalContent);
        }
        
        stream.getTracks().forEach((track) => track.stop());
        setIsOpen(false);
      };

      mediaRecorder.start();
      if (recognitionRef.current) recognitionRef.current.start();
      
      setIsRecording(true);
      setTime(0);
    } catch (err: any) {
      console.error("Mic access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone access denied. Please enable it in your browser settings.");
      } else {
        setError("Could not access microphone. Make sure it's connected.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen && mode === "floating") {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50 group"
      >
        <Mic className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={`
      ${mode === "floating" ? "fixed bottom-8 right-8 w-80" : "w-full"} 
      bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border p-6 z-50 
      ${mode === "floating" ? "animate-in slide-in-from-bottom-10" : "animate-in fade-in"} 
      duration-300
    `}>
      {mode === "floating" && (
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div className="flex flex-col items-center gap-6 mt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
            <Sparkles className="w-3 h-3" />
            <span>Quick Capture</span>
          </div>
          {permissionStatus && (
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
              permissionStatus === 'granted' ? 'bg-green-50 text-green-600 border-green-100' :
              permissionStatus === 'denied' ? 'bg-red-50 text-red-600 border-red-100' :
              'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {permissionStatus}
            </div>
          )}
        </div>

        <div className="relative">
          {isRecording && (
             <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150" />
          )}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${isRecording ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 dark:bg-slate-800 dark:border-slate-700'}`}>
            <Volume2 className={`w-8 h-8 ${isRecording ? 'text-red-500 animate-bounce' : 'text-muted-foreground opacity-20'}`} />
          </div>
        </div>

        <div className="text-center">
          <p className="text-3xl font-mono font-bold tracking-tighter">
            {formatTime(time)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isRecording ? "Listening to your thoughts..." : "Ready to record"}
          </p>
        </div>

        {isRecording && transcript && (
          <div className="w-full max-h-24 overflow-y-auto px-4 py-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
            <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 italic leading-relaxed">
              "{transcript}..."
            </p>
          </div>
        )}

        {error && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold text-center leading-tight">
              {error}
            </p>
            {permissionStatus === 'denied' && (
              <p className="text-[9px] text-red-500/80 text-center mt-2 font-medium">
                Tip: Click the lock icon 🔒 in the address bar to reset microphone permissions.
              </p>
            )}
          </div>
        )}

        {isRecording ? (
          <button 
            onClick={stopRecording}
            className="w-full bg-red-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
          >
            <StopCircle className="w-5 h-5" />
            <span>Finish Recording</span>
          </button>
        ) : (
          <button 
            onClick={startRecording}
            className="w-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        )}
      </div>
    </div>
  );
}
