import { useEffect, useState } from "react";

// Peta segmen aktif untuk angka 0-9 (urutan: a=atas, b=kanan-atas, c=kanan-bawah, d=bawah, e=kiri-bawah, f=kiri-atas, g=tengah)
const DIGIT_MAP = {
  0: [1, 1, 1, 1, 1, 1, 0],
  1: [0, 1, 1, 0, 0, 0, 0],
  2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1],
  4: [0, 1, 1, 0, 0, 1, 1],
  5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 0, 0],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
};

// Poligon 7 segmen beveled ala jam LED dinding The Bear
const SEGMENTS = [
  "14,6 46,6 50,10 45,14 15,14 10,10", // a (atas)
  "51,12 55,16 55,46 51,50 47,46 47,16", // b (kanan atas)
  "51,54 55,58 55,88 51,92 47,88 47,58", // c (kanan bawah)
  "15,90 45,90 50,94 46,98 14,98 10,94", // d (bawah)
  "9,54 13,58 13,88 9,92 5,88 5,58", // e (kiri bawah)
  "9,12 13,16 13,46 9,50 5,46 5,16", // f (kiri atas)
  "14,48 46,48 50,52 46,56 14,56 10,52", // g (tengah)
];

function SevenSegmentDigit({ value, className = "h-11 sm:h-16 md:h-20" }) {
  const activeSegments = DIGIT_MAP[value] || [0, 0, 0, 0, 0, 0, 0];

  return (
    <svg viewBox="0 0 60 104" className={`${className} w-auto shrink-0 overflow-visible`} aria-hidden="true">
      <defs>
        <filter id="led-cyan-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {SEGMENTS.map((points, idx) => {
        const isLit = activeSegments[idx] === 1;
        return <polygon key={idx} points={points} fill={isLit ? "#e0fcff" : "#121721"} stroke={isLit ? "#38bdf8" : "none"} strokeWidth={isLit ? "0.8" : "0"} filter={isLit ? "url(#led-cyan-glow)" : undefined} />;
      })}
    </svg>
  );
}

function ColonSeparator({ className = "h-11 sm:h-16 md:h-20" }) {
  return (
    <svg viewBox="0 0 20 104" className={`${className} w-auto shrink-0 mx-0.5 sm:mx-1.5 overflow-visible`} aria-hidden="true">
      <circle cx="10" cy="34" r="3.6" fill="#e0fcff" filter="url(#led-cyan-glow)" />
      <circle cx="10" cy="70" r="3.6" fill="#e0fcff" filter="url(#led-cyan-glow)" />
    </svg>
  );
}

function DecimalDot({ className = "h-11 sm:h-16 md:h-20" }) {
  return (
    <svg viewBox="0 0 18 104" className={`${className} w-auto shrink-0 mx-0.5 sm:mx-1 overflow-visible`} aria-hidden="true">
      <circle cx="9" cy="92" r="4" fill="#e0fcff" filter="url(#led-cyan-glow)" />
    </svg>
  );
}

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
    ms: String(milliseconds).padStart(3, "0"),
  };
}

export default function EverySecondCountsClock() {
  const [timeLeft, setTimeLeft] = useState(getRemainingToday);

  useEffect(() => {
    // Interval 50ms (~20fps) agar milidetik terbaca jelas dan stabil tanpa getaran berlebihan
    const timer = setInterval(() => {
      setTimeLeft(getRemainingToday());
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const mainDigitSize = "h-10 xs:h-12 sm:h-16 md:h-[76px]";
  const msDigitSize = "h-7 xs:h-8 sm:h-11 md:h-[52px]";

  return (
    <section aria-label="Every Second Counts Countdown" className="w-full mb-5 sm:mb-6 select-none">
      {/* Bingkai Hitam Jam Digital LED (Persis Referensi The Bear) */}
      <div className="w-full rounded-xl bg-[#05070b] border-[4px] sm:border-[6px] border-[#0c1017] px-3 py-4 sm:px-6 sm:py-6 shadow-[0_14px_30px_rgba(0,0,0,0.75),inset_0_2px_16px_rgba(0,0,0,0.95)] flex items-baseline justify-center">
        <div className="flex items-baseline justify-center gap-1 sm:gap-2">
          {/* JAM */}
          <SevenSegmentDigit value={timeLeft.hours[0]} className={mainDigitSize} />
          <SevenSegmentDigit value={timeLeft.hours[1]} className={mainDigitSize} />

          <ColonSeparator className={mainDigitSize} />

          {/* MENIT */}
          <SevenSegmentDigit value={timeLeft.minutes[0]} className={mainDigitSize} />
          <SevenSegmentDigit value={timeLeft.minutes[1]} className={mainDigitSize} />

          <ColonSeparator className={mainDigitSize} />

          {/* DETIK */}
          <SevenSegmentDigit value={timeLeft.seconds[0]} className={mainDigitSize} />
          <SevenSegmentDigit value={timeLeft.seconds[1]} className={mainDigitSize} />

          <DecimalDot className={mainDigitSize} />

          {/* MILIDETIK (Lebih kecil & sejajar garis bawah seperti gambar) */}
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <SevenSegmentDigit value={timeLeft.ms[0]} className={msDigitSize} />
            <SevenSegmentDigit value={timeLeft.ms[1]} className={msDigitSize} />
            <SevenSegmentDigit value={timeLeft.ms[2]} className={msDigitSize} />
          </div>
        </div>
      </div>

      {/* Plakat Biru Tua Mengilap "EVERY SECOND COUNTS" */}
      <div className="w-full mt-2.5 sm:mt-3 rounded-lg bg-gradient-to-b from-[#0e2772] via-[#08184d] to-[#040d2e] border border-[#2848a8]/45 py-2.5 sm:py-3.5 px-4 text-center shadow-[0_10px_22px_rgba(3,9,32,0.75),inset_0_1px_0_rgba(255,255,255,0.22)]">
        <p className="font-sans text-xs sm:text-base md:text-lg font-medium tracking-[0.26em] sm:tracking-[0.3em] text-slate-100 uppercase">EVERY SECOND COUNTS</p>
      </div>
    </section>
  );
}
