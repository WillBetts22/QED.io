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
        <h3 className="text-sm font-semibold text-slate-700">Hints</h3>
        {revealed < hints.length && (
          <button
            onClick={() => setRevealed((n) => n + 1)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            Reveal hint {revealed + 1} of {hints.length}
          </button>
        )}
        {revealed === hints.length && (
          <span className="text-xs text-slate-400">All hints revealed</span>
        )}
      </div>

      {hints.slice(0, revealed).map((hint) => (
        <div key={hint.id} className="rounded-md bg-indigo-50 border border-indigo-100 px-4 py-3">
          <div className="text-xs font-medium text-indigo-500 mb-1">Hint {hint.order}</div>
          <div className="text-sm text-slate-700">
            <LatexRenderer content={hint.content} />
          </div>
        </div>
      ))}
    </div>
  );
}
