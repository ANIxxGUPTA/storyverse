import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";

import Search from "./pages/Search";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import StoryDetail from "./pages/StoryDetail";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import StoryEditor from "./pages/StoryEditor";
const NotFound = () => <div className="p-10">404 Not Found</div>;

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="storyverse-theme">
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50 selection:bg-blue-200 dark:selection:bg-blue-900">
            
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 bg-white dark:bg-zinc-950">
              <div className="absolute top-0 -left-1/4 h-[50vh] w-[50vw] rounded-full bg-blue-100/40 blur-[100px] dark:bg-blue-900/20" />
              <div className="absolute bottom-0 -right-1/4 h-[50vh] w-[50vw] rounded-full bg-indigo-100/40 blur-[100px] dark:bg-indigo-900/20" />
            </div>

            <Navbar />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:genre" element={<CommunityDetail />} />
              <Route path="/stories/:id" element={<StoryDetail />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/stories/:id/edit" element={<ProtectedRoute><StoryEditor /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
