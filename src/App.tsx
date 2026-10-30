/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, DocumentItem } from './types/document';
import { 
  initStorage, 
  getAllDocuments, 
  getActiveUser, 
  setActiveUser, 
  getUserById, 
  createNewDocument, 
  deleteDocument, 
  restoreDocument, 
  toggleStarDocument, 
  duplicateDocument, 
  resetToSeedData,
  getDocumentById,
  saveDocument
} from './services/storage';
import { SEED_USERS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DocumentEditor } from './components/Editor/DocumentEditor';
import { ImportModal } from './components/ImportModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User>(SEED_USERS[0]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [shareModalDoc, setShareModalDoc] = useState<DocumentItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize storage, theme, and query parameters on mount
  useEffect(() => {
    initStorage();
    const storedUser = getActiveUser();
    setCurrentUserState(storedUser);
    setDocuments(getAllDocuments());

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('collabdoc_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check if URL has ?docId parameter
    const urlParams = new URLSearchParams(window.location.search);
    const docIdParam = urlParams.get('docId');
    if (docIdParam) {
      const targetDoc = getDocumentById(docIdParam);
      if (targetDoc && !targetDoc.trashed) {
        setActiveDocId(docIdParam);
      }
    }
  }, []);

  // Theme toggle handler
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('collabdoc_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Switch User handler
  const handleSwitchUser = (userId: string) => {
    setActiveUser(userId);
    const user = getUserById(userId) || SEED_USERS[0];
    setCurrentUserState(user);
    // Refresh documents in case changes occurred
    setDocuments(getAllDocuments());
  };

  // Create New Document
  const handleNewDocument = () => {
    const newDoc = createNewDocument(currentUser.id);
    setDocuments(getAllDocuments());
    setActiveDocId(newDoc.id);
  };

  // Import Document from .md or .txt file
  const handleImportDocument = (title: string, htmlContent: string) => {
    const newDoc = createNewDocument(currentUser.id, title, '📥');
    const updated = {
      ...newDoc,
      contentHtml: htmlContent,
      category: 'Imported',
      updatedAt: new Date().toISOString(),
    };
    saveDocument(updated);
    setDocuments(getAllDocuments());
    setActiveDocId(newDoc.id);
  };

  // Document actions
  const handleDeleteDocument = (docId: string, permanent = false) => {
    deleteDocument(docId, permanent);
    setDocuments(getAllDocuments());
    if (activeDocId === docId) {
      setActiveDocId(null);
    }
  };

  const handleRestoreDocument = (docId: string) => {
    restoreDocument(docId);
    setDocuments(getAllDocuments());
  };

  const handleToggleStar = (docId: string) => {
    toggleStarDocument(docId);
    setDocuments(getAllDocuments());
  };

  const handleDuplicateDocument = (docId: string) => {
    duplicateDocument(docId, currentUser.id);
    setDocuments(getAllDocuments());
  };

  const handleResetData = () => {
    resetToSeedData();
    const storedUser = getActiveUser();
    setCurrentUserState(storedUser);
    setDocuments(getAllDocuments());
    setActiveDocId(null);
  };

  const activeDoc = activeDocId ? documents.find((d) => d.id === activeDocId) : null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onNewDocument={handleNewDocument}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
        onNavigateHome={() => {
          setActiveDocId(null);
          // Clean url param if present
          window.history.replaceState({}, '', window.location.pathname);
        }}
        currentDocTitle={activeDoc?.title}
        isEditingDoc={Boolean(activeDocId)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View: Document Editor OR Documents Dashboard */}
      {activeDoc ? (
        <DocumentEditor
          key={activeDoc.id}
          document={activeDoc}
          currentUser={currentUser}
          onBack={() => {
            setActiveDocId(null);
            setDocuments(getAllDocuments());
            window.history.replaceState({}, '', window.location.pathname);
          }}
          onDocumentChange={(updated) => {
            setDocuments((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
          }}
        />
      ) : (
        <Dashboard
          documents={documents}
          currentUser={currentUser}
          onSelectDocument={(doc) => {
            if (!doc.trashed) {
              setActiveDocId(doc.id);
              window.history.replaceState({}, '', `?docId=${doc.id}`);
            }
          }}
          onNewDocument={handleNewDocument}
          onOpenImport={() => setIsImportModalOpen(true)}
          onToggleStar={handleToggleStar}
          onDeleteDocument={handleDeleteDocument}
          onRestoreDocument={handleRestoreDocument}
          onDuplicateDocument={handleDuplicateDocument}
          onOpenShareModal={(doc) => setShareModalDoc(doc)}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportDocument={handleImportDocument}
      />

      {/* Share Modal from Dashboard */}
      {shareModalDoc && (
        <ShareModal
          document={shareModalDoc}
          currentUser={currentUser}
          isOpen={Boolean(shareModalDoc)}
          onClose={() => setShareModalDoc(null)}
          onDocumentUpdated={(updated) => {
            setDocuments((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
            setShareModalDoc(updated);
          }}
        />
      )}
    </div>
  );
}
