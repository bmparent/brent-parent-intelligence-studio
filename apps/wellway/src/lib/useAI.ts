import { useState, useEffect, useRef } from "react";
import {
  validateAIResult,
  type AIMode,
  type AIResult,
  type Turn,
} from "./ai-contract";
import type { Evidence } from "./types";
async function connectionStatus(): Promise<"ready" | "unavailable"> {
  if (location.protocol === "file:") return "unavailable";
  try {
    const response = await fetch("/api/wellway/status", {
      signal: AbortSignal.timeout(5000),
    });
    const result = response.ok ? await response.json() : null;
    return result?.aiConfigured === true ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}

export function useAI() {
  const [availability, setAvailability] = useState<
    "checking" | "ready" | "unavailable"
  >("checking");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const control = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const check = async () => {
    setAvailability("checking");
    const value = await connectionStatus();
    if (mounted.current) setAvailability(value);
  };
  useEffect(() => {
    mounted.current = true;
    let active = true;
    void connectionStatus().then((value) => {
      if (active) setAvailability(value);
    });
    return () => {
      active = false;
      mounted.current = false;
      control.current?.abort();
    };
  }, []);
  const cancel = () => {
    control.current?.abort();
    setCancelled(true);
  };
  async function ask(
    mode: AIMode,
    question: string,
    evidence: Evidence,
    history: Turn[] = [],
  ): Promise<AIResult | null> {
    if (control.current) return null;
    const controller = new AbortController();
    control.current = controller;
    setPending(true);
    setError("");
    setCancelled(false);
    const timer = setTimeout(() => controller.abort("timeout"), 32_000);
    try {
      const r = await fetch("/api/wellway/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          mode,
          question,
          evidence,
          history: history
            .slice(-6)
            .map((t) => ({ ...t, content: t.content.slice(0, 2000) })),
        }),
        signal: controller.signal,
      });
      const result = await r.json();
      if (!r.ok)
        throw new Error(
          result.error ||
            "Live AI is unavailable. Try again or use guided answers.",
        );
      if (result.mode !== "live")
        throw new Error("No live model response was received.");
      if (!mounted.current || controller.signal.aborted) return null;
      return validateAIResult(result, evidence);
    } catch (e) {
      if (mounted.current) {
        if (controller.signal.aborted && controller.signal.reason !== "timeout")
          setCancelled(true);
        else
          setError(
            controller.signal.reason === "timeout"
              ? "The response took too long. Please try again."
              : e instanceof Error
                ? e.message
                : "The response could not be completed.",
          );
      }
      return null;
    } finally {
      clearTimeout(timer);
      control.current = null;
      if (mounted.current) setPending(false);
    }
  }
  return { availability, pending, error, cancelled, ask, cancel, check };
}
