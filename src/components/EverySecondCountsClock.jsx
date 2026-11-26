import { memo, useEffect, useState } from "react";

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

const SEGMENTS = [
  "14,6 46,6 50,10 45,14 15,14 10,10",
  "51,12 55,16 55,46 51,50 47,46 47,16",
  "51,54 55,58 55,88 51,92 47,88 47,58",
  "15,90 45,90 50,94 46,98 14,98 10,94",
  "9,54 13,58 13,88 9,92 5,88 5,58",
  "9,12 13,16 13,46 9,50 5,46 5,16",
  "14,48 46,48 50,52 46,56 14,56 10,52",
];

// Memoized: Jam & Menit tidak akan dirender ulang saat milidetik berjalan
const SevenSegmentDigit = memo(function SevenSegmentDigit({ value, className }) {
  const activeSegments = DIGIT_MAP[value] || [0, 0, 0, 0, 0, 0, 0];

  return (
    <svg viewBox="0 0 60 104" className={`${className} w-auto shrink-0`} aria-hidden="true">
      {SEGMENTS.map((points, idx) => {
        const isLit = activeSegments[idx] === 1;
        return <polygon key={idx} points={points} fill={isLit ? "#7dd3fc" : "#111620"} stroke={isLit ? "#e0f2fe" : "none"} strokeWidth={isLit ? "1.1" : "0"} />;
      })}
    </svg>
  );
});

const ColonSeparator = memo(function ColonSeparator({ className }) {
  return (
    <svg viewBox="0 0 20 104" className={`${className} w-auto shrink-0 mx-0.5 sm:mx-1.5`} aria-hidden="true">
      <circle cx="10" cy="34" r="3.8" fill="#7dd3fc" />
      <circle cx="10" cy="70" r="3.8" fill="#7dd3fc" />
    </svg>
  );
});

const DecimalDot = memo(function DecimalDot({ className }) {
  return (
    <svg viewBox="0 0 18 104" className={`${className} w-auto shrink-0 mx-0.5 sm:mx-1`} aria-hidden="true">
      <circle cx="9" cy="92" r="4" fill="#7dd3fc" />
    </svg>
  );
});

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
    // 80ms (~12.5fps) sangat ringan di CPU/GPU HP namun milidetik tetap terlihat berjalan cepat
    const timer = setInterval(() => {
      setTimeLeft(getRemainingToday());
    }, 80);

    return () => clearInterval(timer);
  }, []);

  const mainDigitSize = "h-10 sm:h-16 md:h-[76px]";
  const msDigitSize = "h-7 sm:h-11 md:h-[52px]";

  return (
    <section aria-label="Every Second Counts Countdown" className="w-full mb-5 sm:mb-6 select-none">
      <div className="w-full rounded-xl bg-[#05070b] border-[4px] sm:border-[6px] border-[#0c1017] px-3 py-4 sm:px-6 sm:py-6 shadow-xl flex items-baseline justify-center">
        <div className="flex items-baseline justify-center gap-1 sm:gap-2">
          <SevenSegmentDigit value={timeLeft.hours[0]} className={mainDigitSize} />
          <SevenSegmentDigit value={timeLeft.hours[1]} className={mainDigitSize} />

          <ColonSeparator className={mainDigitSize} />

          <SevenSegmentDigit value={timeLeft.minutes[0]} className={mainDigitSize} />
          <SevenSegmentDigit value={timeLeft.minutes[1]} className={mainDigitSize} />

          <ColonSeparator className={mainDigitSize} />

          <SevenSegmentDigit value={timeLeft.seconds[0]} className={mainDigitSize} />
          <SevenSegmentDigit value={timeLeft.seconds[1]} className={mainDigitSize} />

          <DecimalDot className={mainDigitSize} />

          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <SevenSegmentDigit value={timeLeft.ms[0]} className={msDigitSize} />
            <SevenSegmentDigit value={timeLeft.ms[1]} className={msDigitSize} />
            <SevenSegmentDigit value={timeLeft.ms[2]} className={msDigitSize} />
          </div>
        </div>
      </div>

      <div className="w-full mt-2.5 sm:mt-3 rounded-lg bg-gradient-to-b from-[#0e2772] via-[#08184d] to-[#040d2e] border border-[#2848a8]/45 py-2.5 sm:py-3.5 px-4 text-center shadow-lg">
        <p className="font-sans text-xs sm:text-base md:text-lg font-medium tracking-[0.26em] sm:tracking-[0.3em] text-slate-100 uppercase">EVERY SECOND COUNTS</p>
      </div>
    </section>
  );
}
