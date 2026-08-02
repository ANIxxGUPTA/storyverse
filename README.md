# StoryVerse
[Live Demo](https://storyverse-ruddy.vercel.app/) | [Repository](https://github.com/ANIxxGUPTA/storyverse)

StoryVerse is an interactive storytelling platform where authors build full-length stories with a drag-and-drop editor, generate AI-assisted chapters, and readers discover content through semantic vector search, all powered by a deeply integrated Node/Express backend running entirely as a single serverless function on Vercel.

## 🛠 Under the Hood
- **Single-Function Serverless API:** The entire Express 5 backend runs on Vercel as a single unified serverless function via rewrites, eliminating the need for a separate backend host.
- **True Semantic Search:** The "Find by Vibe" feature isn't doing keyword matching. It uses Google's `gemini-embedding-001` to generate real vector embeddings stored and searched directly in MongoDB Atlas.
- **Cold-Start Optimized Session Storage:** Passport.js sessions are backed by MongoDB, but explicitly reuse the exact same cached `MongoClient` connection established by the primary Mongoose instance to aggressively cut serverless cold-start latency.

## 🚀 Features

**Discovery & Reading**
- **Semantic "Find by Vibe":** Search for stories by mood, theme, or narrative concept using real Gemini vector embeddings.
- **Curated Genres:** Browse categorized feeds (Fiction, Fantasy, Sci-Fi, Romance) built from live database queries.
- **Rich Markdown Reader:** Clean, readable chapter rendering powered by `react-markdown`, `remark-gfm`, and `rehype-raw`.

**Writing & AI Tools**
- **Interactive Story Builder:** Organize, order, and manage chapters visually using `@dnd-kit/core` drag-and-drop mechanics.
- **AI Co-Writer:** Generate story outlines, draft chapters, and synthesize dynamic cover art via integrated Gemini API endpoints.

**Social & Account**
- **Library & Collections:** Save stories, track reading progress, and build a personal collection.
- **Dashboard:** Monitor authored stories, track likes, and check total views.
- **Session Authentication:** Fully secure local strategy authentication via Passport.js and `bcryptjs`.

## ⚙️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript |
| **Routing & UI** | React Router v7, Tailwind CSS v4, Radix UI / shadcn, Lucide React |
| **Backend** | Node.js, Express 5, TypeScript |
| **Auth & Sessions** | Passport.js (Local), `bcryptjs`, `express-session`, `connect-mongo` |
| **Data & Search** | MongoDB Atlas, Mongoose |
| **AI Integration**| Google Gemini API (`@google/genai`, `gemini-embedding-001`) |
| **Deployment** | Vercel (Serverless Functions), NPM Workspaces Monorepo |

## 🏗 Architecture Request Flow

The repository is structured as an npm workspaces monorepo. The root `vercel.json` configures the static frontend build and routes all backend requests into a single serverless execution environment.

```text
Browser 
  │
  ├─ GET /           → Vercel Edge Cache → Static Frontend (client/)
  │
  └─ GET /api/search → Vercel Serverless (api/index.ts)
                         └─ Express 5 Application 
                              ├─ Passport Auth Middleware
                              └─ Controllers & Services
                                   ├─ Gemini API (Vector Embeddings)
                                   └─ MongoDB Atlas (Vector Search & Data)
```

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

The frontend client will start on `http://localhost:5173`. Open this URL in your browser to view and interact with the running app.
