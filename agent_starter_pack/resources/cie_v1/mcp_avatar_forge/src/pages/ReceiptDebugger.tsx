import { useState } from "react";
import { ShieldCheck, FileJson, Hash, AlertOctagon, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReceiptDebugger() {
  const [receipt, setReceipt] = useState('{\n  "action": "generate_avatar",\n  "timestamp": "2024-03-15T10:00:00Z",\n  "cost": 0.05\n}');
  const [expectedHash, setExpectedHash] = useState('');
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [computedHash, setComputedHash] = useState('');

  const canonicalize = (obj: any): string => {
    // Simple recursive key sorting for demo purposes (RFC8785-lite)
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(canonicalize).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
  };

  const handleVerify = async () => {
    try {
      const parsed = JSON.parse(receipt);
      const canonical = canonicalize(parsed);
      const encoder = new TextEncoder();
      const data = encoder.encode(canonical);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setComputedHash(hashHex);

      if (expectedHash && hashHex === expectedHash.trim()) {
        setResult('pass');
        toast.success("Integrity Verified", { description: "Receipt matches canonical hash." });
      } else if (expectedHash) {
        setResult('fail');
        toast.error("Integrity Failure", { description: "Hash mismatch! Possible tampering detected." });
      } else {
        setResult(null);
        toast.info("Hash Computed", { description: "Enter an expected hash to verify." });
      }
    } catch (e) {
      toast.error("Invalid JSON", { description: "Please ensure the receipt is valid JSON." });
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Receipt Debugger
          </h1>
          <p className="text-muted-foreground mt-2">
            Cryptographic verification tool for token receipts and gate hashes.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Receipt Surface
            </h3>

            <textarea
              className="w-full h-64 bg-background/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-primary/80 focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="Paste JSON receipt here..."
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="w-4 h-4" /> Expected Gate Hash
              </label>
              <input
                type="text"
                className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., a1b2c3d4..."
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full bg-primary hover:bg-primary-dim text-background font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Run Verification
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          <div className={cn(
            "h-full bg-card/40 backdrop-blur-xl border rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500",
            result === 'pass' ? "border-green-500/50 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]" :
            result === 'fail' ? "border-red-500/50 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]" :
            "border-primary/20"
          )}>
            {result === 'pass' && (
              <div className="space-y-4 animate-scale-in">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border-2 border-green-500 animate-pulse-slow">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-500">INTEGRITY VERIFIED</h2>
                  <p className="text-muted-foreground mt-2">The receipt matches the canonical hash signature.</p>
                </div>
              </div>
            )}

            {result === 'fail' && (
              <div className="space-y-4 animate-shake">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto border-2 border-red-500">
                  <AlertOctagon className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-500">SYSTEM HALT</h2>
                  <p className="text-muted-foreground mt-2">Hash mismatch detected. Fail-closed protocol activated.</p>
                </div>
              </div>
            )}

            {!result && computedHash && (
              <div className="space-y-4 animate-fade-in">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/30">
                  <Hash className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Computed Hash</h2>
                  <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10 break-all font-mono text-xs text-primary/80">
                    {computedHash}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Enter an expected hash to verify integrity.
                  </p>
                </div>
              </div>
            )}

            {!result && !computedHash && (
              <div className="text-muted-foreground">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Ready to verify receipt integrity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
