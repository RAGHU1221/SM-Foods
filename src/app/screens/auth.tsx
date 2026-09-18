import React, { useState, useEffect } from "react";
import { Zap, RefreshCw, ArrowUpRight, Eye, EyeOff, Wifi, WifiOff } from "lucide-react";
import { GlassCard } from "../components/shared";
import type { Lang } from "../types";

export function SplashScreen({ onDone, t }: { onDone: () => void; t: (k: string) => string }) {
  const [step, setStep] = useState(0);
  const steps = ["Initializing ERP Engine...", "Loading item catalog...", "Syncing ledger & stock...", "Ready!"];

  useEffect(() => {
    const intervals = [600, 1100, 1700, 2300];
    const timers = intervals.map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    const done = setTimeout(onDone, 2700);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1a0505 0%, #3a0d0d 45%, #5c1414 100%)" }}>
      <div className="absolute w-72 h-72 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, #dc2626, transparent)", top: "8%", left: "8%" }} />
      <div className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #f59e0b, transparent)", bottom: "18%", right: "5%" }} />

      <div className="flex flex-col items-center gap-5 relative z-10">
        <div className="relative">
          <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.45), rgba(245,158,11,0.35))", backdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.2)" }}>
            <Zap size={52} color="white" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 rounded-[2rem] animate-ping opacity-20" style={{ background: "linear-gradient(135deg, #dc2626, #f59e0b)", animationDuration: "2s" }} />
        </div>
        <div className="text-center px-8">
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("appName")}</h1>
          <p className="text-orange-200/80 text-sm mt-1.5 font-medium tracking-wide">{t("appTag")}</p>
        </div>
      </div>

      <div className="absolute bottom-14 flex flex-col items-center gap-4 w-full px-12 z-10">
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%`, background: "linear-gradient(90deg, #f87171, #fbbf24)" }} />
        </div>
        <p className="text-orange-200/60 text-xs font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{steps[Math.min(step, steps.length - 1)]}</p>
      </div>
    </div>
  );
}

export function LoginScreen({ onLogin, t, lang }: { onLogin: () => void; t: (k: string) => string; lang?: Lang }) {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("smfoods@123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--background)" }}>
      <div className="h-48 relative overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, #5c1414 0%, #b91c1c 55%, #d97706 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fca5a5 0%, transparent 50%)" }} />
        <div className="flex flex-col items-center justify-center h-full gap-2 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)" }}>
            <Zap size={28} color="white" />
          </div>
          <h1 className="text-xl font-extrabold text-white text-center px-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("appName")}</h1>
          <p className="text-orange-100 text-xs">{t("appTag")}</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-sm mx-auto w-full">
        <GlassCard className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{t("username")}</label>
            <input value={user} onChange={e => setUser(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-2xl text-sm border outline-none focus:ring-2" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{t("password")}</label>
            <div className="relative mt-2">
              <input value={pass} type={showPass ? "text" : "password"} onChange={e => setPass(e.target.value)} className="w-full px-4 py-3 pr-11 rounded-2xl text-sm border outline-none focus:ring-2" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> {t("rememberMe")}
            </label>
            <button
              type="button"
              onClick={() => alert(lang === "ta" ? "இந்த டெமோ பயன்பாட்டில் கடவுச்சொல் மீட்பு இல்லை. Demo: admin / smfoods@123" : "Password reset isn't available in this demo. Use admin / smfoods@123.")}
              className="font-semibold"
              style={{ color: "var(--primary)" }}
            >{t("forgotPassword")}</button>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg"
            style={{ background: loading ? "#78716c" : "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}
          >
            {loading ? <><RefreshCw size={16} className="animate-spin" /> {t("signingIn")}</> : <>{t("signIn")} <ArrowUpRight size={16} /></>}
          </button>
        </GlassCard>

        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-1.5">
            {online ? <Wifi size={13} className="text-emerald-500" /> : <WifiOff size={13} className="text-red-500" />}
            {online ? t("online") : t("offline")}
          </span>
          <span>{t("version")} 2.4.0</span>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
          Demo: <span style={{ color: "var(--primary)", fontFamily: "'JetBrains Mono', monospace" }}>admin / smfoods@123</span>
        </p>
      </div>
    </div>
  );
}
