import React from "react";
import { translations } from "../translations";
import { 
  Sprout, 
  LayoutDashboard, 
  Bot, 
  TrendingUp, 
  Map, 
  CalendarClock, 
  MessageSquare, 
  PhoneCall, 
  Settings, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  User 
} from "lucide-react";

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenProfile,
  theme, 
  toggleTheme, 
  currentLang, 
  setCurrentLang 
}) {
  const t = translations[currentLang] || translations.English;

  const navItems = [
    { id: "home", label: t.navHome, icon: LayoutDashboard },
    { id: "chat", label: t.navChat, icon: Bot },
    { id: "market", label: t.navMarket, icon: TrendingUp },
    { id: "map", label: t.navMap, icon: Map },
    { id: "reminders", label: t.navReminders, icon: CalendarClock },
    { id: "community", label: t.navCommunity, icon: MessageSquare },
    { id: "helpline", label: t.navHelpline, icon: PhoneCall },
    { id: "settings", label: t.navSettings, icon: Settings },
  ];

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand-section" onClick={() => setActiveTab("home")}>
          <div className="brand-logo-icon">
            <Sprout size={24} />
          </div>
          <div>
            <div className="brand-title">GreenAI</div>
            <div className="brand-tagline">Farmer Ecosystem</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="nav-controls">
          {/* Language Selector */}
          <select 
            className="select-clean"
            value={currentLang} 
            onChange={(e) => setCurrentLang(e.target.value)}
            title="Choose Language"
          >
            <option value="English">English</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
          </select>

          {/* Theme Toggle */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Status / Login */}
          {user ? (
            <div className="user-badge-pill" onClick={onOpenProfile} title="View Farmer Profile">
              <div className="user-avatar-mini">
                {user.name ? user.name[0].toUpperCase() : <User size={14} />}
              </div>
              <span className="user-badge-text">{user.name || user.email}</span>
              <button
                type="button"
                className="btn-icon"
                style={{ width: "26px", height: "26px", border: "none", background: "transparent" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                title={t.logout}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={onOpenAuth} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              <LogIn size={16} />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
