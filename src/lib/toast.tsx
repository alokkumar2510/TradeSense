"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let _dispatch: ((t: Toast) => void) | null = null;

/** Call anywhere to fire a toast — works outside React tree too */
export function toast(message: string, type: ToastType = "info") {
  _dispatch?.({ id: crypto.randomUUID(), message, type });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  useEffect(() => {
    _dispatch = (t: Toast) => {
      setToasts((prev) => [...prev.slice(-4), t]); // max 5 toasts
      timers.current.set(t.id, setTimeout(() => remove(t.id), 3500));
    };
    return () => { _dispatch = null; };
  }, [remove]);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => remove(t.id)}
          role="alert"
          style={{ cursor: "pointer" }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
