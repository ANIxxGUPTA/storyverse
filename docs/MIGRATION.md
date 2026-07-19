# Architecture Migration

## PHASE 0 — Repo Restructure & Scaffolding

### Objective
Convert the single Next.js repo into a monorepo skeleton (`/client`, `/server`) without touching any working functionality yet. The existing Next.js app keeps running untouched during this phase; new folders are additive.

### Folder Structure (target end-state after Phase 0)
```
storyverse/
├── client/                      # NEW — will hold Vite React app (Phase 4)
├── server/                      # NEW — Express API
│   ├── src/
│   │   ├── index.ts             # entrypoint
│   │   ├── config/
│   │   │   └── db.ts            # mongoose connection
│   │   ├── models/              # (empty for now, filled Phase 3)
│   │   ├── routes/              # (empty for now)
│   │   ├── middleware/          # (empty for now)
│   │   └── controllers/         # (empty for now)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── legacy-nextjs/               # RENAMED — old app moved here, still deployable, untouched
│   └── ...(existing src/, public/, package.json, etc. moved as-is)
├── docs/
│   └── MIGRATION.md             # this document, versioned in repo
├── .gitignore
└── README.md                    # updated to describe new architecture
```

### Deliverables
- Working Express server that connects to the existing Mongo Atlas cluster and responds on `/health`.
- Old Next.js app fully intact and running from `legacy-nextjs/`.
- Updated README describing the two-track state.
