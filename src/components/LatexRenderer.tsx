"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

function renderLatex(content: string): string {
  // Display math first to avoid conflicts with inline math regex
  let result = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<span class="text-red-500 font-mono text-sm">$$${math}$$</span>`;
    }
  });

  result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="text-red-500 font-mono text-sm">$${math}$</span>`;
    }
  });

  return result.replace(/\n/g, "<br />");
}

interface LatexRendererProps {
  content: string;
  className?: string;
}

export default function LatexRenderer({ content, className = "" }: LatexRendererProps) {
  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderLatex(content) }}
    />
  );
}
