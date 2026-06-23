export function safeNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function safeDivide(a: number | null | undefined, b: number | null | undefined): number {
  const numerator = safeNumber(a);
  const denominator = safeNumber(b);
  return denominator !== 0 ? numerator / denominator : 0;
}
