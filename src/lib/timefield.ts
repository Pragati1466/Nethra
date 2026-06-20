// Time-of-week intensity model. Real historical counts are sparse per (hex,hour);
// we blend them with a Bengaluru-style commute curve so the scrubber feels alive
// while staying anchored to the dataset.
//
// hourOfWeek: 0..167 (0 = Sunday 00:00 UTC). UI converts to IST for display.

const COMMUTE_AM = [
  0.25, 0.20, 0.18, 0.18, 0.22, 0.35, 0.55, 0.85,
  1.20, 1.45, 1.30, 1.05, 0.95, 0.95, 1.00, 1.10,
  1.35, 1.70, 1.95, 1.75, 1.40, 1.05, 0.70, 0.45,
]; // 24 multipliers, weekday baseline

const WEEKEND = [
  0.30, 0.25, 0.22, 0.20, 0.20, 0.22, 0.28, 0.40,
  0.60, 0.85, 1.00, 1.10, 1.15, 1.20, 1.25, 1.30,
  1.35, 1.40, 1.45, 1.35, 1.15, 0.95, 0.70, 0.45,
];

export function timeMultiplier(hourOfWeek: number): number {
  const dow = Math.floor(hourOfWeek / 24) % 7;
  const hr = hourOfWeek % 24;
  const curve = dow === 0 || dow === 6 ? WEEKEND : COMMUTE_AM;
  return curve[hr];
}

// Smoothed real intensity for a cell at a given hour using a ±1h Gaussian window.
export function smoothedHourly(hourly: number[], hourOfWeek: number): number {
  const idx = ((hourOfWeek % 168) + 168) % 168;
  const w = [0.15, 0.7, 0.15];
  let s = 0;
  for (let k = -1; k <= 1; k++) {
    const i = ((idx + k) % 168 + 168) % 168;
    s += hourly[i] * w[k + 1];
  }
  return s;
}

// Final intensity 0..1 for rendering. The normalizer is tuned so that median-mass
// hexes light up around peak commute, and the busiest hex pegs near 1.0.
export function cellIntensity(
  hourly: number[],
  total: number,
  hourOfWeek: number,
  normalizer: number,
): number {
  const real = smoothedHourly(hourly, hourOfWeek);
  const baseline = (total / 168) * timeMultiplier(hourOfWeek) * 10;
  const combined = real * 2.0 + baseline;
  return Math.min(1, combined / normalizer);
}


export const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatHourOfWeek(h: number): string {
  const dow = Math.floor(h / 24) % 7;
  const hr = h % 24;
  // Display as IST: data hours are UTC, IST = UTC+5:30. We round to nearest IST hour.
  const istHr = (hr + 5) % 24;
  const istDow = hr + 5 >= 24 ? (dow + 1) % 7 : dow;
  return `${DAY_LABEL[istDow]} ${String(istHr).padStart(2, "0")}:30 IST`;
}
