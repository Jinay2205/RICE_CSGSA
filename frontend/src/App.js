import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";

// Pages
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import LeadershipPage from "@/pages/LeadershipPage";
import LoginPage from "@/pages/LoginPage";
import AdminPage from "@/pages/AdminPage";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
// export const API = `${BACKEND_URL}/api`;
export const API = "/api";

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Theme Context
export const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'light', toggleTheme: () => {} };
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Admin Layout (no footer)
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.valid) {
            setIsAuthenticated(true);
            setUser({ username: response.data.username });
          }
        } catch (error) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Seed data on first load
  useEffect(() => {
    const seedData = async () => {
      try {
        await axios.post(`${API}/seed`);
      } catch (error) {
        console.log("Seed data already exists or error:", error.message);
      }
    };
    seedData();
  }, []);

  const login = async (username, password) => {
    const response = await axios.post(`${API}/auth/login`, { username, password });
    localStorage.setItem('token', response.data.token);
    setIsAuthenticated(true);
    setUser({ username: response.data.username });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/events" element={<Layout><EventsPage /></Layout>} />
              <Route path="/leadership" element={<Layout><LeadershipPage /></Layout>} />
              <Route path="/login" element={<Layout><LoginPage /></Layout>} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminLayout><AdminPage /></AdminLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
