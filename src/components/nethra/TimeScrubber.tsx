import { useEffect, useRef, useState } from "react";
import { Play, Pause, FastForward, Rewind } from "lucide-react";
import { formatHourOfWeek, DAY_LABEL } from "@/lib/timefield";

export function TimeScrubber({
  hourOfWeek,
  onChange,
  speedMs = 250,
}: {
  hourOfWeek: number;
  onChange: (h: number) => void;
  speedMs?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(speedMs);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = window.setInterval(() => {
      onChange((hourOfWeek + 1) % 168);
    }, speed);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [playing, speed, hourOfWeek, onChange]);

  return (
    <div className="rounded-lg border border-border bg-panel/90 backdrop-blur p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="size-8 rounded-md bg-primary/20 border border-primary/40 text-primary grid place-items-center hover:bg-primary/30 transition"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={() => onChange((hourOfWeek + 167) % 168)}
            className="size-7 rounded-md border border-border text-muted-foreground grid place-items-center hover:text-foreground"
            aria-label="Step back"
          >
            <Rewind className="size-3" />
          </button>
          <button
            onClick={() => onChange((hourOfWeek + 1) % 168)}
            className="size-7 rounded-md border border-border text-muted-foreground grid place-items-center hover:text-foreground"
            aria-label="Step forward"
          >
            <FastForward className="size-3" />
          </button>
          <div className="ml-2 font-mono text-xs">
            <span className="text-muted-foreground">REPLAY</span>{" "}
            <span className="text-primary font-semibold">{formatHourOfWeek(hourOfWeek)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {[500, 250, 100].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded border ${speed === s ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s === 500 ? "1×" : s === 250 ? "2×" : "5×"}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={167}
          step={1}
          value={hourOfWeek}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full nethra-range"
          aria-label="Hour of week"
        />
        <div className="flex justify-between px-0.5 mt-1 text-[9px] font-mono text-muted-foreground select-none">
          {DAY_LABEL.map((d, i) => (
            <button
              key={d}
              onClick={() => onChange(i * 24 + 9)}
              className={`hover:text-foreground transition ${Math.floor(hourOfWeek / 24) === i ? "text-primary" : ""}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
