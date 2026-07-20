"use client";

import React, { useEffect, memo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import "./RichTextEditor.scss";

/**
 * Strip HTML tags for plain-text length checks (forms / validation).
 * @param {string} html
 * @returns {string}
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Lightweight sanitize for display — removes script tags and event handlers.
 * @param {string} html
 * @returns {string}
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
};

const ToolbarButton = ({ active, disabled, onClick, title, children }) => (
  <button
    type="button"
    className={`rte-toolbar__btn${active ? " is-active" : ""}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
  >
    {children}
  </button>
);

/**
 * TipTap-based rich text editor compatible with Ant Design Form.Item
 * (controlled via value / onChange).
 */
const RichTextEditor = memo(
  ({
    value = "",
    onChange,
    placeholder = "Write here...",
    minHeight = 140,
    disabled = false,
  }) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        }),
        Placeholder.configure({ placeholder }),
      ],
      content: value || "",
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "rte-editor__content",
        },
      },
      onUpdate: ({ editor: ed }) => {
        const html = ed.getHTML();
        const empty = ed.isEmpty || html === "<p></p>";
        onChange?.(empty ? "" : html);
      },
    });

    // Sync external value → editor (e.g. form reset / edit load)
    useEffect(() => {
      if (!editor) return;
      const current = editor.getHTML();
      const next = value || "";
      const currentEmpty = editor.isEmpty || current === "<p></p>";
      const nextEmpty = !next || next === "<p></p>";
      if (currentEmpty && nextEmpty) return;
      if (current !== next) {
        editor.commands.setContent(next, { emitUpdate: false });
      }
    }, [editor, value]);

    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [editor, disabled]);

    const setLink = useCallback(() => {
      if (!editor) return;
      const previous = editor.getAttributes("link").href;
      const url = window.prompt("Enter URL", previous || "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }, [editor]);

    if (!editor) {
      return (
        <div className="rte-editor is-loading" style={{ minHeight }}>
          Loading editor...
        </div>
      );
    }

    return (
      <div
        className={`rte-editor${disabled ? " is-disabled" : ""}`}
        style={{ "--rte-min-height": `${minHeight}px` }}
      >
        <div className="rte-toolbar">
          <ToolbarButton
            title="Bold"
            active={editor.isActive("bold")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={editor.isActive("italic")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={editor.isActive("underline")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span style={{ textDecoration: "underline" }}>U</span>
          </ToolbarButton>
          <span className="rte-toolbar__divider" />
          <ToolbarButton
            title="Heading"
            active={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H
          </ToolbarButton>
          <ToolbarButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            title="Ordered list"
            active={editor.isActive("orderedList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
          <span className="rte-toolbar__divider" />
          <ToolbarButton
            title="Link"
            active={editor.isActive("link")}
            disabled={disabled}
            onClick={setLink}
          >
            Link
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
