import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Highlighter, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  ListTodo, 
  Quote, 
  Code, 
  Minus, 
  Undo2, 
  Redo2, 
  RemoveFormatting,
  Lock
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, readOnly = false }) => {
  if (!editor) return null;

  if (readOnly) {
    return (
      <div className="sticky top-15 z-20 flex items-center justify-between px-4 py-2 bg-amber-50/90 dark:bg-amber-950/40 backdrop-blur-md border-b border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-medium">
            View-only mode: You do not have permission to edit this document.
          </span>
        </div>
        <span className="text-2xs text-amber-700/80 dark:text-amber-400">
          Switch user in top navigation to test editing
        </span>
      </div>
    );
  }

  const ToolButton = ({
    active,
    onClick,
    icon: Icon,
    title,
    disabled = false,
  }: {
    active?: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="sticky top-15 z-20 w-full px-4 py-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between overflow-x-auto gap-1">
      <div className="flex items-center gap-1 shrink-0">
        {/* History: Undo / Redo */}
        <ToolButton
          icon={Undo2}
          title="Undo (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolButton
          icon={Redo2}
          title="Redo (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

        {/* Headings */}
        <ToolButton
          icon={Heading1}
          title="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolButton
          icon={Heading2}
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolButton
          icon={Heading3}
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

        {/* Text styling */}
        <ToolButton
          icon={Bold}
          title="Bold (Ctrl+B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolButton
          icon={Italic}
          title="Italic (Ctrl+I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolButton
          icon={UnderlineIcon}
          title="Underline (Ctrl+U)"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolButton
          icon={Strikethrough}
          title="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolButton
          icon={Highlighter}
          title="Highlight"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

        {/* Lists */}
        <ToolButton
          icon={List}
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolButton
          icon={ListOrdered}
          title="Numbered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolButton
          icon={ListTodo}
          title="Task List / Checkbox"
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

        {/* Quotes, Code, Horizontal Rule */}
        <ToolButton
          icon={Quote}
          title="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolButton
          icon={Code}
          title="Code Block"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolButton
          icon={Minus}
          title="Divider Line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <ToolButton
          icon={RemoveFormatting}
          title="Clear Formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>

      <div className="text-3xs text-neutral-400 dark:text-neutral-500 font-mono hidden lg:block shrink-0">
        Markdown shortcuts supported (e.g. #, -, 1., [ ])
      </div>
    </div>
  );
};
