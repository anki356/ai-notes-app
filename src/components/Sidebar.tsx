"use client";

import { Plus, LayoutGrid, Library, Sparkles, Mic, Settings, HelpCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { getSession, logout } from "@/lib/auth-actions";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setUserEmail(session.email);
      }
    });
  }, []);

  const handleNewNote = () => {
    router.push("/new");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col p-6
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cognition</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-1">Personal AI Workspace</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
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

        <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-white">{userEmail || "Guest User"}</div>
              <div className="text-[10px] text-slate-400 truncate">Free Plan</div>
            </div>
          </div>
          {userEmail && (
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
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
