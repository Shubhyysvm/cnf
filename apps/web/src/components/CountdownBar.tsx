"use client";
import { useEffect, useState } from "react";
import Container from "./Container";

function getSecondsToMidnight() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

export default function CountdownBar() {
  // Defer dynamic time until after mount to avoid hydration mismatch.
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    setRemaining(getSecondsToMidnight());
    const id = setInterval(() => setRemaining(getSecondsToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = remaining !== null ? String(Math.floor(remaining / 3600)).padStart(2, "0") : "--";
  const minutes = remaining !== null ? String(Math.floor((remaining % 3600) / 60)).padStart(2, "0") : "--";
  const seconds = remaining !== null ? String(remaining % 60).padStart(2, "0") : "--";
  const pct = remaining !== null ? Math.max(5, 100 - (remaining / (24 * 3600)) * 100) : 5;

  return (
    <div className="bg-black text-white text-sm">
      <Container className="py-2 flex items-center gap-3">
        <div className="flex-1">
          Free shipping ends today — order in <span className="font-semibold">{hours}:{minutes}:{seconds}</span>
        </div>
        <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden" aria-hidden="true">
          <div className="h-full bg-accent-carrot transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Container>
    </div>
  );
}
