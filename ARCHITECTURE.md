# Architecture Note

## Product slice

CollabDoc is a client-side React and TypeScript application built with Vite. The product prioritizes a usable document loop: create or import a document, edit formatted content, save it, reopen it, and demonstrate sharing with seeded users.

## Main boundaries

- `src/App.tsx` coordinates navigation, the active seeded user, document selection, theme, and modal state.
- `src/components/Editor/DocumentEditor.tsx` owns the Tiptap editing surface, debounced saves, permissions, comments, version history, and export actions.
- `src/services/storage.ts` is the persistence boundary. It reads and writes versioned `localStorage` keys and contains document, permission, import, comment, version, and export operations.
- `src/types/document.ts` defines the document, collaborator, user, comment, and version contracts.
- `src/data/seedData.ts` provides deterministic demo users and documents so reviewers can test sharing without account setup.

## Persistence and access model

Documents contain an owner ID and collaborator records with `editor` or `viewer` roles. Permission checks are centralized in `getUserPermissionForDoc`, which drives whether the editor is editable and which documents appear in the dashboard filters. Edits are debounced before writing to local storage, and idle edits create bounded version snapshots.

This is deliberately local-first rather than a multi-user backend. It makes refresh persistence and a complete demo flow reliable within the assignment timebox, but it does not provide cross-device synchronization, server-side authorization, or conflict resolution. Those are the first production changes I would make after adding authentication and a database API.

## Scope decisions

Prioritized:

1. A clear create/edit/save/reopen loop.
2. Real rich-text structure instead of a plain textarea.
3. File import with explicit supported formats and safe text escaping.
4. Demonstrable owner/editor/viewer behavior.
5. Version history, comments, and exports as useful depth.

Deprioritized:

- Real-time collaboration and presence synchronization.
- Production authentication, invitations, and server-side access control.
- `.docx` parsing and binary attachment storage.
- Operational concerns such as rate limiting, audit logs, and backup.

## Reliability checks

The repository includes automated tests for Markdown and plain-text import behavior, including HTML escaping. TypeScript validation and a production Vite build are also part of the verification commands in the README.
