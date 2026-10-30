import React, { useState } from 'react';
import { DocumentVersion } from '../types/document';
import { History, Clock, RotateCcw, X, User } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: DocumentVersion[];
  onRestoreVersion: (version: DocumentVersion) => void;
  canEdit: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRestoreVersion,
  canEdit,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.id || ''
  );

  if (!isOpen) return null;

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || versions[0];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full h-[600px] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Version History
              </h3>
              <p className="text-xs text-neutral-500">
                Browse earlier revisions and restore if needed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Split: List on Left, Preview on Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Versions List */}
          <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto p-3 space-y-1.5 bg-neutral-50/50 dark:bg-neutral-900/50">
            <p className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 px-2 py-1">
              Snapshots ({versions.length})
            </p>
            {versions.length === 0 ? (
              <p className="text-xs text-neutral-400 p-2">No versions recorded yet.</p>
            ) : (
              versions.map((ver, idx) => {
                const isSelected = ver.id === selectedVersion?.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersionId(ver.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200 dark:border-neutral-700'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      <span>{idx === 0 ? 'Current Revision' : `Revision #${versions.length - idx}`}</span>
                      <span className="text-2xs font-normal text-neutral-500">
                        {formatDate(ver.timestamp)}
                      </span>
                    </div>
                    <div className="text-2xs text-neutral-500 mt-1 flex items-center gap-1 truncate">
                      <User className="w-3 h-3 shrink-0" />
                      <span>{ver.savedByUserName}</span>
                    </div>
                    {ver.note && (
                      <div className="text-2xs text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                        {ver.note}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Preview Pane */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
            {selectedVersion ? (
              <>
                <div className="px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/30 dark:bg-neutral-900/30">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedVersion.title}
                    </h4>
                    <p className="text-2xs text-neutral-500">
                      Saved {formatDate(selectedVersion.timestamp)} by {selectedVersion.savedByUserName}
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        onRestoreVersion(selectedVersion);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore This Version</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.contentHtml }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
                Select a version from the left panel
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
