import { useEffect, useState } from "react";

function getRemainingToday() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const diff = Math.max(0, endOfDay.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const milliseconds = Math.floor(diff % 1000);

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    msFull: String(milliseconds).padStart(3, "0"),
    isUrgent: hours === 0 && minutes < 30,
  };
}

export default function EverySecondCountsClock() {
  const [timeLeft, setTimeLeft] = useState(getRemainingToday);

  useEffect(() => {
    let animationFrameId;
    const tick = () => {
      setTimeLeft(getRemainingToday());
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mb-5 sm:mb-6 select-none">
      <div className="relative rounded-xl bg-[#04060a] border-[3px] border-slate-800/95 px-4 py-3.5 sm:px-6 sm:py-4 shadow-[0_14px_32px_rgba(0,0,0,0.75),inset_0_0_24px_rgba(0,0,0,0.95)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent" />
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono tracking-[0.22em] text-slate-500 uppercase mb-1">
          <span>SISA WAKTU HARI INI</span>
          <span className={timeLeft.isUrgent ? "text-rose-400 animate-pulse" : "text-sky-400/70"}>{timeLeft.isUrgent ? "FINAL SPRINT" : "LIVE COUNTDOWN"}</span>
        </div>

        <div
          style={{ fontFamily: "'Orbitron', monospace" }}
          className={`flex items-baseline justify-center tracking-wider tabular-nums ${timeLeft.isUrgent ? "text-rose-400 drop-shadow-[0_0_14px_rgba(244,63,94,0.85)]" : "text-[#38bdf8] drop-shadow-[0_0_14px_rgba(56,189,248,0.85)]"}`}
        >
          <span className="text-2xl sm:text-4xl font-black">{timeLeft.hours}</span>
          <span className="text-xl sm:text-3xl font-bold mx-1 opacity-90 animate-pulse">:</span>
          <span className="text-2xl sm:text-4xl font-black">{timeLeft.minutes}</span>
          <span className="text-xl sm:text-3xl font-bold mx-1 opacity-90 animate-pulse">:</span>
          <span className="text-2xl sm:text-4xl font-black">{timeLeft.seconds}</span>
          <span className="text-sm sm:text-xl font-bold ml-1.5 opacity-85">.{timeLeft.msFull}</span>
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-gradient-to-b from-[#0a1e5e] via-[#071547] to-[#040d2e] border border-blue-400/30 py-2 px-4 text-center shadow-[0_8px_20px_rgba(3,10,36,0.7),inset_0_1px_0_rgba(255,255,255,0.18)]">
        <p className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-slate-100 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">EVERY SECOND COUNTS</p>
      </div>
    </div>
  );
}
