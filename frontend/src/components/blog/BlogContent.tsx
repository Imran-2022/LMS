import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    return <span key={index}>{part}</span>;
  });
}

export function BlogContent({ body }: { body: string | null | undefined }) {
  if (!body) return <p>This post has no content yet.</p>;

  const lines = body.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(
        <p key={`paragraph-${blocks.length}`}>
          {renderInline(paragraph.join(" "))}
        </p>,
      );
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push(
        <ul key={`list-${blocks.length}`}>
          {list.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  }

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        blocks.push(
          <pre key={`code-${blocks.length}`}>
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = [];
      } else {
        flushParagraph();
        flushList();
      }
      inCode = !inCode;
      return;
    }

    if (inCode) {
      code.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const Heading = heading[1].length === 2 ? "h2" : "h3";
      blocks.push(
        <Heading key={`heading-${blocks.length}`}>
          {renderInline(heading[2])}
        </Heading>,
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote key={`quote-${blocks.length}`}>
          {renderInline(trimmed.slice(2))}
        </blockquote>,
      );
      return;
    }

    const item = trimmed.match(/^[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <div className="prose-lms">{blocks}</div>;
}
