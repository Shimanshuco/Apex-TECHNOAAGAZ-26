import React, { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Link,
  Quote,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ── Types ── */

export interface MarkdownEditorProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/* ── Toolbar action descriptor ── */

interface ToolbarAction {
  icon: React.ReactNode;
  title: string;
  /** Called with current selection range + full text, returns new { text, cursorPos } */
  apply: (p: ActionParams) => ActionResult;
}

interface ActionParams {
  text: string;
  selStart: number;
  selEnd: number;
}

interface ActionResult {
  text: string;
  /** New caret position (collapsed cursor) */
  cursorStart: number;
  cursorEnd: number;
}

/* ── Helpers ── */

/** Wrap selected text (or insert placeholder) with a prefix/suffix */
function wrapSelection(
  { text, selStart, selEnd }: ActionParams,
  prefix: string,
  suffix: string,
  placeholder: string,
): ActionResult {
  const selected = text.slice(selStart, selEnd);
  const inner = selected || placeholder;
  const newText = text.slice(0, selStart) + prefix + inner + suffix + text.slice(selEnd);
  return {
    text: newText,
    cursorStart: selStart + prefix.length,
    cursorEnd: selStart + prefix.length + inner.length,
  };
}

/** Prefix every line of the selection (or insert placeholder line) */
function prefixLines(
  { text, selStart, selEnd }: ActionParams,
  prefix: string,
  placeholder: string,
): ActionResult {
  const selected = text.slice(selStart, selEnd);
  if (!selected) {
    const ins = prefix + placeholder;
    const newText = text.slice(0, selStart) + ins + text.slice(selEnd);
    return {
      text: newText,
      cursorStart: selStart + prefix.length,
      cursorEnd: selStart + ins.length,
    };
  }
  const lines = selected.split("\n").map((l) => prefix + l);
  const joined = lines.join("\n");
  const newText = text.slice(0, selStart) + joined + text.slice(selEnd);
  return {
    text: newText,
    cursorStart: selStart,
    cursorEnd: selStart + joined.length,
  };
}

function prefixNumberedLines(
  { text, selStart, selEnd }: ActionParams,
  placeholder: string,
): ActionResult {
  const selected = text.slice(selStart, selEnd);
  if (!selected) {
    const ins = "1. " + placeholder;
    const newText = text.slice(0, selStart) + ins + text.slice(selEnd);
    return {
      text: newText,
      cursorStart: selStart + 3,
      cursorEnd: selStart + ins.length,
    };
  }
  const lines = selected.split("\n").map((l, i) => `${i + 1}. ${l}`);
  const joined = lines.join("\n");
  const newText = text.slice(0, selStart) + joined + text.slice(selEnd);
  return {
    text: newText,
    cursorStart: selStart,
    cursorEnd: selStart + joined.length,
  };
}

/* ── Toolbar definitions ── */

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    icon: <Bold size={15} />,
    title: "Bold",
    apply: (p) => wrapSelection(p, "**", "**", "bold text"),
  },
  {
    icon: <Italic size={15} />,
    title: "Italic",
    apply: (p) => wrapSelection(p, "_", "_", "italic text"),
  },
  {
    icon: <Heading1 size={15} />,
    title: "Heading 1",
    apply: (p) => prefixLines(p, "# ", "Heading"),
  },
  {
    icon: <Heading2 size={15} />,
    title: "Heading 2",
    apply: (p) => prefixLines(p, "## ", "Heading"),
  },
  {
    icon: <List size={15} />,
    title: "Bullet list",
    apply: (p) => prefixLines(p, "- ", "item"),
  },
  {
    icon: <ListOrdered size={15} />,
    title: "Numbered list",
    apply: (p) => prefixNumberedLines(p, "item"),
  },
  {
    icon: <Quote size={15} />,
    title: "Blockquote",
    apply: (p) => prefixLines(p, "> ", "quote"),
  },
  {
    icon: <Code size={15} />,
    title: "Inline code",
    apply: (p) => wrapSelection(p, "`", "`", "code"),
  },
  {
    icon: <Link size={15} />,
    title: "Link",
    apply: ({ text, selStart, selEnd }) => {
      const selected = text.slice(selStart, selEnd) || "link text";
      const ins = `[${selected}](url)`;
      const newText = text.slice(0, selStart) + ins + text.slice(selEnd);
      // Place cursor on "url"
      const urlStart = selStart + selected.length + 3; // after "[text]("
      return { text: newText, cursorStart: urlStart, cursorEnd: urlStart + 3 };
    },
  },
  {
    icon: <Minus size={15} />,
    title: "Horizontal rule",
    apply: ({ text, selStart, selEnd }) => {
      const ins = "\n---\n";
      const newText = text.slice(0, selStart) + ins + text.slice(selEnd);
      return { text: newText, cursorStart: selStart + ins.length, cursorEnd: selStart + ins.length };
    },
  },
];

/* ── Component ── */

const ICON_BTN =
  "p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-gold transition-colors";

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  rows = 6,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewing, setPreviewing] = React.useState(false);

  const applyAction = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const { selectionStart, selectionEnd } = ta;
      const result = action.apply({
        text: value,
        selStart: selectionStart,
        selEnd: selectionEnd,
      });

      onChange(result.text);

      // Restore cursor after React re-renders
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(result.cursorStart, result.cursorEnd);
      });
    },
    [value, onChange],
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-gray-900/60 border border-white/10 rounded-t-lg border-b-0">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            title={action.title}
            className={ICON_BTN}
            onMouseDown={(e) => {
              e.preventDefault(); // keep textarea focus
              applyAction(action);
            }}
          >
            {action.icon}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          title={previewing ? "Edit" : "Preview"}
          className={`${ICON_BTN} flex items-center gap-1 text-xs`}
          onClick={() => setPreviewing((p) => !p)}
        >
          {previewing ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden sm:inline">{previewing ? "Edit" : "Preview"}</span>
        </button>
      </div>

      {/* Editor or Preview */}
      {previewing ? (
        <div
          className={`
            w-full px-4 py-3 bg-gray-900/80 border border-white/10 rounded-b-lg
            text-white min-h-[150px] prose prose-invert prose-sm max-w-none
            prose-headings:text-gold prose-a:text-sky-400
          `}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-3 bg-gray-900/80 border border-white/10 rounded-b-lg
            text-white placeholder-gray-500 resize-y min-h-[100px]
            focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50
            transition-all duration-300 font-mono text-sm
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""}
          `}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};
