import { User, DocumentItem, DocumentComment } from '../types/document';

export const SEED_USERS: User[] = [
  {
    id: 'user-alice',
    name: 'Alice Chen',
    email: 'alice@collabdoc.io',
    role: 'Product Lead',
    avatarColor: 'from-indigo-500 to-violet-600',
    avatarText: 'AC',
  },
  {
    id: 'user-bob',
    name: 'Bob Miller',
    email: 'bob@collabdoc.io',
    role: 'Senior Designer',
    avatarColor: 'from-sky-500 to-cyan-600',
    avatarText: 'BM',
  },
  {
    id: 'user-charlie',
    name: 'Charlie Davis',
    email: 'charlie@collabdoc.io',
    role: 'Tech Lead',
    avatarColor: 'from-emerald-500 to-teal-600',
    avatarText: 'CD',
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Product Requirements: Realtime Sync & Collaborative Canvas',
    icon: '📝',
    ownerId: 'user-alice',
    collaborators: [
      { userId: 'user-bob', role: 'editor', addedAt: '2026-10-28T14:20:00Z' },
      { userId: 'user-charlie', role: 'viewer', addedAt: '2026-10-28T15:00:00Z' },
    ],
    isPublicLinkEnabled: true,
    publicLinkRole: 'viewer',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-30T08:15:00Z',
    lastModifiedByUserId: 'user-alice',
    starred: true,
    trashed: false,
    category: 'Product Specs',
    contentHtml: `
      <h1>Product Requirements: Realtime Sync &amp; Canvas</h1>
      <p>This document details the functional specifications for the <strong>CollabDoc</strong> document engine and client-side replication architecture.</p>
      
      <h2>1. Objective &amp; Problem Statement</h2>
      <p>Modern distributed teams require instantaneous document authoring without locking delays or sync conflict friction. Authors should be able to draft formatted notes, import existing markdown repositories, and invite teammates with granular access rules.</p>
      
      <blockquote>
        "The fastest collaboration tool is one that never gets in the way of thought and retains state instantaneously."
      </blockquote>

      <h2>2. Core Functional Requirements</h2>
      <ul data-type="taskList">
        <li><label><input type="checkbox" checked></label><div>Rich-text formatting with Tiptap (headings, bold, italic, code blocks, lists)</div></li>
        <li><label><input type="checkbox" checked></label><div>Drag-and-drop file import for <code>.md</code> and <code>.txt</code> documents</div></li>
        <li><label><input type="checkbox" checked></label><div>Mock user role switcher with Owner, Editor, and Viewer permission levels</div></li>
        <li><label><input type="checkbox" checked></label><div>Local-first persistence with revision snapshots and instant restores</div></li>
        <li><label><input type="checkbox"></label><div>Automated export to Markdown, Text, and HTML bundles</div></li>
      </ul>

      <h2>3. Permission Matrix</h2>
      <p>Collaborators are provisioned into discrete tiers:</p>
      <ol>
        <li><strong>Owner:</strong> Full rights to modify, re-assign ownership, delete document, and grant collaborator roles.</li>
        <li><strong>Can Edit:</strong> Can update rich text contents, add comments, and trigger exports.</li>
        <li><strong>Can View:</strong> Read-only access with interactive copy/search capability and comment inspection.</li>
      </ol>
      
      <h3>Implementation Note</h3>
      <pre><code>// Dynamic permission check
const canEdit = document.ownerId === currentUser.id || 
  document.collaborators.some(c => c.userId === currentUser.id && c.role === 'editor');
</code></pre>
    `,
  },
  {
    id: 'doc-2',
    title: 'Design Systems & Token Architecture Guidelines',
    icon: '🎨',
    ownerId: 'user-bob',
    collaborators: [
      { userId: 'user-alice', role: 'editor', addedAt: '2026-10-29T09:30:00Z' },
    ],
    isPublicLinkEnabled: false,
    publicLinkRole: 'viewer',
    createdAt: '2026-10-29T09:00:00Z',
    updatedAt: '2026-10-30T07:45:00Z',
    lastModifiedByUserId: 'user-bob',
    starred: true,
    trashed: false,
    category: 'Design',
    contentHtml: `
      <h1>Design Systems &amp; Token Architecture</h1>
      <p>Overview of the typography scale, neutral color distribution, and spatial mathematics established for this studio interface.</p>

      <h2>Visual Foundation &amp; Hierarchy</h2>
      <p>We adhere to strict spatial math: container outer padding is always greater than or equal to inner child margins. Button controls maintain a <code>py-2 px-4</code> baseline with single-line typography.</p>
      
      <h3>Typography Pairings</h3>
      <ul>
        <li><strong>Display &amp; Headings:</strong> Plus Jakarta Sans (600/700 weight, balanced line wrap)</li>
        <li><strong>Prose Body:</strong> Plus Jakarta Sans (15px-16px, 1.6 line height)</li>
        <li><strong>Data &amp; Code:</strong> JetBrains Mono (tabular figures, crisp syntax)</li>
      </ul>

      <h2>Color Discipline (60-30-10)</h2>
      <p>To avoid visual noise, color is budgeted deliberately:</p>
      <ul>
        <li><strong>60% Canvas:</strong> Neutral off-white (#FAFAFA) or deep neutral slate in dark mode.</li>
        <li><strong>30% Structural:</strong> Hairline borders, navigation, and neutral card surfaces.</li>
        <li><strong>10% Accent:</strong> Focused indigo action triggers and verified active buttons.</li>
      </ul>
    `,
  },
  {
    id: 'doc-3',
    title: 'Architecture RFC: Offline-First Local Storage Engine',
    icon: '⚡',
    ownerId: 'user-charlie',
    collaborators: [
      { userId: 'user-alice', role: 'viewer', addedAt: '2026-10-29T16:00:00Z' },
      { userId: 'user-bob', role: 'viewer', addedAt: '2026-10-29T16:10:00Z' },
    ],
    isPublicLinkEnabled: true,
    publicLinkRole: 'viewer',
    createdAt: '2026-10-29T15:00:00Z',
    updatedAt: '2026-10-30T06:20:00Z',
    lastModifiedByUserId: 'user-charlie',
    starred: false,
    trashed: false,
    category: 'Engineering',
    contentHtml: `
      <h1>Architecture RFC: Offline-First Storage Engine</h1>
      <p>Technical proposal for client-authoritative state caching, cross-tab synchronization events, and automated version snapshotting.</p>

      <h2>Storage Layer Principles</h2>
      <p>Every keystroke triggers a debounced commit into the browser storage repository. Whenever multiple tabs or users interact, storage change listeners dispatch optimistic state reconciliations.</p>
      
      <h3>Key Guarantees:</h3>
      <ol>
        <li>Zero data loss upon unexpected tab reloads or network latency dips.</li>
        <li>Immutable version snapshots whenever an author pauses typing for more than 5 seconds.</li>
        <li>Clean separation between personal ownership records and invited collaborator groups.</li>
      </ol>

      <p><em>Author: Charlie Davis, Tech Lead</em></p>
    `,
  },
  {
    id: 'doc-4',
    title: 'Welcome to CollabDoc - Quick Start & Keyboard Shortcuts',
    icon: '💡',
    ownerId: 'user-alice',
    collaborators: [
      { userId: 'user-bob', role: 'editor', addedAt: '2026-10-30T09:00:00Z' },
      { userId: 'user-charlie', role: 'editor', addedAt: '2026-10-30T09:00:00Z' },
    ],
    isPublicLinkEnabled: false,
    publicLinkRole: 'viewer',
    createdAt: '2026-10-30T08:00:00Z',
    updatedAt: '2026-10-30T09:10:00Z',
    lastModifiedByUserId: 'user-alice',
    starred: false,
    trashed: false,
    category: 'Guides',
    contentHtml: `
      <h1>Welcome to CollabDoc!</h1>
      <p>Welcome to your lightweight collaborative document studio. Here is a brief guide on getting the most out of the features:</p>

      <h2>Essential Shortcuts</h2>
      <ul>
        <li><code>Ctrl + B</code> / <code>Cmd + B</code> — Bold selection</li>
        <li><code>Ctrl + I</code> / <code>Cmd + I</code> — Italic selection</li>
        <li><code>Ctrl + U</code> / <code>Cmd + U</code> — Underline selection</li>
        <li><code># + Space</code> — Create Header 1</li>
        <li><code>## + Space</code> — Create Header 2</li>
        <li><code>- + Space</code> — Create bulleted list</li>
        <li><code>1. + Space</code> — Create numbered list</li>
        <li><code>[ ] + Space</code> — Create interactive task checkbox</li>
      </ul>

      <h2>Collaborative Sharing</h2>
      <p>Click the <strong>Share</strong> button in the top right to invite Alice, Bob, or Charlie, or test permissions using the <strong>User Switcher</strong> in the top navigation bar!</p>
    `,
  },
];

export const INITIAL_COMMENTS: DocumentComment[] = [
  {
    id: 'com-1',
    documentId: 'doc-1',
    userId: 'user-bob',
    userName: 'Bob Miller',
    userAvatarColor: 'from-sky-500 to-cyan-600',
    content: 'Love the task list integration! Should we also add table support in the next sprint?',
    createdAt: '2026-10-29T11:20:00Z',
    resolved: false,
    replies: [
      {
        id: 'reply-1',
        userId: 'user-alice',
        userName: 'Alice Chen',
        userAvatarColor: 'from-indigo-500 to-violet-600',
        content: 'Yes! Tiptap handles tables very cleanly. Let’s slate that right after release.',
        createdAt: '2026-10-29T12:05:00Z',
      },
    ],
  },
  {
    id: 'com-2',
    documentId: 'doc-1',
    userId: 'user-charlie',
    userName: 'Charlie Davis',
    userAvatarColor: 'from-emerald-500 to-teal-600',
    content: 'The debounce time on autosave is currently set to 600ms, which feels very responsive in testing.',
    createdAt: '2026-10-29T14:40:00Z',
    resolved: true,
    resolvedBy: 'Alice Chen',
  },
];
