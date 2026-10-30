import React, { useState } from 'react';
import { DocumentComment, User } from '../types/document';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  CornerDownRight, 
  Trash2, 
  X, 
  Check, 
  Filter
} from 'lucide-react';

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  comments: DocumentComment[];
  currentUser: User;
  onAddComment: (text: string) => void;
  onReplyComment: (commentId: string, text: string) => void;
  onToggleResolve: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({
  isOpen,
  onClose,
  comments,
  currentUser,
  onAddComment,
  onReplyComment,
  onToggleResolve,
  onDeleteComment,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  if (!isOpen) return null;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim());
    setNewCommentText('');
  };

  const handleReplySubmit = (commentId: string) => {
    const text = replyInputs[commentId]?.trim();
    if (!text) return;
    onReplyComment(commentId, text);
    setReplyInputs({ ...replyInputs, [commentId]: '' });
    setActiveReplyId(null);
  };

  const filteredComments = comments.filter((c) => {
    if (filter === 'unresolved') return !c.resolved;
    if (filter === 'resolved') return c.resolved;
    return true;
  });

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <aside className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full shadow-lg z-30 transition-all shrink-0">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
            Comments ({comments.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1 bg-neutral-50/50 dark:bg-neutral-900/50">
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
            filter === 'unresolved'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
          }`}
        >
          Open ({comments.filter((c) => !c.resolved).length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
            filter === 'resolved'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
          }`}
        >
          Resolved ({comments.filter((c) => c.resolved).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
          }`}
        >
          All
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            {filter === 'unresolved' ? 'No open comments' : 'No comments found'}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-xl border text-xs transition-colors ${
                comment.resolved
                  ? 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800 opacity-75'
                  : 'bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700/80 shadow-2xs'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${comment.userAvatarColor} text-white flex items-center justify-center text-3xs font-bold shadow-2xs`}
                  >
                    {comment.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {comment.userName}
                    </span>
                    <span className="text-3xs text-neutral-400 block">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleResolve(comment.id)}
                    title={comment.resolved ? 'Reopen comment' : 'Mark as resolved'}
                    className={`p-1 rounded-md transition-colors ${
                      comment.resolved
                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        : 'text-neutral-400 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    title="Delete comment"
                    className="p-1 text-neutral-400 hover:text-red-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Body */}
              <div className="mt-2 text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </div>

              {comment.resolved && comment.resolvedBy && (
                <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-3xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Resolved by {comment.resolvedBy}</span>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-700/60 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="pl-3 border-l-2 border-indigo-200 dark:border-indigo-900">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full bg-gradient-to-tr ${reply.userAvatarColor} text-white flex items-center justify-center text-3xs font-bold`}
                        >
                          {reply.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 text-2xs">
                          {reply.userName}
                        </span>
                        <span className="text-3xs text-neutral-400">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-neutral-600 dark:text-neutral-300 text-2xs">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply toggle / box */}
              {!comment.resolved && (
                <div className="mt-2.5 pt-1">
                  {activeReplyId === comment.id ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyInputs[comment.id] || ''}
                        onChange={(e) =>
                          setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReplySubmit(comment.id);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-2 py-0.5 text-2xs text-neutral-500 hover:text-neutral-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          className="px-2 py-0.5 text-2xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReplyId(comment.id)}
                      className="text-2xs text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Comment Input at bottom */}
      <form
        onSubmit={handleSubmitNew}
        className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-2"
      >
        <input
          type="text"
          placeholder="Leave a comment..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-neutral-100"
        />
        <button
          type="submit"
          disabled={!newCommentText.trim()}
          className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
