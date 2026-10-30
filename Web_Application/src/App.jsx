import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import GreenAIChatView from "./components/GreenAIChatView";
import MarketPriceView from "./components/MarketPriceView";
import LiveMapView from "./components/LiveMapView";
import RemindersView from "./components/RemindersView";
import CommunityView from "./components/CommunityView";
import HelplineView from "./components/HelplineView";
import SettingsView from "./components/SettingsView";
import AuthView from "./components/AuthView";
import ProfileModal from "./components/ProfileModal";
import { api } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState(() => localStorage.getItem("greenai_theme") || "light");
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("greenai_lang") || "English");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("greenai_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("greenai_theme", theme);
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem("greenai_lang", currentLang);
  }, [currentLang]);

  // Sync active user details only if already logged in with a saved email
  useEffect(() => {
    if (user?.email) {
      api.getUserDetails(user.email)
        .then((fullData) => {
          if (fullData) {
            const merged = { ...user, ...fullData };
            setUser(merged);
            localStorage.setItem("greenai_user", JSON.stringify(merged));
          }
        })
        .catch((err) => {
          console.warn("Could not sync latest user data:", err);
        });
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleAuthSuccess = async (authUser) => {
    try {
      const fullData = await api.getUserDetails(authUser.email);
      const finalUser = { ...authUser, ...fullData };
      setUser(finalUser);
      localStorage.setItem("greenai_user", JSON.stringify(finalUser));
    } catch {
      setUser(authUser);
      localStorage.setItem("greenai_user", JSON.stringify(authUser));
    }
    setActiveTab("home");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("greenai_user");
    setActiveTab("home");
  };

  const handleUpdateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("greenai_user", JSON.stringify(updated));
  };

  // If user is not logged in, directly show the Login & Sign Up screen!
  if (!user) {
    return (
      <AuthView
        onAuthSuccess={handleAuthSuccess}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Once authenticated, show the full application ecosystem
  return (
    <div className="app-wrapper">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => {}}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
      />

      {/* Main Tab Screen View */}
      <main className="main-content">
        {activeTab === "home" && (
          <DashboardView
            user={user}
            onNavigate={(tab) => setActiveTab(tab)}
            currentLang={currentLang}
          />
        )}

        {activeTab === "chat" && (
          <GreenAIChatView
            user={user}
            currentLang={currentLang}
          />
        )}

        {activeTab === "market" && (
          <MarketPriceView
            currentLang={currentLang}
          />
        )}

        {activeTab === "map" && (
          <LiveMapView
            user={user}
            currentLang={currentLang}
          />
        )}

        {activeTab === "reminders" && (
          <RemindersView
            user={user}
            currentLang={currentLang}
          />
        )}

        {activeTab === "community" && (
          <CommunityView
            user={user}
            onOpenAuth={() => {}}
            currentLang={currentLang}
          />
        )}

        {activeTab === "helpline" && (
          <HelplineView
            currentLang={currentLang}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            theme={theme}
            toggleTheme={toggleTheme}
            currentLang={currentLang}
            setCurrentLang={setCurrentLang}
          />
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        currentLang={currentLang}
      />

      {/* Footer */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", padding: "1.5rem", background: "var(--surface-card)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.86rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: 800, color: "var(--primary-600)" }}>GreenAI Ecosystem</span>
            <span>• Integrated Web & Mobile Agricultural Platform</span>
          </div>
          <div>
            Connected SQLite Database: <code style={{ background: "var(--surface-hover)", padding: "0.2rem 0.4rem", borderRadius: "4px", color: "var(--text-main)" }}>instance/greenai.db</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
