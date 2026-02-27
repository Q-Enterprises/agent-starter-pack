import { useState } from "react";
import { Gauge, Calculator, Check, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SimulationScenario {
  id: string;
  name: string;
  tokens: number;
  cost: number;
  risk: "low" | "medium" | "high";
}

const SCENARIOS: SimulationScenario[] = [
  { id: "s1", name: "Standard RAG Query", tokens: 450, cost: 0.02, risk: "low" },
  { id: "s2", name: "Deep Reasoning Chain", tokens: 2843, cost: 0.14, risk: "medium" },
  { id: "s3", name: "Full Context Analysis", tokens: 12500, cost: 0.62, risk: "high" },
];

export default function PolicySimulator() {
  const [budget] = useState(5000);
  const [usage] = useState(2150);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);

  const projectedUsage = usage + (selectedScenario?.tokens || 0);
  const isOverBudget = projectedUsage > budget;

  const handleSimulate = () => {
    if (!selectedScenario) return;

    if (isOverBudget) {
      toast.error("Budget Exceeded", {
        description: `Projected usage ${projectedUsage} exceeds limit ${budget}. Simulation halted.`,
      });
      return;
    }

    toast.success("Simulation Approved", {
      description: `Action within policy bounds. Cost: $${selectedScenario.cost}`,
    });
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Gauge className="w-8 h-8 text-primary" />
            Policy Simulator
          </h1>
          <p className="text-muted-foreground mt-2">
            Test "What-if" scenarios against governance constraints before execution.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Spend Meter */}
        <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Token Spend Meter
            </h3>
            <span className="text-xs font-mono text-muted-foreground">Cycle: 2024-Q1</span>
          </div>

          <div className="relative pt-4">
            <div className="flex justify-between text-sm mb-2 font-mono">
              <span className={cn(isOverBudget ? "text-warning" : "text-primary")}>
                {projectedUsage.toLocaleString()} tokens
              </span>
              <span className="text-muted-foreground">/ {budget.toLocaleString()} limit</span>
            </div>

            <div className="h-4 bg-secondary rounded-full overflow-hidden relative">
              {/* Current Usage */}
              <div
                className="absolute top-0 left-0 h-full bg-primary/50 transition-all duration-500"
                style={{ width: `${Math.min((usage / budget) * 100, 100)}%` }}
              />
              {/* Projected Usage */}
              {selectedScenario && (
                <div
                  className={cn(
                    "absolute top-0 h-full transition-all duration-500 border-l border-white/20",
                    isOverBudget ? "bg-warning repeating-linear-gradient-warning" : "bg-primary"
                  )}
                  style={{
                    left: `${Math.min((usage / budget) * 100, 100)}%`,
                    width: `${Math.min((selectedScenario.tokens / budget) * 100, 100 - (usage / budget) * 100)}%`
                  }}
                />
              )}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-background/30 p-4 rounded-lg border border-white/5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Cost</div>
              <div className="text-xl font-mono text-white mt-1">$0.11</div>
            </div>
            <div className="bg-background/30 p-4 rounded-lg border border-white/5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Projected Cost</div>
              <div className={cn("text-xl font-mono mt-1", isOverBudget ? "text-warning" : "text-primary")}>
                ${(0.11 + (selectedScenario?.cost || 0)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Simulation Console
          </h3>

          <div className="space-y-3">
            {SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left group",
                  selectedScenario?.id === scenario.id
                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(19,232,210,0.1)]"
                    : "bg-background/50 border-white/10 hover:border-primary/50"
                )}
              >
                <div>
                  <div className="font-medium text-white group-hover:text-primary transition-colors">
                    {scenario.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {scenario.tokens.toLocaleString()} tokens · ${scenario.cost}
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[10px] uppercase font-bold border",
                  scenario.risk === 'low' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  scenario.risk === 'medium' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                  "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {scenario.risk} Risk
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Policy Check Result:</span>
              <span className={cn(
                "font-mono font-bold flex items-center gap-2",
                !selectedScenario ? "text-muted-foreground" :
                isOverBudget ? "text-warning" : "text-green-500"
              )}>
                {!selectedScenario ? "WAITING..." :
                 isOverBudget ? (
                   <><AlertTriangle className="w-4 h-4" /> REJECTED</>
                 ) : (
                   <><Check className="w-4 h-4" /> APPROVED</>
                 )}
              </span>
            </div>

            <button
              onClick={handleSimulate}
              disabled={!selectedScenario}
              className={cn(
                "w-full font-bold py-3 rounded-lg shadow-lg transition-all",
                !selectedScenario ? "bg-secondary text-muted-foreground cursor-not-allowed" :
                isOverBudget ? "bg-warning/20 text-warning border border-warning/50 hover:bg-warning/30" :
                "bg-primary hover:bg-primary-dim text-background hover:shadow-primary/25 active:scale-[0.99]"
              )}
            >
              {isOverBudget ? "Analyze Violation" : "Run Simulation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
