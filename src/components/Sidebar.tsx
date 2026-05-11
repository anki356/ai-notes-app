"use client";

import { Plus, LayoutGrid, Library, Sparkles, Mic, Settings, HelpCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createNote } from "@/lib/actions";
import { useAppStore } from "@/lib/store";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleNewNote = () => {
    router.push("/new");
  };

  return (
    <aside className="w-[280px] bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col p-6">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Cognition</h1>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-1">Personal AI Workspace</p>
      </div>

      {/* New Note Button */}
      <button 
        onClick={handleNewNote}
        className="w-full bg-[#334155] hover:bg-[#1E293B] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 mb-10 transition-all font-semibold shadow-lg shadow-slate-200 dark:shadow-none"
      >
        <Plus className="w-5 h-5" />
        <span>New Note</span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <NavItem 
          href="/" 
          icon={<LayoutGrid className="w-5 h-5" />} 
          label="Editor" 
          active={pathname === "/"} 
        />
        <NavItem 
          href="/library" 
          icon={<Library className="w-5 h-5" />} 
          label="Library" 
          active={pathname === "/library"} 
        />
        <NavItem 
          href="/insights" 
          icon={<Sparkles className="w-5 h-5" />} 
          label="Insights" 
          active={pathname === "/insights"} 
        />
        <NavItem 
          href="/voice-gallery" 
          icon={<Mic className="w-5 h-5" />} 
          label="Voice Gallery" 
          active={pathname === "/voice-gallery"} 
        />
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-4 pt-6 border-t border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Help</span>
          </div>
        </div>

        <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate text-white">User Profile</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
        active 
          ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
      }`}>
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </Link>
  );
}
