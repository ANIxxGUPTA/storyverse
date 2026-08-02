# StoryVerse

**StoryVerse** is an AI-powered, community-driven storytelling platform. Originally built as a monolithic Next.js application, it has been completely re-architected into a decoupled React + Express stack and deployed entirely on Vercel Serverless. StoryVerse differentiates itself by leveraging Google's Gemini API for AI-assisted story generation, chapter expansion, and semantic "Find by Vibe" vector search.

Live Demo: [https://storyverse-ruddy.vercel.app/](https://storyverse-ruddy.vercel.app/)

## 🚀 Key Features
- **Semantic "Find by Vibe" Search:** Find stories based on mood and narrative themes using Gemini embeddings.
- **Discover & Genre Communities:** Browse communities by genre (Fiction, Fantasy, Sci-Fi, Romance, etc.) and explore curated feeds.
- **AI-Assisted Story Creation:** Generate story outlines, chapter drafts, and cover images directly through the `/api/ai` endpoints.
- **Interactive Story Editor:** Build stories visually using a drag-and-drop chapter management system.
- **Library & Collections:** Save stories, track your reading progress, and build your personal collection.
- **Rich Markdown Reading:** Beautifully rendered chapter content with full markdown support.
- **Dashboard & Profiles:** Track your authored stories, likes, and views.

## 🛠 Tech Stack

### Frontend (`client/`)
- **Core:** React 19, Vite, TypeScript
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`, no config file needed)
- **UI Components:** Radix UI + shadcn-style implementation (`class-variance-authority`, `tailwind-merge`, `clsx`), Lucide React (icons)
- **Drag-and-Drop:** `@dnd-kit/core` (with sortable & utilities) for intuitive chapter reordering, actively used in `StoryDetail.tsx` and `ChapterList.tsx`
- **Markdown:** `react-markdown` + `remark-gfm` + `rehype-raw` for chapter rendering and editing, actively used in `ChapterRead.tsx` and `markdown-editor.tsx`

### Backend (`server/`)
- **Core:** Node.js, Express 5, TypeScript
- **Authentication:** Passport.js (`passport-local` strategy) with `bcryptjs` for password hashing
- **Session Management:** `express-session` backed by `connect-mongo` storing sessions in MongoDB
- **Database ODM:** Mongoose with connection caching in `db.ts` to survive serverless cold starts
- **Session Optimization:** The session store explicitly reuses the same Mongoose connection's MongoClient (via `clientPromise: connectDB().then(() => mongoose.connection.getClient())`) to dramatically improve serverless cold start times.

### AI & Embeddings
- **Google Gemini API (`@google/genai`):** Used exclusively in `gemini.service.ts` for text generation/translation, and `embeddings.service.ts` (model: `gemini-embedding-001`) for semantic search vectors. No other local ML library is used.

### Database
- **MongoDB Atlas**

## 🏗 Architecture & Deployment
StoryVerse is deployed as a **single unified Vercel project**. 
The repository is structured as an npm workspaces monorepo (the root `package.json` links the `client/` and `server/` workspaces). 

There is no separate backend host (no Render, no NextAuth). The root `vercel.json` orchestrates the deployment:
1. It builds the `client/` workspace as a static output.
2. It rewrites all `/api/*` routes to `api/index.ts`.
3. `api/index.ts` imports and wraps the entire Express application into one unified serverless function.

*(Migration History: This decoupled architecture fully replaced the legacy Next.js monolith. The old monolithic code is permanently archived under the `legacy-nextjs-final` git tag only. See `docs/MIGRATION.md` for early phase restructuring details.)*

## 💻 Getting Started

### Prerequisites
Make sure you have Node.js installed. Ensure your MongoDB Atlas cluster is running and you have your Google Gemini API key.

### Environment Variables
The application requires the following variables in a `.env` file or in your deployment settings:
```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Local Development
Because this is an npm workspaces monorepo, you can install everything directly from the root:
```bash
# 1. Install dependencies for both client and server workspaces
npm install

# 2. Start the backend server (runs on http://localhost:4000)
cd server
npm run dev

# 3. Start the frontend client (proxy targets localhost:4000 per vite.config.ts)
# In a new terminal:
cd client
npm run dev
```
