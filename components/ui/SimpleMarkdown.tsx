"use client";

import { Fragment, type ReactNode } from "react";

type SimpleMarkdownProps = {
  content: string;
  className?: string;
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`${match.index}-b`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`${match.index}-i`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`${match.index}-c`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-800"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function SimpleMarkdown({ content, className }: SimpleMarkdownProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let bulletItems: string[] = [];
  let orderedItems: string[] = [];
  let paragraphLines: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="leading-7 text-slate-700">
          {renderInline(text)}
        </p>,
      );
    }
    paragraphLines = [];
  }

  function flushBulletList() {
    if (bulletItems.length === 0) {
      return;
    }

    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-5 text-slate-700">
        {bulletItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    bulletItems = [];
  }

  function flushOrderedList() {
    if (orderedItems.length === 0) {
      return;
    }

    blocks.push(
      <ol key={`ol-${blocks.length}`} className="list-decimal space-y-2 pl-5 text-slate-700">
        {orderedItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ol>,
    );
    orderedItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushBulletList();
      flushOrderedList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushBulletList();
      flushOrderedList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingClass =
        level === 1
          ? "text-xl font-bold text-slate-950"
          : level === 2
            ? "text-lg font-bold text-slate-950"
            : "text-base font-semibold text-slate-900";

      blocks.push(
        <div key={`h-${blocks.length}`} className={headingClass}>
          {renderInline(text)}
        </div>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      flushOrderedList();
      bulletItems.push(line.slice(2).trim());
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushBulletList();
      orderedItems.push(line.replace(/^\d+\.\s+/, "").trim());
      continue;
    }

    flushBulletList();
    flushOrderedList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushBulletList();
  flushOrderedList();

  return <div className={className ? className : "space-y-4"}>{blocks.map((block, index) => <Fragment key={index}>{block}</Fragment>)}</div>;
}
