import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Undo2,
  Redo2,
  Upload,
  BookOpen,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import { DailyPrompt } from '../../types/journal';

interface RichEditorProps {
  content: string;
  onChange: (htmlContent: string, plainText: string, wordCount: number, characterCount: number) => void;
  onInsertPrompt?: (prompt: DailyPrompt) => void;
  availablePrompts?: DailyPrompt[];
  placeholder?: string;
  minHeight?: string;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  content,
  onChange,
  onInsertPrompt,
  availablePrompts = [],
  placeholder = 'Begin your thoughts, reflections, or study notes here...',
  minHeight = '380px',
  isZenMode = false,
  onToggleZenMode
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [selectedImageEl, setSelectedImageEl] = useState<HTMLImageElement | null>(null);

  // Synchronize incoming content with contentEditable when loaded or changed externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, [content]);

  // Compute text statistics
  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;

    onChange(html, text, words, chars);
  }, [onChange]);

  // Handle active format states on selection change
  const checkActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  }, []);

  // Format execution
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    checkActiveFormats();
    updateStats();
  };

  // Format block elements (h1-h4, blockquote, p)
  const formatBlock = (tag: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('formatBlock', false, `<${tag}>`);
    checkActiveFormats();
    updateStats();
  };

  // Insert custom HTML block
  const insertCustomHtml = (htmlSnippet: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, htmlSnippet);
    updateStats();
  };

  // Insert Callout Box
  const insertCallout = () => {
    const snippet = `
      <div style="border-left: 3px solid var(--accent); background: var(--bg-surface-elevated); padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;" class="editorial-callout">
        <strong style="color: var(--accent);">Key Takeaway / Insight:</strong>
        <p style="margin: 4px 0 0 0;">Summarize the core realization or hypothesis here...</p>
      </div>
      <p><br></p>
    `;
    insertCustomHtml(snippet);
  };

  // Insert Checklist Item
  const insertChecklist = () => {
    const snippet = `
      <div class="task-list-item flex items-center gap-2 my-1" contenteditable="false">
        <input type="checkbox" style="cursor: pointer; accent-color: var(--accent); width: 16px; height: 16px;" onclick="this.checked ? this.nextElementSibling.style.textDecoration='line-through' : this.nextElementSibling.style.textDecoration='none'" />
        <span contenteditable="true" style="outline: none;" class="flex-1">Task or study milestone to accomplish</span>
      </div>
      <p><br></p>
    `;
    insertCustomHtml(snippet);
  };

  // Insert Code Block
  const insertCodeBlock = () => {
    const snippet = `
      <pre style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 12px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 13px; overflow-x: auto; margin: 12px 0;"><code>// Write code snippet, mathematical proof, or formula here</code></pre>
      <p><br></p>
    `;
    insertCustomHtml(snippet);
  };

  // Handle Clipboard Image Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            const base64Url = uploadEvent.target?.result as string;
            insertImageToEditor(base64Url, 'Pasted journal moment');
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
    // Normal paste update
    setTimeout(updateStats, 10);
  };

  // Handle File Upload from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      insertImageToEditor(base64Url, file.name.replace(/\.[^/.]+$/, ''));
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Insert Image with caption and styling
  const insertImageToEditor = (url: string, caption: string) => {
    const captionHtml = caption
      ? `<figcaption style="text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 6px; font-style: italic;">${caption}</figcaption>`
      : '';
    const imgSnippet = `
      <figure class="journal-image-wrapper my-4" style="margin: 16px 0; text-align: center;">
        <img src="${url}" alt="${caption || 'Journal memory'}" style="max-width: 100%; border-radius: 12px; border: 1px solid var(--border-subtle); display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.12);" />
        ${captionHtml}
      </figure>
      <p><br></p>
    `;
    insertCustomHtml(imgSnippet);
    setShowImageModal(false);
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  // Insert Prompt Block
  const insertPromptBlock = (prompt: DailyPrompt) => {
    const snippet = `
      <div style="border-left: 3px solid var(--accent); background: var(--bg-surface-elevated); padding: 14px 18px; margin: 16px 0; border-radius: 0 8px 8px 0;" class="prompt-box">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); font-weight: 600;">Daily Prompt · ${prompt.category}</span>
        <h4 style="margin: 4px 0 6px 0; font-size: 15px; font-weight: 600; color: var(--text-primary);">${prompt.question}</h4>
        <p style="font-size: 12px; color: var(--text-muted); margin: 0; font-style: italic;">Spark: ${prompt.spark}</p>
      </div>
      <p>My Reflection: </p>
    `;
    insertCustomHtml(snippet);
    setShowPromptMenu(false);
    if (onInsertPrompt) onInsertPrompt(prompt);
  };

  // Insert Link
  const handleInsertLink = () => {
    if (linkUrlInput) {
      executeCommand('createLink', linkUrlInput);
      setLinkUrlInput('');
      setShowLinkModal(false);
    }
  };

  // Listen to clicks inside editor to inspect image selection
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImageEl(target as HTMLImageElement);
    } else {
      setSelectedImageEl(null);
    }
    checkActiveFormats();
  };

  return (
    <div className={`rich-editor-container flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all ${isZenMode ? 'shadow-2xl' : ''}`}>
      {/* Editor Toolbar */}
      <div className="editor-toolbar flex flex-wrap items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/60 px-3 py-2 text-xs backdrop-blur-sm sticky top-0 z-20 rounded-t-xl">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings H1 - H4 */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => formatBlock('h1')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Heading 1 (Main Section)"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h2')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Heading 2 (Topic)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h3')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Heading 3 (Sub-topic)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h4')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Heading 4 (Minor Heading)"
          >
            <Heading4 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Styles */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className={`p-1.5 rounded hover:bg-[var(--bg-surface-muted)] transition-colors ${
              activeFormats.bold ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className={`p-1.5 rounded hover:bg-[var(--bg-surface-muted)] transition-colors ${
              activeFormats.italic ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className={`p-1.5 rounded hover:bg-[var(--bg-surface-muted)] transition-colors ${
              activeFormats.underline ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className={`p-1.5 rounded hover:bg-[var(--bg-surface-muted)] transition-colors ${
              activeFormats.strikeThrough ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('hiliteColor', '#fef08a')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Tasks */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className={`p-1.5 rounded hover:bg-[var(--bg-surface-muted)] transition-colors ${
              activeFormats.insertUnorderedList ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Bulleted List (ul)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className={`p-1.5 rounded hover:bg-[var(--bg-surface-muted)] transition-colors ${
              activeFormats.insertOrderedList ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Numbered List (ol)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertChecklist}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Interactive Checklist Task"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Blocks & Media */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => formatBlock('blockquote')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertCodeBlock}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Code Block / Snippet"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertCallout}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Key Takeaway / Study Callout"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertHorizontalRule')}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Images & Links */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
            title="Insert Image (URL or upload)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Image</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Upload Memory Photo from Device"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Daily Prompts Dropdown */}
        {availablePrompts.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPromptMenu(!showPromptMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors font-medium text-[11px]"
              title="Insert a Daily Prompt"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Prompt</span>
            </button>

            {showPromptMenu && (
              <div className="absolute left-0 mt-1 w-72 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl p-2 z-30 max-h-80 overflow-y-auto">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] px-2 py-1 uppercase tracking-wider">
                  Select a Reflection Prompt
                </div>
                {availablePrompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => insertPromptBlock(p)}
                    className="w-full text-left p-2 rounded hover:bg-[var(--bg-surface-muted)] transition-colors text-xs text-[var(--text-primary)] border-b border-[var(--border-subtle)]/50 last:border-0"
                  >
                    <div className="text-[10px] text-[var(--accent)] font-medium">{p.category}</div>
                    <div className="line-clamp-2 mt-0.5">{p.question}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Zen Mode Toggle */}
        {onToggleZenMode && (
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={onToggleZenMode}
              className="p-1.5 rounded hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title={isZenMode ? 'Exit Zen Mode' : 'Focus Zen Mode'}
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Selected Image Actions Toolbar (Floating if image clicked) */}
      {selectedImageEl && (
        <div className="flex items-center gap-2 bg-[var(--bg-surface-muted)] px-3 py-1.5 border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          <span className="text-[11px] font-medium text-[var(--text-primary)]">Image Selected:</span>
          <button
            type="button"
            onClick={() => {
              selectedImageEl.style.width = '100%';
              updateStats();
            }}
            className="px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
          >
            100% Full
          </button>
          <button
            type="button"
            onClick={() => {
              selectedImageEl.style.width = '70%';
              selectedImageEl.style.margin = '0 auto';
              updateStats();
            }}
            className="px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
          >
            70% Center
          </button>
          <button
            type="button"
            onClick={() => {
              selectedImageEl.style.width = '45%';
              updateStats();
            }}
            className="px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => {
              selectedImageEl.remove();
              setSelectedImageEl(null);
              updateStats();
            }}
            className="ml-auto text-rose-500 hover:text-rose-400"
          >
            Delete Image
          </button>
        </div>
      )}

      {/* ContentEditable Writing Surface */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateStats}
        onKeyUp={checkActiveFormats}
        onMouseUp={checkActiveFormats}
        onClick={handleEditorClick}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="journal-prose-area flex-1 px-6 py-5 outline-none focus:outline-none overflow-y-auto font-sans leading-relaxed text-[var(--text-primary)] selection:bg-[var(--accent-soft)]"
      />

      {/* Helper Modals */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Insert Memory Image</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Enter an image URL or close to paste directly from your clipboard or use device upload.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://... or data:image/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Caption / Moment Description</label>
                <input
                  type="text"
                  placeholder="e.g. Dawn reflection over the high alpine lake"
                  value={imageCaptionInput}
                  onChange={(e) => setImageCaptionInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!imageUrlInput.trim()}
                onClick={() => insertImageToEditor(imageUrlInput, imageCaptionInput)}
                className="px-4 py-1.5 text-xs font-medium bg-[var(--accent)] text-black rounded-lg hover:opacity-90 disabled:opacity-40"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Insert Reference Link</h3>
            <input
              type="text"
              placeholder="https://example.com"
              value={linkUrlInput}
              onChange={(e) => setLinkUrlInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkUrlInput.trim()}
                onClick={handleInsertLink}
                className="px-3.5 py-1.5 text-xs font-medium bg-[var(--accent)] text-black rounded-lg"
              >
                Link Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
