"use client";

import { FaInfoCircle, FaBold, FaItalic, FaLink } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface HeroBioEditorProps {
  bio: string;
  onChange: (newBio: string) => void;
}

export function HeroBioEditor({ bio, onChange }: HeroBioEditorProps) {
  const escapeHtml = (str: string): string =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const parseMarkdown = (text: string): string => {
    if (!text) return "";
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(
      /\[(.*?)\]\(((?:https?:\/\/|mailto:|\/)[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    );
    return html;
  };

  const insertMarkup = (tag: "bold" | "italic" | "link") => {
    const textarea = document.getElementById("bio-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (tag === "bold") {
      replacement = `**${selectedText || "bold text"}**`;
    } else if (tag === "italic") {
      replacement = `*${selectedText || "italic text"}*`;
    } else if (tag === "link") {
      const url = prompt("Enter the URL:", "https://");
      if (url === null) return;
      replacement = `[${selectedText || "link text"}](${url})`;
    }

    textarea.focus();

    try {
      textarea.setSelectionRange(start, end);
      const inserted = document.execCommand("insertText", false, replacement);
      if (!inserted) {
        const newValue = text.substring(0, start) + replacement + text.substring(end);
        onChange(newValue);
      }
    } catch {
      const newValue = text.substring(0, start) + replacement + text.substring(end);
      onChange(newValue);
    }

    setTimeout(() => {
      textarea.focus();
      const offset = tag === "link" ? 1 : 2;
      textarea.setSelectionRange(
        start + offset,
        start + offset + (selectedText || "text").length
      );
    }, 50);
  };

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
      <CardHeader className="p-4 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
              <FaInfoCircle size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Bio & Narrative
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Craft your introduction using Markdown formatting.
              </CardDescription>
            </div>
          </div>
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-slate-950/40">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkup("bold")}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              title="Bold (**text**)"
            >
              <FaBold size={12} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkup("italic")}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              title="Italic (*text*)"
            >
              <FaItalic size={12} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkup("link")}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              title="Link ([text](url))"
            >
              <FaLink size={12} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="relative">
          <textarea
            id="bio-textarea"
            className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900 shadow-sm transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:shadow-none"
            value={bio}
            onChange={(e) => onChange(e.target.value)}
            placeholder="I am a passionate Full-Stack Developer with experience in..."
          />
        </div>

        {/* Live Markdown Preview */}
        {bio && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-slate-950/30">
            <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Live Preview
            </p>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(bio) }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
