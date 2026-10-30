import React, { useState, useMemo } from 'react';
import { DocumentItem, User, ViewFilter } from '../types/document';
import { getUserPermissionForDoc, getUserById } from '../services/storage';
import { 
  FileText, 
  Users, 
  Star, 
  Trash2, 
  Plus, 
  Upload, 
  Search, 
  Grid, 
  List, 
  Clock, 
  Share2, 
  Copy, 
  RotateCcw, 
  MoreVertical, 
  Globe, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  documents: DocumentItem[];
  currentUser: User;
  onSelectDocument: (doc: DocumentItem) => void;
  onNewDocument: () => void;
  onOpenImport: () => void;
  onToggleStar: (docId: string) => void;
  onDeleteDocument: (docId: string, permanent?: boolean) => void;
  onRestoreDocument: (docId: string) => void;
  onDuplicateDocument: (docId: string) => void;
  onOpenShareModal: (doc: DocumentItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  currentUser,
  onSelectDocument,
  onNewDocument,
  onOpenImport,
  onToggleStar,
  onDeleteDocument,
  onRestoreDocument,
  onDuplicateDocument,
  onOpenShareModal,
}) => {
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);

  // Compute stats and document groups
  const categorizedCounts = useMemo(() => {
    const nonTrash = documents.filter((d) => !d.trashed);
    const myDocs = nonTrash.filter((d) => d.ownerId === currentUser.id);
    const sharedWithMe = nonTrash.filter(
      (d) => d.ownerId !== currentUser.id && d.collaborators.some((c) => c.userId === currentUser.id)
    );
    const starred = nonTrash.filter((d) => d.starred);
    const trash = documents.filter((d) => d.trashed);

    return {
      all: nonTrash.length,
      myDocs: myDocs.length,
      sharedWithMe: sharedWithMe.length,
      starred: starred.length,
      trash: trash.length,
    };
  }, [documents, currentUser.id]);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    let list = documents;

    if (filter === 'trash') {
      list = list.filter((d) => d.trashed);
    } else {
      list = list.filter((d) => !d.trashed);

      if (filter === 'my-docs') {
        list = list.filter((d) => d.ownerId === currentUser.id);
      } else if (filter === 'shared-with-me') {
        list = list.filter(
          (d) => d.ownerId !== currentUser.id && d.collaborators.some((c) => c.userId === currentUser.id)
        );
      } else if (filter === 'starred') {
        list = list.filter((d) => d.starred);
      }
    }

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.contentHtml.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [documents, filter, searchQuery, currentUser.id]);

  // Strip HTML for clean snippet
  const getCleanSnippet = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.trim().slice(0, 110) + (text.length > 110 ? '...' : '');
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Banner / Workspace Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          {/* Zero-Pill unboxed metadata text */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>{currentUser.role}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{categorizedCounts.myDocs} personal docs</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{categorizedCounts.sharedWithMe} shared with you</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenImport}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-xl transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Upload className="w-4 h-4 text-neutral-500" />
            <span>Import .md / .txt</span>
          </button>

          <button
            onClick={onNewDocument}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Control Strip: Filter Tabs, Search & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        {/* Interactive segmented controls for filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/60 dark:border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>All Documents</span>
            <span className="font-mono tabular-nums text-2xs text-neutral-400">({categorizedCounts.all})</span>
          </button>

          <button
            onClick={() => setFilter('my-docs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filter === 'my-docs'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Documents</span>
            <span className="font-mono tabular-nums text-2xs text-neutral-400">({categorizedCounts.myDocs})</span>
          </button>

          <button
            onClick={() => setFilter('shared-with-me')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filter === 'shared-with-me'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Shared With Me</span>
            <span className="font-mono tabular-nums text-2xs text-neutral-400">({categorizedCounts.sharedWithMe})</span>
          </button>

          <button
            onClick={() => setFilter('starred')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filter === 'starred'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Starred</span>
            <span className="font-mono tabular-nums text-2xs text-neutral-400">({categorizedCounts.starred})</span>
          </button>

          <button
            onClick={() => setFilter('trash')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filter === 'trash'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash</span>
            <span className="font-mono tabular-nums text-2xs text-neutral-400">({categorizedCounts.trash})</span>
          </button>
        </div>

        {/* Search & Layout Toggles */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-2xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid / Table View */}
      <div className="mt-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              No documents found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              {filter === 'shared-with-me'
                ? 'No documents have been shared with your current account yet. Use the top bar switcher to log in as Alice or Bob, open a document, and share it with your account.'
                : filter === 'my-docs'
                ? 'You haven’t created any personal documents yet. Click "New Document" to start writing!'
                : filter === 'trash'
                ? 'Trash is empty.'
                : 'No documents match your filter or search query.'}
            </p>
            {filter !== 'trash' && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onNewDocument}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Document</span>
                </button>
                <button
                  onClick={onOpenImport}
                  className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Import File
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const isOwner = doc.ownerId === currentUser.id;
              const ownerUser = getUserById(doc.ownerId);
              const permission = getUserPermissionForDoc(doc, currentUser.id);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Icon, Category & Star */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-neutral-100/80 dark:bg-neutral-800 rounded-lg">
                          {doc.icon || '📄'}
                        </span>
                        {doc.category && (
                          <span className="text-2xs text-neutral-400 font-medium">
                            {doc.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleStar(doc.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            doc.starred
                              ? 'text-amber-500'
                              : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
                          }`}
                          title={doc.starred ? 'Starred' : 'Star document'}
                        >
                          <Star className={`w-4 h-4 ${doc.starred ? 'fill-amber-500' : ''}`} />
                        </button>

                        {/* More Menu Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id)
                            }
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuDocId === doc.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveMenuDocId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-1.5 z-40 text-xs">
                                <button
                                  onClick={() => {
                                    onSelectDocument(doc);
                                    setActiveMenuDocId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300"
                                >
                                  Open
                                </button>
                                <button
                                  onClick={() => {
                                    onOpenShareModal(doc);
                                    setActiveMenuDocId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300"
                                >
                                  Share & Permissions
                                </button>
                                <button
                                  onClick={() => {
                                    onDuplicateDocument(doc.id);
                                    setActiveMenuDocId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300"
                                >
                                  Duplicate
                                </button>
                                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                                {doc.trashed ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        onRestoreDocument(doc.id);
                                        setActiveMenuDocId(null);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-emerald-600"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => {
                                        onDeleteDocument(doc.id, true);
                                        setActiveMenuDocId(null);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-red-600"
                                    >
                                      Delete Permanently
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      onDeleteDocument(doc.id);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-red-600"
                                  >
                                    Move to Trash
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Title */}
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </h3>

                    {/* Content Snippet */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {getCleanSnippet(doc.contentHtml)}
                    </p>
                  </div>

                  {/* Card Bottom Meta (Zero-pill discipline) */}
                  <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-2xs text-neutral-500">
                    {/* Owner & Permission */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-tr ${ownerUser?.avatarColor || 'from-indigo-500 to-violet-600'} text-white flex items-center justify-center text-3xs font-bold`}
                      >
                        {ownerUser?.avatarText || 'OW'}
                      </div>
                      <span className="truncate max-w-[100px]">
                        {isOwner ? 'You (Owner)' : ownerUser?.name || 'Shared'}
                      </span>
                    </div>

                    {/* Collaborator stack and permission badge */}
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium text-neutral-600 dark:text-neutral-400">
                        {permission.role === 'owner'
                          ? 'Owner'
                          : permission.role === 'editor'
                          ? 'Can Edit'
                          : 'Can View'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatRelativeTime(doc.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Your Access</th>
                    <th className="py-3 px-4">Collaborators</th>
                    <th className="py-3 px-4 text-right">Last Modified</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredDocuments.map((doc) => {
                    const isOwner = doc.ownerId === currentUser.id;
                    const ownerUser = getUserById(doc.ownerId);
                    const permission = getUserPermissionForDoc(doc, currentUser.id);

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => onSelectDocument(doc)}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{doc.icon || '📄'}</span>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                              {doc.title}
                            </span>
                            {doc.starred && (
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                            <div
                              className={`w-4 h-4 rounded-full bg-gradient-to-tr ${ownerUser?.avatarColor || 'from-indigo-500 to-violet-600'} text-white flex items-center justify-center text-3xs font-bold`}
                            >
                              {ownerUser?.avatarText || 'OW'}
                            </div>
                            <span>{isOwner ? 'You' : ownerUser?.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-medium text-neutral-600 dark:text-neutral-400">
                            {permission.role === 'owner'
                              ? 'Owner'
                              : permission.role === 'editor'
                              ? 'Can Edit'
                              : 'Can View'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center -space-x-1">
                            {doc.collaborators.length === 0 ? (
                              <span className="text-neutral-400 text-2xs">None</span>
                            ) : (
                              doc.collaborators.map((c) => {
                                const u = getUserById(c.userId);
                                return (
                                  <div
                                    key={c.userId}
                                    title={`${u?.name} (${c.role})`}
                                    className={`w-5 h-5 rounded-full bg-gradient-to-tr ${u?.avatarColor || 'from-neutral-400 to-neutral-600'} text-white flex items-center justify-center text-3xs font-bold ring-1 ring-white dark:ring-neutral-900`}
                                  >
                                    {u?.avatarText}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-500">
                          {formatRelativeTime(doc.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenShareModal(doc)}
                              className="p-1 text-neutral-400 hover:text-indigo-600 rounded"
                              title="Share"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDuplicateDocument(doc.id)}
                              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1 text-neutral-400 hover:text-red-600 rounded"
                              title="Move to trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
