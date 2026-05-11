import { create } from "zustand";

interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  isVoice: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AppState {
  currentNote: Note | null;
  notes: Note[];
  isLoading: boolean;
  isSidebarOpen: boolean;

  setCurrentNote: (note: Note | null) => void;
  setNotes: (notes: Note[]) => void;
  setIsLoading: (loading: boolean) => void;

  updateCurrentNoteContent: (content: string) => void;
  updateCurrentNoteTitle: (title: string) => void;
  updateCurrentNoteSummary: (summary: string) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentNote: null,
  notes: [],
  isLoading: false,
  isSidebarOpen: false,

  setCurrentNote: (note) => set({ currentNote: note }),
  setNotes: (notes) => set({ notes }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  updateCurrentNoteContent: (content) => set((state) => ({
    currentNote: state.currentNote ? { ...state.currentNote, content } : null
  })),
  updateCurrentNoteTitle: (title) => set((state) => ({
    currentNote: state.currentNote ? { ...state.currentNote, title } : null
  })),
  updateCurrentNoteSummary: (summary) => set((state) => ({
    currentNote: state.currentNote ? { ...state.currentNote, summary } : null
  })),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
