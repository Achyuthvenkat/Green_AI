import React, { useState } from "react";
import { translations } from "../translations";
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Volume2, 
  ShieldCheck, 
  Database, 
  Info, 
  Check, 
  Smartphone 
} from "lucide-react";

const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];

export default function SettingsView({ theme, toggleTheme, currentLang, setCurrentLang }) {
  const t = translations[currentLang] || translations.English;

  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Settings size={28} color="var(--primary-600)" />
          <span>Application Settings & Preferences</span>
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Customize your interface, alerts, localization, and system connectivity
        </p>
      </div>

      {/* Settings Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Appearance & Localization */}
        <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Globe size={20} color="var(--primary-600)" />
            <span>Localization & Interface</span>
          </h3>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Display Language</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Select your preferred regional language across all screens
              </div>
            </div>
            <select
              className="select-clean"
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Color Theme</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Switch between modern Dark Slate and clean Light Mode
              </div>
            </div>
            <button className="btn-secondary" onClick={toggleTheme} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* Notifications & Audio */}
        <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={20} color="var(--accent-500)" />
            <span>Notifications & Farm Schedules</span>
          </h3>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Farm Operation Reminders</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Receive audio-visual browser reminders for irrigation and spraying schedules
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{ width: "20px", height: "20px", accentColor: "var(--primary-600)", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Audio Alerts</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Play chime sounds for incoming community messages and critical alerts
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              style={{ width: "20px", height: "20px", accentColor: "var(--primary-600)", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Shared Database & Backend Status */}
        <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={20} color="#3b82f6" />
            <span>Shared Database & Architecture</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "var(--surface-hover)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                Active SQLite Database
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--text-main)" }}>
                instance/greenai.db
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--primary-600)", marginTop: "0.25rem", fontWeight: 700 }}>
                ● Shared with Mobile App
              </div>
            </div>

            <div style={{ background: "var(--surface-hover)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                API Server Host
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--text-main)" }}>
                http://127.0.0.1:8080
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--primary-600)", marginTop: "0.25rem", fontWeight: 700 }}>
                ● Flask REST API Connected
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            All farmer profiles, chat discussions, schedules, and active sessions created in this Web Application are instantly accessible from the Flutter mobile app and vice versa.
          </div>
        </div>

        {/* About App */}
        <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.05rem" }}>
            <Info size={18} color="var(--text-muted)" />
            <span>About GreenAI Web Platform</span>
          </div>
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            GreenAI v2.0 - Unified Web & Mobile Agricultural Intelligence Platform. Designed to optimize farmer profitability, soil health, and resource conservation across India.
          </p>
        </div>
      </div>
    </div>
  );
}
