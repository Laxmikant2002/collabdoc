import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import { DocumentItem, User, DocumentVersion, DocumentComment } from '../../types/document';
import { EditorToolbar } from './EditorToolbar';
import { ShareModal } from '../ShareModal';
import { VersionHistoryModal } from '../VersionHistoryModal';
import { CommentsSidebar } from '../CommentsSidebar';
import { 
  saveDocument, 
  getUserPermissionForDoc, 
  getUserById, 
  getDocumentVersions, 
  addDocumentVersion, 
  getDocumentComments, 
  addComment, 
  replyToComment, 
  toggleResolveComment, 
  deleteComment, 
  exportDocument,
  toggleStarDocument
} from '../../services/storage';
import { SEED_USERS } from '../../data/seedData';
import { 
  ArrowLeft, 
  Share2, 
  History, 
  MessageSquare, 
  Download, 
  Star, 
  Check, 
  Users, 
  ListTree, 
  Printer, 
  FileCode, 
  FileText, 
  FileType,
  Sparkles,
  Lock,
  ChevronDown
} from 'lucide-react';

interface DocumentEditorProps {
  document: DocumentItem;
  currentUser: User;
  onBack: () => void;
  onDocumentChange: (updated: DocumentItem) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document: initialDoc,
  currentUser,
  onBack,
  onDocumentChange,
}) => {
  const [doc, setDoc] = useState<DocumentItem>(initialDoc);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  // Versions and comments state
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);

  // Permissions
  const permission = useMemo(() => {
    return getUserPermissionForDoc(doc, currentUser.id);
  }, [doc, currentUser.id]);

  const canEdit = permission.canEdit;
  const ownerUser = getUserById(doc.ownerId);

  // Simulated active presence (shows other teammates viewing/active)
  const activeCollaborators = useMemo(() => {
    return SEED_USERS.filter((u) => u.id !== currentUser.id);
  }, [currentUser.id]);

  // Keep state synced when prop changes
  useEffect(() => {
    setDoc(initialDoc);
    setVersions(getDocumentVersions(initialDoc.id));
    setComments(getDocumentComments(initialDoc.id));
  }, [initialDoc.id]);

  // Save timeout ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts or paste markdown here...',
      }),
    ],
    content: doc.contentHtml,
    editable: canEdit,
    onUpdate: ({ editor }) => {
      if (!canEdit) return;

      const html = editor.getHTML();
      setSaveStatus('saving');

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (snapshotTimeoutRef.current) clearTimeout(snapshotTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        const updatedDoc: DocumentItem = {
          ...doc,
          contentHtml: html,
          lastModifiedByUserId: currentUser.id,
          updatedAt: new Date().toISOString(),
        };
        saveDocument(updatedDoc);
        setDoc(updatedDoc);
        onDocumentChange(updatedDoc);
        setSaveStatus('saved');
      }, 500);

      // Snapshot capture on 6s idle
      snapshotTimeoutRef.current = setTimeout(() => {
        addDocumentVersion(doc.id, {
          title: doc.title,
          contentHtml: html,
          savedByUserId: currentUser.id,
          savedByUserName: currentUser.name,
          note: `Edit by ${currentUser.name}`,
        });
        setVersions(getDocumentVersions(doc.id));
      }, 6000);
    },
  });

  // Update editor editable state when permission changes
  useEffect(() => {
    if (editor && editor.isEditable !== canEdit) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  // Document Title Change Handler
  const handleTitleChange = (newTitle: string) => {
    if (!canEdit) return;
    const updated: DocumentItem = {
      ...doc,
      title: newTitle,
      lastModifiedByUserId: currentUser.id,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    saveDocument(updated);
    onDocumentChange(updated);
  };

  // Icon Change Handler
  const handleIconChange = (newIcon: string) => {
    if (!canEdit) return;
    const updated: DocumentItem = {
      ...doc,
      icon: newIcon,
      updatedAt: new Date().toISOString(),
    };
    setDoc(updated);
    saveDocument(updated);
    onDocumentChange(updated);
    setIsEmojiPickerOpen(false);
  };

  // Restore Version
  const handleRestoreVersion = (version: DocumentVersion) => {
    if (!canEdit) return;
    if (editor) {
      editor.commands.setContent(version.contentHtml);
    }
    const updated: DocumentItem = {
      ...doc,
      title: version.title,
      contentHtml: version.contentHtml,
      lastModifiedByUserId: currentUser.id,
      updatedAt: new Date().toISOString(),
    };
    saveDocument(updated);
    setDoc(updated);
    onDocumentChange(updated);

    // Record new restore snapshot
    addDocumentVersion(doc.id, {
      title: version.title,
      contentHtml: version.contentHtml,
      savedByUserId: currentUser.id,
      savedByUserName: currentUser.name,
      note: `Restored to snapshot from ${new Date(version.timestamp).toLocaleTimeString()}`,
    });
    setVersions(getDocumentVersions(doc.id));
  };

  // Comments Handlers
  const handleAddComment = (text: string) => {
    addComment(doc.id, currentUser, text);
    setComments(getDocumentComments(doc.id));
  };

  const handleReplyComment = (commentId: string, text: string) => {
    replyToComment(commentId, currentUser, text);
    setComments(getDocumentComments(doc.id));
  };

  const handleToggleResolve = (commentId: string) => {
    toggleResolveComment(commentId, currentUser.name);
    setComments(getDocumentComments(doc.id));
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
    setComments(getDocumentComments(doc.id));
  };

  // Word & Character count calculations
  const stats = useMemo(() => {
    if (!editor) return { words: 0, characters: 0, readTime: '1 min' };
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return {
      words,
      characters,
      readTime: `${minutes} min read`,
    };
  }, [editor?.getText()]);

  // Headings outline extracted from content
  const headings = useMemo(() => {
    if (!editor) return [];
    const items: { id: string; text: string; level: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const text = node.textContent;
        if (text) {
          items.push({
            id: `heading-${pos}`,
            text,
            level: node.attrs.level,
          });
        }
      }
    });
    return items;
  }, [editor?.state.doc]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Back & Title info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            title="Return to Documents Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

          {/* Star toggle */}
          <button
            onClick={() => {
              toggleStarDocument(doc.id);
              const updated = { ...doc, starred: !doc.starred };
              setDoc(updated);
              onDocumentChange(updated);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              doc.starred
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title={doc.starred ? 'Starred' : 'Add to Starred'}
          >
            <Star className={`w-4 h-4 ${doc.starred ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Auto-save Status */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">Saved</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Live Presence (collaborators viewing/editing) */}
        <div className="hidden lg:flex items-center gap-2 text-2xs text-neutral-500 bg-neutral-100/60 dark:bg-neutral-800/60 px-3 py-1 rounded-full border border-neutral-200/50 dark:border-neutral-700/50">
          <div className="flex -space-x-1.5 overflow-hidden">
            {activeCollaborators.slice(0, 2).map((collab) => (
              <div
                key={collab.id}
                title={`${collab.name} (${collab.role}) is connected`}
                className={`w-5 h-5 rounded-full bg-gradient-to-tr ${collab.avatarColor} text-white flex items-center justify-center text-3xs font-bold ring-2 ring-white dark:ring-neutral-900 shadow-2xs`}
              >
                {collab.avatarText}
              </div>
            ))}
          </div>
          <span>Active in doc</span>
        </div>

        {/* Right: Actions (Share, History, Comments, Export) */}
        <div className="flex items-center gap-2">
          {/* Table of contents toggle */}
          <button
            onClick={() => setShowOutline(!showOutline)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors hidden md:flex items-center gap-1.5 ${
              showOutline
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Document Outline"
          >
            <ListTree className="w-4 h-4" />
            <span className="hidden xl:inline">Outline</span>
          </button>

          {/* Version History Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Revision history"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Revisions ({versions.length})</span>
          </button>

          {/* Comments Sidebar Button */}
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium relative ${
              isCommentsOpen
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Open comments"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Comments</span>
            {comments.filter((c) => !c.resolved).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-3xs font-bold flex items-center justify-center">
                {comments.filter((c) => !c.resolved).length}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Export document"
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isExportOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsExportOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-1.5 z-40 text-xs">
                  <div className="px-2.5 py-1.5 text-2xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Export Document
                  </div>
                  <button
                    onClick={() => {
                      exportDocument(doc, 'md');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                  >
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportDocument(doc, 'txt');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                  >
                    <FileType className="w-4 h-4 text-sky-500" />
                    <span>Plain Text (.txt)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportDocument(doc, 'html');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>HTML Web (.html)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportDocument(doc, 'print');
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                  >
                    <Printer className="w-4 h-4 text-neutral-500" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Share Modal Trigger */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
            {doc.collaborators.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-700/80 rounded-full text-3xs">
                {doc.collaborators.length + 1}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Editor Formatting Toolbar */}
      <EditorToolbar editor={editor} readOnly={!canEdit} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Outline Drawer (Collapsible) */}
        {showOutline && (
          <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 p-4 overflow-y-auto hidden md:block shrink-0">
            <h4 className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 mb-3">
              Table of Contents
            </h4>
            {headings.length === 0 ? (
              <p className="text-xs text-neutral-400">
                Add Headings (H1, H2, H3) to see the outline here.
              </p>
            ) : (
              <div className="space-y-1">
                {headings.map((h, i) => (
                  <div
                    key={i}
                    className={`text-xs text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 truncate cursor-pointer py-1 ${
                      h.level === 1
                        ? 'font-semibold'
                        : h.level === 2
                        ? 'pl-3'
                        : 'pl-6 text-neutral-500'
                    }`}
                  >
                    {h.text}
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* Document Canvas */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-16 flex justify-center">
          <div className="w-full max-w-3xl">
            {/* Header / Document Metadata Section */}
            <div className="mb-6 space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
              {/* Icon selector & Title row */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <button
                    onClick={() => canEdit && setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    disabled={!canEdit}
                    className="text-3xl p-1 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors disabled:cursor-default"
                    title={canEdit ? 'Change Icon' : 'Document icon'}
                  >
                    {doc.icon || '📄'}
                  </button>

                  {isEmojiPickerOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsEmojiPickerOpen(false)}
                      />
                      <div className="absolute left-0 mt-1 p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-40 grid grid-cols-6 gap-1 w-64 text-xl">
                        {['📝', '📄', '🚀', '🎨', '⚡', '💡', '📚', '🎯', '⚙️', '📊', '🔒', '✨', '💻', '🛠️', '📌', '📎', '💬', '🏆'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleIconChange(emoji)}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  {canEdit ? (
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Untitled Document"
                      className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-none focus:outline-none text-neutral-900 dark:text-neutral-100 tracking-tight"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                      {doc.title}
                    </h1>
                  )}
                </div>
              </div>

              {/* Zero-Pill Unboxed Metadata (Section 1.A Anti-Slop Discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1 font-normal">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-tr ${ownerUser?.avatarColor || 'from-indigo-500 to-violet-600'} text-white flex items-center justify-center text-3xs font-bold`}
                  >
                    {ownerUser?.avatarText || 'OW'}
                  </div>
                  <span>Owner: {ownerUser?.name || 'Unknown'}</span>
                </div>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="capitalize">
                  Your Role: <strong>{permission.role === 'owner' ? 'Owner' : permission.role === 'editor' ? 'Editor' : 'Viewer'}</strong>
                </span>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="font-mono tabular-nums">{stats.words} words</span>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="font-mono tabular-nums">{stats.readTime}</span>
              </div>
            </div>

            {/* Tiptap Prose Canvas */}
            <div className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none">
              <EditorContent editor={editor} />
            </div>
          </div>
        </main>

        {/* Comments Sidebar Drawer */}
        <CommentsSidebar
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          comments={comments}
          currentUser={currentUser}
          onAddComment={handleAddComment}
          onReplyComment={handleReplyComment}
          onToggleResolve={handleToggleResolve}
          onDeleteComment={handleDeleteComment}
        />
      </div>

      {/* Sharing Modal */}
      <ShareModal
        document={doc}
        currentUser={currentUser}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onDocumentUpdated={(updated) => {
          setDoc(updated);
          onDocumentChange(updated);
        }}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={versions}
        onRestoreVersion={handleRestoreVersion}
        canEdit={canEdit}
      />
    </div>
  );
};
