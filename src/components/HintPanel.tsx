"use client";

import { useState } from "react";
import LatexRenderer from "./LatexRenderer";
import type { HintData } from "@/types";

interface HintPanelProps {
  hints: HintData[];
}

export default function HintPanel({ hints }: HintPanelProps) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm" style={{ color: "var(--chalk-dim)" }}>Hints</h3>
        {revealed < hints.length && (
          <button
            onClick={() => setRevealed((n) => n + 1)}
            className="chalk-link text-xs"
          >
            Reveal hint {revealed + 1} of {hints.length}
          </button>
        )}
        {revealed === hints.length && (
          <span className="text-xs" style={{ color: "var(--chalk-faint)" }}>
            All hints revealed
          </span>
        )}
      </div>

      {hints.slice(0, revealed).map((hint) => (
        <div
          key={hint.id}
          className="rounded px-4 py-3"
          style={{
            backgroundColor: "rgba(188, 214, 230, 0.06)",
            border: "1px solid var(--board-edge)",
          }}
        >
          <div className="text-xs mb-1" style={{ color: "var(--chalk-blue)" }}>
            Hint {hint.order}
          </div>
          <div className="text-sm" style={{ color: "var(--chalk-dim)" }}>
            <LatexRenderer content={hint.content} />
          </div>
        </div>
      ))}
    </div>
  );
}
