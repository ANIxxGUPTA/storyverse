# StoryVerse 📚✍️

Welcome to **StoryVerse**, a modern full-stack web application designed for self-publishing stories, writing chapters, reading user-submitted tales, and sharing text updates on a community feed. 

It is designed with a sleek dark-mode-first aesthetic (similar to a blend between Wattpad and Instagram, but simplified and streamlined).

---

## 🔗 Live Site & Repository

* **Live Deployment**: [storyverse-ruddy.vercel.app](https://storyverse-ruddy.vercel.app/)
* **GitHub Repository**: [ANIxxGUPTA/storyverse](https://github.com/ANIxxGUPTA/storyverse)

---

## 🚀 Key Features

* **Discover Stories**: A single, clean, chronological gallery grid of published stories from users.
* **Unified Workspace (Dashboard)**: A single view containing:
  * **User Profile Sidebar**: Displays username, avatar, and custom bio (with full client-side edit capabilities).
  * **Creation Panel**: Quick-access shortcuts to compose new stories or publish feed posts.
  * **Tabs Workspace**: Convenient tabs to toggle between viewing "My Stories" and "My Feed Posts".
* **Interactive Story Reader**: Elegant, Wattpad-inspired reading interface designed for focus and serial chapter progression.
* **Text-Only Social Feed**: A simplified, distraction-free social feed where creators can publish microblog updates, release announcements, or thoughts.
* **Secure Auth Integration**: Full credential authentication (Sign Up / Login / Session persistence) utilizing **NextAuth.js**.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [Next.js (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (with [Mongoose](https://mongoosejs.com/) schemas)
* **Authentication**: [NextAuth.js](https://next-auth.js.org/)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started & Installation

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/ANIxxGUPTA/storyverse.git
cd storyverse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure local environment variables
Create a `.env.local` file in the root of the project and define the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_jwt_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

---

## 🐳 Deploying to Vercel

The application is configured to deploy directly to Vercel. 
Simply import your GitHub repository, add the production environment variables (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`), and click deploy!
