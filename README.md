# CollabDoc

CollabDoc is a lightweight collaborative document studio inspired by Google Docs. It focuses on a coherent local-first product slice rather than attempting to reproduce every Google Docs feature.

## What works

- Create, rename, edit, save, reopen, duplicate, star, trash, restore, and export documents.
- Rich text editing with bold, italic, underline, headings, blockquotes, code blocks, checklists, bulleted lists, and numbered lists.
- Import `.md`, `.markdown`, and `.txt` files into editable documents. Markdown is converted to rich text; plain text is escaped and split into paragraphs.
- Switch between seeded demo users: Alice (Product Lead), Bob (Senior Designer), and Charlie (Tech Lead).
- Share a document with another seeded user as an editor or viewer, remove access, transfer ownership, or enable a public viewer/editor link.
- Persist documents, permissions, comments, and version snapshots in browser `localStorage`, including across refreshes.
- Restore a previous version, add comments, resolve comments, and export Markdown, text, HTML, or print output.

## Local setup

**Prerequisite:** Node.js 20+ (Node.js 26 was used for verification).

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:3000>.

The Gemini integration is optional for the current product flow. If you enable it, copy `.env.example` to `.env.local` and add `GEMINI_API_KEY`.

## Verification commands

```bash
npm test
npm run lint
npm run build
```

## Demo sharing flow

1. Start as Alice and open **Product Requirements: Realtime Sync & Collaborative Canvas**.
2. Select **Share**, add Bob as **Can Edit**, then close the dialog.
3. Use the profile switcher to change to Bob. The document appears under **Shared with me** and Bob can edit it.
4. Switch to Charlie to see the viewer experience on the same document.

Use **Reset demo data** in the profile menu to restore the seeded accounts and documents.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the application boundaries, data model, persistence decisions, and scope tradeoffs.

## Deployment

This is a static Vite application and can be deployed to any free static-hosting provider. Build with `npm run build` and publish the generated `dist/` directory. For a reviewer-facing deployment, configure the provider to run `npm install && npm run build` and serve `dist/`.

The application intentionally uses local browser storage, so each reviewer/browser has an independent demo workspace. A shared server database and real authentication were intentionally deferred from this time-boxed prototype.

## Assignment materials

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AI_WORKFLOW.md](./AI_WORKFLOW.md)
- [SUBMISSION.md](./SUBMISSION.md)
- [WALKTHROUGH_VIDEO.txt](./WALKTHROUGH_VIDEO.txt)
