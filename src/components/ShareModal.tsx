import React, { useState } from 'react';
import { DocumentItem, User, PermissionRole } from '../types/document';
import { SEED_USERS } from '../data/seedData';
import { 
  X, 
  Link, 
  Check, 
  Copy, 
  Globe, 
  Lock, 
  UserPlus, 
  Shield, 
  Trash2, 
  ArrowRightLeft,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  addOrUpdateCollaborator, 
  removeCollaborator, 
  transferOwnership, 
  togglePublicLink, 
  getUserById 
} from '../services/storage';

interface ShareModalProps {
  document: DocumentItem;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (updatedDoc: DocumentItem) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  document,
  currentUser,
  isOpen,
  onClose,
  onDocumentUpdated,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = document.ownerId === currentUser.id;
  const ownerUser = getUserById(document.ownerId);

  // Available seeded users not already the owner or collaborator
  const availableUsers = SEED_USERS.filter(
    (u) => u.id !== document.ownerId && !document.collaborators.some((c) => c.userId === u.id)
  );

  const handleAddCollaborator = () => {
    if (!selectedUserId) return;
    const updated = addOrUpdateCollaborator(document.id, selectedUserId, selectedRole);
    if (updated) {
      onDocumentUpdated(updated);
      setSelectedUserId('');
      setFeedbackMsg(`Added collaborator successfully`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleUpdateRole = (userId: string, role: 'editor' | 'viewer') => {
    const updated = addOrUpdateCollaborator(document.id, userId, role);
    if (updated) {
      onDocumentUpdated(updated);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    const updated = removeCollaborator(document.id, userId);
    if (updated) {
      onDocumentUpdated(updated);
      setFeedbackMsg('Collaborator access removed');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleTransferOwnership = (newOwnerId: string) => {
    const target = getUserById(newOwnerId);
    if (confirm(`Are you sure you want to transfer ownership to ${target?.name}? You will become an Editor.`)) {
      const updated = transferOwnership(document.id, newOwnerId);
      if (updated) {
        onDocumentUpdated(updated);
        setFeedbackMsg(`Transferred ownership to ${target?.name}`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    }
  };

  const handleToggleLinkSharing = (enabled: boolean) => {
    const updated = togglePublicLink(document.id, enabled, document.publicLinkRole || 'viewer');
    if (updated) {
      onDocumentUpdated(updated);
    }
  };

  const handleUpdatePublicRole = (role: 'viewer' | 'editor') => {
    const updated = togglePublicLink(document.id, document.isPublicLinkEnabled, role);
    if (updated) {
      onDocumentUpdated(updated);
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}?docId=${document.id}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Share "{document.title}"</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage permissions, invite team members, or configure link access
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick invite from seeded accounts */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Invite Test Team Member
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={!isOwner}
                className="flex-1 px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email} - {u.role})
                  </option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                disabled={!isOwner}
                className="w-28 px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="editor">Can Edit</option>
                <option value="viewer">Can View</option>
              </select>

              <button
                onClick={handleAddCollaborator}
                disabled={!selectedUserId || !isOwner}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            </div>
            {!isOwner && (
              <p className="text-2xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Only the document owner ({ownerUser?.name}) can invite new collaborators.
              </p>
            )}
          </div>

          {/* Collaborators List */}
          <div>
            <h4 className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
              People With Access
            </h4>

            <div className="space-y-2.5">
              {/* Document Owner Row */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr ${ownerUser?.avatarColor || 'from-indigo-500 to-violet-600'} text-white flex items-center justify-center text-xs font-bold shadow-2xs`}
                  >
                    {ownerUser?.avatarText || 'OW'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <span>{ownerUser?.name || 'Owner'}</span>
                      {document.ownerId === currentUser.id && (
                        <span className="text-3xs px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-2xs text-neutral-500">
                      {ownerUser?.email} · {ownerUser?.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Owner</span>
                </div>
              </div>

              {/* Collaborators */}
              {document.collaborators.length === 0 ? (
                <div className="text-center py-4 text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  No other collaborators added yet.
                </div>
              ) : (
                document.collaborators.map((collab) => {
                  const user = getUserById(collab.userId);
                  if (!user) return null;
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <div
                      key={collab.userId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-2xs`}
                        >
                          {user.avatarText}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-3xs px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-2xs text-neutral-500">
                            {user.email} · {user.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={collab.role}
                              onChange={(e) =>
                                handleUpdateRole(collab.userId, e.target.value as 'editor' | 'viewer')
                              }
                              className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300"
                            >
                              <option value="editor">Can Edit</option>
                              <option value="viewer">Can View</option>
                            </select>

                            <button
                              onClick={() => handleTransferOwnership(collab.userId)}
                              title="Transfer Ownership to this collaborator"
                              className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-700"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveCollaborator(collab.userId)}
                              title="Remove Collaborator"
                              className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md font-medium capitalize">
                            {collab.role === 'editor' ? 'Can Edit' : 'Can View'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* General Link Access */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h4 className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
              General Link Access
            </h4>

            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    document.isPublicLinkEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {document.isPublicLinkEnabled ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {document.isPublicLinkEnabled ? 'Anyone with the link' : 'Restricted'}
                  </div>
                  <div className="text-2xs text-neutral-500">
                    {document.isPublicLinkEnabled
                      ? 'Anyone on this instance with the link can access'
                      : 'Only added collaborators can open this document'}
                  </div>
                </div>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2">
                  {document.isPublicLinkEnabled && (
                    <select
                      value={document.publicLinkRole || 'viewer'}
                      onChange={(e) =>
                        handleUpdatePublicRole(e.target.value as 'viewer' | 'editor')
                      }
                      className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  )}

                  <button
                    onClick={() => handleToggleLinkSharing(!document.isPublicLinkEnabled)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      document.isPublicLinkEnabled
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                    }`}
                  >
                    {document.isPublicLinkEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Simulation instructions */}
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-2xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <span className="font-semibold">Collaborative Testing Tip:</span> Use the user profile switcher at the top right of the navigation bar to switch between Alice, Bob, and Charlie to immediately experience role differences (Owner vs Can Edit vs View-Only).
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Document Link</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
