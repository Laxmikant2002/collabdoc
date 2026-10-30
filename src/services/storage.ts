import { DocumentItem, DocumentComment, DocumentVersion, User } from '../types/document';
import { INITIAL_DOCUMENTS, INITIAL_COMMENTS, SEED_USERS } from '../data/seedData';
import { marked } from 'marked';

const STORAGE_KEYS = {
  DOCUMENTS: 'collabdoc_documents_v1',
  ACTIVE_USER: 'collabdoc_active_user_v1',
  COMMENTS: 'collabdoc_comments_v1',
  VERSIONS: 'collabdoc_versions_v1',
};

// --- Local Storage Helpers ---
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read key ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write key ${key} to localStorage`, e);
  }
}

// Initialize seed data if not present
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
    setStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
    setStored(STORAGE_KEYS.ACTIVE_USER, SEED_USERS[0].id);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    setStored(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.VERSIONS)) {
    // Generate initial version snapshots for seed docs
    const versions: Record<string, DocumentVersion[]> = {};
    INITIAL_DOCUMENTS.forEach((doc) => {
      versions[doc.id] = [
        {
          id: `ver-${doc.id}-initial`,
          timestamp: doc.createdAt,
          title: doc.title,
          contentHtml: doc.contentHtml,
          savedByUserId: doc.ownerId,
          savedByUserName: SEED_USERS.find((u) => u.id === doc.ownerId)?.name || 'Owner',
          note: 'Initial draft snapshot',
        },
      ];
    });
    setStored(STORAGE_KEYS.VERSIONS, versions);
  }
}

// Reset data to default
export function resetToSeedData(): void {
  setStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  setStored(STORAGE_KEYS.ACTIVE_USER, SEED_USERS[0].id);
  setStored(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  
  const versions: Record<string, DocumentVersion[]> = {};
  INITIAL_DOCUMENTS.forEach((doc) => {
    versions[doc.id] = [
      {
        id: `ver-${doc.id}-initial`,
        timestamp: doc.createdAt,
        title: doc.title,
        contentHtml: doc.contentHtml,
        savedByUserId: doc.ownerId,
        savedByUserName: SEED_USERS.find((u) => u.id === doc.ownerId)?.name || 'Owner',
        note: 'Initial draft snapshot',
      },
    ];
  });
  setStored(STORAGE_KEYS.VERSIONS, versions);
}

// --- Active User Service ---
export function getActiveUser(): User {
  const userId = getStored(STORAGE_KEYS.ACTIVE_USER, SEED_USERS[0].id);
  return SEED_USERS.find((u) => u.id === userId) || SEED_USERS[0];
}

export function setActiveUser(userId: string): void {
  setStored(STORAGE_KEYS.ACTIVE_USER, userId);
}

export function getUserById(userId: string): User | undefined {
  return SEED_USERS.find((u) => u.id === userId);
}

// --- Documents CRUD ---
export function getAllDocuments(): DocumentItem[] {
  return getStored<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
}

export function getDocumentById(id: string): DocumentItem | undefined {
  const docs = getAllDocuments();
  return docs.find((d) => d.id === id);
}

export function saveDocument(document: DocumentItem): void {
  const docs = getAllDocuments();
  const index = docs.findIndex((d) => d.id === document.id);
  if (index >= 0) {
    docs[index] = {
      ...document,
      updatedAt: new Date().toISOString(),
    };
  } else {
    docs.unshift(document);
  }
  setStored(STORAGE_KEYS.DOCUMENTS, docs);
}

export function createNewDocument(ownerId: string, title = 'Untitled Document', icon = '📄'): DocumentItem {
  const newDoc: DocumentItem = {
    id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title,
    icon,
    ownerId,
    collaborators: [],
    isPublicLinkEnabled: false,
    publicLinkRole: 'viewer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedByUserId: ownerId,
    starred: false,
    trashed: false,
    category: 'General',
    contentHtml: '<h1>' + title + '</h1><p>Start typing your thoughts here...</p>',
  };

  const docs = getAllDocuments();
  docs.unshift(newDoc);
  setStored(STORAGE_KEYS.DOCUMENTS, docs);

  // Add initial version
  addDocumentVersion(newDoc.id, {
    title: newDoc.title,
    contentHtml: newDoc.contentHtml,
    savedByUserId: ownerId,
    savedByUserName: getUserById(ownerId)?.name || 'Owner',
    note: 'Created document',
  });

  return newDoc;
}

export function deleteDocument(docId: string, permanent = false): void {
  const docs = getAllDocuments();
  if (permanent) {
    const filtered = docs.filter((d) => d.id !== docId);
    setStored(STORAGE_KEYS.DOCUMENTS, filtered);
  } else {
    const updated = docs.map((d) => (d.id === docId ? { ...d, trashed: true } : d));
    setStored(STORAGE_KEYS.DOCUMENTS, updated);
  }
}

export function restoreDocument(docId: string): void {
  const docs = getAllDocuments();
  const updated = docs.map((d) => (d.id === docId ? { ...d, trashed: false } : d));
  setStored(STORAGE_KEYS.DOCUMENTS, updated);
}

export function toggleStarDocument(docId: string): void {
  const docs = getAllDocuments();
  const updated = docs.map((d) => (d.id === docId ? { ...d, starred: !d.starred } : d));
  setStored(STORAGE_KEYS.DOCUMENTS, updated);
}

export function duplicateDocument(docId: string, newOwnerId: string): DocumentItem | null {
  const original = getDocumentById(docId);
  if (!original) return null;

  const duplicated: DocumentItem = {
    ...original,
    id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: `${original.title} (Copy)`,
    ownerId: newOwnerId,
    collaborators: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedByUserId: newOwnerId,
    starred: false,
    trashed: false,
  };

  const docs = getAllDocuments();
  docs.unshift(duplicated);
  setStored(STORAGE_KEYS.DOCUMENTS, docs);
  return duplicated;
}

// --- Permissions & Roles Calculation ---
export function getUserPermissionForDoc(
  doc: DocumentItem,
  userId: string
): { role: 'owner' | 'editor' | 'viewer'; canEdit: boolean; isOwner: boolean } {
  if (doc.ownerId === userId) {
    return { role: 'owner', canEdit: true, isOwner: true };
  }

  const collab = doc.collaborators.find((c) => c.userId === userId);
  if (collab) {
    return {
      role: collab.role,
      canEdit: collab.role === 'editor',
      isOwner: false,
    };
  }

  if (doc.isPublicLinkEnabled) {
    return {
      role: doc.publicLinkRole,
      canEdit: doc.publicLinkRole === 'editor',
      isOwner: false,
    };
  }

  // Fallback viewer if allowed, or no access
  return { role: 'viewer', canEdit: false, isOwner: false };
}

// --- Sharing Operations ---
export function addOrUpdateCollaborator(
  docId: string,
  userId: string,
  role: 'editor' | 'viewer'
): DocumentItem | null {
  const doc = getDocumentById(docId);
  if (!doc) return null;

  const existingIndex = doc.collaborators.findIndex((c) => c.userId === userId);
  const updatedCollabs = [...doc.collaborators];

  if (existingIndex >= 0) {
    updatedCollabs[existingIndex] = {
      ...updatedCollabs[existingIndex],
      role,
    };
  } else {
    updatedCollabs.push({
      userId,
      role,
      addedAt: new Date().toISOString(),
    });
  }

  const updatedDoc: DocumentItem = {
    ...doc,
    collaborators: updatedCollabs,
    updatedAt: new Date().toISOString(),
  };

  saveDocument(updatedDoc);
  return updatedDoc;
}

export function removeCollaborator(docId: string, userId: string): DocumentItem | null {
  const doc = getDocumentById(docId);
  if (!doc) return null;

  const updatedCollabs = doc.collaborators.filter((c) => c.userId !== userId);
  const updatedDoc: DocumentItem = {
    ...doc,
    collaborators: updatedCollabs,
    updatedAt: new Date().toISOString(),
  };

  saveDocument(updatedDoc);
  return updatedDoc;
}

export function transferOwnership(docId: string, newOwnerId: string): DocumentItem | null {
  const doc = getDocumentById(docId);
  if (!doc) return null;

  // Old owner becomes an editor
  const oldOwnerId = doc.ownerId;
  const collabsWithoutNewOwner = doc.collaborators.filter((c) => c.userId !== newOwnerId);
  collabsWithoutNewOwner.push({
    userId: oldOwnerId,
    role: 'editor',
    addedAt: new Date().toISOString(),
  });

  const updatedDoc: DocumentItem = {
    ...doc,
    ownerId: newOwnerId,
    collaborators: collabsWithoutNewOwner,
    updatedAt: new Date().toISOString(),
  };

  saveDocument(updatedDoc);
  return updatedDoc;
}

export function togglePublicLink(
  docId: string,
  enabled: boolean,
  role: 'viewer' | 'editor' = 'viewer'
): DocumentItem | null {
  const doc = getDocumentById(docId);
  if (!doc) return null;

  const updatedDoc: DocumentItem = {
    ...doc,
    isPublicLinkEnabled: enabled,
    publicLinkRole: role,
    updatedAt: new Date().toISOString(),
  };

  saveDocument(updatedDoc);
  return updatedDoc;
}

// --- Version History ---
export function getDocumentVersions(docId: string): DocumentVersion[] {
  const all = getStored<Record<string, DocumentVersion[]>>(STORAGE_KEYS.VERSIONS, {});
  return all[docId] || [];
}

export function addDocumentVersion(
  docId: string,
  versionData: Omit<DocumentVersion, 'id' | 'timestamp'>
): void {
  const all = getStored<Record<string, DocumentVersion[]>>(STORAGE_KEYS.VERSIONS, {});
  const list = all[docId] || [];

  const newVersion: DocumentVersion = {
    id: 'ver-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...versionData,
  };

  // Limit versions per doc to 20
  const updatedList = [newVersion, ...list].slice(0, 20);
  all[docId] = updatedList;
  setStored(STORAGE_KEYS.VERSIONS, all);
}

// --- Comments System ---
export function getDocumentComments(docId: string): DocumentComment[] {
  const comments = getStored<DocumentComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  return comments.filter((c) => c.documentId === docId);
}

export function addComment(
  docId: string,
  user: User,
  content: string
): DocumentComment {
  const comments = getStored<DocumentComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const newComment: DocumentComment = {
    id: 'com-' + Date.now(),
    documentId: docId,
    userId: user.id,
    userName: user.name,
    userAvatarColor: user.avatarColor,
    content,
    createdAt: new Date().toISOString(),
    resolved: false,
    replies: [],
  };

  comments.unshift(newComment);
  setStored(STORAGE_KEYS.COMMENTS, comments);
  return newComment;
}

export function replyToComment(
  commentId: string,
  user: User,
  content: string
): void {
  const comments = getStored<DocumentComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const comment = comments.find((c) => c.id === commentId);
  if (comment) {
    if (!comment.replies) comment.replies = [];
    comment.replies.push({
      id: 'rep-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatarColor: user.avatarColor,
      content,
      createdAt: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.COMMENTS, comments);
  }
}

export function toggleResolveComment(commentId: string, resolverName: string): void {
  const comments = getStored<DocumentComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const comment = comments.find((c) => c.id === commentId);
  if (comment) {
    comment.resolved = !comment.resolved;
    if (comment.resolved) {
      comment.resolvedBy = resolverName;
    } else {
      delete comment.resolvedBy;
    }
    setStored(STORAGE_KEYS.COMMENTS, comments);
  }
}

export function deleteComment(commentId: string): void {
  const comments = getStored<DocumentComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const filtered = comments.filter((c) => c.id !== commentId);
  setStored(STORAGE_KEYS.COMMENTS, filtered);
}

// --- File Import Helper (.md and .txt) ---
export async function parseUploadedFile(file: File): Promise<{ title: string; html: string; rawText: string }> {
  const text = await file.text();
  const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '').trim() || 'Imported Document';

  if (file.name.endsWith('.md')) {
    // Parse markdown to HTML using marked
    const parsedHtml = await marked.parse(text);
    return {
      title: titleWithoutExt,
      html: parsedHtml,
      rawText: text,
    };
  } else {
    // .txt plain text file: convert paragraphs into HTML
    const paragraphs = text
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br/>')}</p>`)
      .join('');

    return {
      title: titleWithoutExt,
      html: `<h1>${escapeHtml(titleWithoutExt)}</h1>${paragraphs || '<p></p>'}`,
      rawText: text,
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Export Helpers ---
export function exportDocument(
  doc: DocumentItem,
  format: 'md' | 'txt' | 'html' | 'print'
): void {
  if (format === 'print') {
    window.print();
    return;
  }

  let content = '';
  let mimeType = 'text/plain';
  let filename = `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (format === 'html') {
    mimeType = 'text/html';
    filename += '.html';
    content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(doc.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; color: inherit; padding: 0; }
    blockquote { border-left: 3px solid #cbd5e1; margin-left: 0; padding-left: 16px; color: #64748b; font-style: italic; }
  </style>
</head>
<body>
  ${doc.contentHtml}
</body>
</html>`;
  } else if (format === 'md') {
    mimeType = 'text/markdown';
    filename += '.md';
    // Clean basic HTML to markdown conversion for exports
    content = htmlToMarkdown(doc.contentHtml, doc.title);
  } else if (format === 'txt') {
    mimeType = 'text/plain';
    filename += '.txt';
    const tmp = document.createElement('div');
    tmp.innerHTML = doc.contentHtml;
    content = `${doc.title}\n\n${tmp.textContent || tmp.innerText || ''}`;
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function htmlToMarkdown(html: string, fallbackTitle: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;

  // Simple clean converter
  let md = '';
  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || '';

      if (tag === 'h1') md += `# ${text}\n\n`;
      else if (tag === 'h2') md += `## ${text}\n\n`;
      else if (tag === 'h3') md += `### ${text}\n\n`;
      else if (tag === 'p') md += `${el.innerHTML.replace(/<strong>(.*?)<\/strong>/g, '**$1**').replace(/<em>(.*?)<\/em>/g, '*$1*').replace(/<code>(.*?)<\/code>/g, '`$1`')}\n\n`;
      else if (tag === 'ul') {
        el.querySelectorAll('li').forEach((li) => {
          md += `- ${li.textContent?.trim()}\n`;
        });
        md += '\n';
      } else if (tag === 'ol') {
        el.querySelectorAll('li').forEach((li, idx) => {
          md += `${idx + 1}. ${li.textContent?.trim()}\n`;
        });
        md += '\n';
      } else if (tag === 'blockquote') {
        md += `> ${text}\n\n`;
      } else if (tag === 'pre') {
        md += `\`\`\`\n${text}\n\`\`\`\n\n`;
      }
    }
  });

  return md.trim() || `# ${fallbackTitle}\n\n`;
}
