import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

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
          <Routes>
            <Route element={<Layout />}>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
