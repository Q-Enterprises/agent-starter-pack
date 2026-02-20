import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Mail, Github, Chrome, UserPlus, LogIn } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("All fields required"); return; }
    toast.success(isLogin ? "Welcome back!" : "Account created!");
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <div className="w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(19,232,210,0.1)]">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-primary/20 rounded-xl mx-auto flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(19,232,210,0.3)] animate-pulse-glow">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white neon-glow">
              MCP Avatar Forge
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure token management & avatar generation
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dim text-background font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-background/50 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-background/50 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
              <Chrome className="w-4 h-4 text-rose-500" /> Google
            </button>
          </div>

          {/* Toggle */}
          <div className="mt-8 text-center text-sm">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-primary hover:underline hover:text-primary-dim transition-colors"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
