"use client";

import { useEffect, useState } from "react";
import { getGraphData } from "@/lib/actions";
import dynamic from "next/dynamic";
import { Menu, Network } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

// Dynamically import the graph library because it uses canvas/window which breaks SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getGraphData();
        setGraphData(data as any);
      } catch (error) {
        console.error("Failed to load graph data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNodeClick = (node: any) => {
    // Navigate to editor and set this note active? Or navigate to library?
    // Let's just navigate to home (editor) where it might load it if we set currentNote.
    // For now we'll just push to home. 
    // Ideally we should do: setCurrentNote({ id: node.id, ... })
    // We'll import useAppStore and set current note. Wait, we don't have the full note here.
    // Just navigating to / is okay for prototype, or we fetch note by ID and set it.
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Header */}
      <header className="h-14 sm:h-20 flex items-center justify-between px-6 sm:px-10 border-b border-border bg-white/50 dark:bg-[#0F172A]/80 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Menu 
            onClick={() => setIsSidebarOpen(true)} 
            className="w-6 h-6 text-muted-foreground cursor-pointer lg:hidden hover:text-foreground shrink-0" 
          />
          <Network className="w-6 h-6 text-blue-500 hidden sm:block" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Knowledge Graph</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-xs sm:text-sm font-medium">
            {isLoading ? "Analyzing Semantic Links..." : `${graphData.nodes.length} Nodes / ${graphData.links.length} AI Links`}
          </span>
        </div>
      </header>

      {/* Graph Area */}
      <main className="flex-1 relative overflow-hidden bg-[#0F172A]">
        {isLoading ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
             <p>Generating Semantic AI Network...</p>
           </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
             <Network className="w-16 h-16 opacity-20 mb-4" />
             <h3 className="text-xl font-bold mb-2">Network is Empty</h3>
             <p>Add some notes to build your AI knowledge graph.</p>
           </div>
        ) : (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => node.group === 2 ? '#f59e0b' : '#3b82f6'}
            nodeRelSize={8}
            linkColor={() => 'rgba(148, 163, 184, 0.2)'}
            linkWidth={(link: any) => Math.max(1, (link.value - 0.75) * 20)}
            onNodeClick={handleNodeClick}
            backgroundColor="#0F172A"
            enableNodeDrag={true}
            enableZoomInteraction={true}
          />
        )}
      </main>
    </div>
  );
}
