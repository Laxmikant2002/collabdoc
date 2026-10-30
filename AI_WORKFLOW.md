# AI Workflow Note

## Tools used

- GitHub Copilot SDK in VS Code for codebase inspection, implementation suggestions, and review of the assignment requirements.
- TypeScript compiler and Vite build output as deterministic verification tools.
- Node's built-in test runner through the existing `tsx` dependency for focused import tests.

## Where AI helped

AI accelerated the initial rubric audit, identified the Vite/esbuild peer dependency mismatch, and helped trace the existing editor, storage, import, and sharing surfaces before changes were made. It also helped turn the existing implementation into reviewer-facing setup and architecture documentation.

## Judgment and changes

AI suggestions were treated as drafts. I kept the existing local-first architecture because it already supported the core demonstration flow and avoided introducing a backend that could not be fully verified in the timebox. I rejected broad rewrites and did not claim real-time collaboration or production authentication where the implementation does not provide them.

## Verification

Correctness was checked with focused automated tests for both supported import formats, `npm run lint`, and `npm run build`. The README documents the seeded-user sharing walkthrough and the intentionally deferred capabilities so reviewers can evaluate the product honestly.
