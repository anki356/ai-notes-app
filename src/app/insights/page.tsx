import { Brain, TrendingUp, Network, Zap, Calendar, ArrowUpRight, Sparkles } from "lucide-react";

export default function Insights() {
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0F172A] overflow-y-auto">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-10 border-b border-border flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">AI Insights</h2>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 cursor-pointer hover:bg-blue-700 transition-all">
          <Zap className="w-4 h-4 fill-current" />
          <span>Refresh Audit</span>
        </div>
      </header>

      <main className="p-10 space-y-10">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            title="Knowledge Connections" 
            value="142" 
            subValue="+12 this week" 
            icon={<Network className="w-6 h-6 text-blue-500" />} 
          />
          <StatCard 
            title="Memory Retention" 
            value="84%" 
            subValue="Based on revisit frequency" 
            icon={<Brain className="w-6 h-6 text-purple-500" />} 
          />
          <StatCard 
            title="AI Efficiency" 
            value="2.4h" 
            subValue="Time saved by summaries" 
            icon={<Sparkles className="w-6 h-6 text-amber-500" />} 
          />
        </div>

        {/* Knowledge Graph Placeholder */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Semantic Map</h3>
            <div className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">Explore 3D Graph</div>
          </div>
          <div className="h-[400px] bg-white dark:bg-slate-800 rounded-[32px] border border-border relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
            <div className="z-10 text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Network className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold mb-2">Visualizing Knowledge...</h4>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Cognition is mapping the relationships between your 1,240 semantic tokens.
              </p>
            </div>
            {/* Decorative Nodes */}
            <div className="absolute top-20 left-1/4 w-3 h-3 bg-blue-400 rounded-full blur-sm animate-pulse" />
            <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-purple-400 rounded-full blur-sm animate-pulse delay-700" />
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-amber-400 rounded-full blur-sm animate-pulse delay-300" />
          </div>
        </section>

        {/* Global Trends & Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section>
            <h3 className="text-lg font-bold mb-6">Recent Trends</h3>
            <div className="space-y-4">
              <TrendItem label="Artificial Intelligence" weight={85} count="42 notes" />
              <TrendItem label="User Privacy" weight={62} count="18 notes" />
              <TrendItem label="Product Strategy" weight={45} count="12 notes" />
              <TrendItem label="Edge Computing" weight={38} count="9 notes" />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-6">Critical Summaries</h3>
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="w-5 h-5 text-blue-600/20" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <Brain className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm">Collective Theme: Privacy-First AI</h4>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 mb-6">
                Your recent research heavily emphasizes the convergence of edge computing and differential privacy. There's a recurring pattern suggesting that local-first data processing is the primary bottleneck for wide-scale private LLM deployment.
              </p>
              <div className="flex items-center justify-between text-xs pt-6 border-t border-border">
                <span className="text-muted-foreground">Generated from 12 related notes</span>
                <span className="text-blue-600 font-bold cursor-pointer hover:underline">Read Analysis</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, subValue, icon }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center">
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm font-bold text-foreground mb-1">{title}</div>
      <div className="text-[11px] text-muted-foreground font-medium">{subValue}</div>
    </div>
  );
}

function TrendItem({ label, weight, count }: any) {
  return (
    <div className="flex items-center gap-6 group cursor-pointer">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold group-hover:text-blue-600 transition-colors">{label}</span>
          <span className="text-xs text-muted-foreground">{count}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all group-hover:scale-x-105 origin-left" 
            style={{ width: `${weight}%` }} 
          />
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600" />
    </div>
  );
}
