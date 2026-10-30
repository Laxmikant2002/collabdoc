# Submission Contents

Included in this repository:

- Source code under `src/`
- Local setup and verification instructions in `README.md`
- Architecture decisions in `ARCHITECTURE.md`
- AI workflow note in `AI_WORKFLOW.md`
- This submission manifest in `SUBMISSION.md`
- Walkthrough video placeholder in `WALKTHROUGH_VIDEO.txt`

## Review access

- Local command: `npm install && npm run dev`
- Demo users: Alice Chen, Bob Miller, and Charlie Davis
- Sharing walkthrough: documented in `README.md`
- No password or paid service is required.

## Deployment status

The application is production-buildable with `npm run build` and is ready for static hosting. A live deployment URL and walkthrough video URL must be added to `WALKTHROUGH_VIDEO.txt` and this file before final submission; they cannot be generated from the source repository alone.

## Known limitations

- Persistence is browser-local, not a shared server database.
- Authentication is a seeded-user switcher for demonstration.
- Real-time multi-user editing, `.docx` import, and server-side authorization are not included.

## Next 2-4 hours

Add a small API backed by SQLite/Postgres, replace the user switcher with session auth, add optimistic synchronization/conflict handling, and deploy the frontend plus API with reviewer credentials.
