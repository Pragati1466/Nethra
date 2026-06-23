/**
 * useFormHistory — generic undo/redo stack for any form state.
 *
 * Usage:
 *   const { state, set, undo, redo, canUndo, canRedo, historySize } =
 *     useFormHistory(initialState);
 *
 * - Every call to `set(patch)` pushes a new snapshot onto the stack.
 * - `undo()` / `redo()` walk the stack.
 * - Keyboard shortcuts Ctrl+Z / Ctrl+Shift+Z / Cmd+Z / Cmd+Shift+Z
 *   are registered while the hook is mounted.
 * - Max stack depth: 50 entries (oldest entries are dropped).
 */

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY = 50;

export type UseFormHistoryReturn<T> = {
  state: T;
  /** Merge a partial patch into current state and push a snapshot */
  set: (patch: Partial<T>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Total snapshots in the past stack (excludes current) */
  historySize: number;
  /** How many redo steps are available */
  redoSize: number;
};

export function useFormHistory<T extends object>(initial: T): UseFormHistoryReturn<T> {
  // past[0] is the oldest, past[past.length-1] is the previous state
  const [past, setPast]   = useState<T[]>([]);
  const [current, setCurrent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  // Use a ref for the current state so the keydown handler always reads fresh
  const currentRef = useRef(current);
  currentRef.current = current;
  const pastRef = useRef(past);
  pastRef.current = past;
  const futureRef = useRef(future);
  futureRef.current = future;

  const set = useCallback((patch: Partial<T>) => {
    setCurrent(prev => {
      const next = { ...prev, ...patch };
      // Push prev onto past stack, clear future
      setPast(p => {
        const trimmed = p.length >= MAX_HISTORY ? p.slice(1) : p;
        return [...trimmed, prev];
      });
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      const newPast = p.slice(0, -1);
      setFuture(f => [currentRef.current, ...f]);
      setCurrent(prev);
      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      const newFuture = f.slice(1);
      setPast(p => [...p, currentRef.current]);
      setCurrent(next);
      return newFuture;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (pastRef.current.length > 0) undo();
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        if (futureRef.current.length > 0) redo();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo]);

  return {
    state: current,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length,
    redoSize: future.length,
  };
}
