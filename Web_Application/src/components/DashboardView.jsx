import React, { useState, useEffect } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sprout, 
  TrendingUp, 
  MapPin, 
  CalendarClock, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Radio,
  Loader2
} from "lucide-react";

export default function DashboardView({ user, onNavigate, currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;

  const [weather, setWeather] = useState({
    temperature: "26.8°C",
    humidity: "68%",
    soilMoisture: "22.9%",
    windSpeed: "4.8 km/h"
  });
  const [loadingWeather, setLoadingWeather] = useState(true);

  const fetchWeather = async (lat, lng) => {
    try {
      const data = await api.getWeather(lat, lng);
      setWeather({
        temperature: data.temperature || "26.8°C",
        humidity: data.humidity || "68%",
        soilMoisture: data.soil_moisture || "22.9%",
        windSpeed: data.wind_speed || "4.8 km/h",
      });
    } catch (e) {
      console.warn("Weather fetch error:", e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    let lat = 17.3850;
    let lng = 78.4867;
    if (user?.location && user.location.includes(",")) {
      const parts = user.location.split(",").map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        lat = parts[0];
        lng = parts[1];
      }
    }

    if (navigator.geolocation && (!user?.location || user.location === "17.3850, 78.4867")) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchWeather(lat, lng);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(lat, lng);
    }
  }, [user]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Hero Banner with Weather */}
      <div className="weather-hero">
        <div style={{ maxWidth: "560px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(16, 185, 129, 0.15)", color: "var(--primary-600)", padding: "0.3rem 0.8rem", borderRadius: "var(--radius-full)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            <Radio size={14} className="animate-pulse" />
            <span>Live Farm Weather & Diagnostics</span>
          </div>
          <h1 style={{ fontSize: "2rem", lineHeight: 1.2, marginBottom: "0.5rem" }}>
            {user ? `Namaste, ${user.name}!` : "Welcome to GreenAI Ecosystem"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.96rem" }}>
            {user?.crops 
              ? `Monitoring ${user.crops} on ${user.land_size || "your farm"}. Real-time environmental metrics for active fieldwork.`
              : "Empowering Indian agriculture with AI crop diagnostics, live mandi price forecasts, and collaborative farming tools."}
          </p>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => onNavigate("chat")}>
              <Sprout size={18} />
              <span>{t.askDoctor}</span>
            </button>
            <button className="btn-secondary" onClick={() => onNavigate("market")}>
              <TrendingUp size={18} />
              <span>{t.checkPrices}</span>
            </button>
          </div>
        </div>

        {/* Live Weather Metrics */}
        <div className="weather-stats-row">
          <div className="stat-pill" title="Live Temperature">
            <div className="stat-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--accent-500)" }}>
              <Thermometer size={22} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {loadingWeather ? <Loader2 size={16} className="animate-spin" /> : weather.temperature}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{t.temperature}</div>
            </div>
          </div>

          <div className="stat-pill" title="Live Relative Humidity">
            <div className="stat-icon-wrap" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
              <Droplets size={22} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {loadingWeather ? <Loader2 size={16} className="animate-spin" /> : weather.humidity}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{t.humidity}</div>
            </div>
          </div>

          <div className="stat-pill" title="Volumetric Soil Moisture">
            <div className="stat-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--primary-500)" }}>
              <CloudSun size={22} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {loadingWeather ? <Loader2 size={16} className="animate-spin" /> : weather.soilMoisture}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{t.soilMoisture}</div>
            </div>
          </div>

          <div className="stat-pill" title="Live Wind Velocity">
            <div className="stat-icon-wrap" style={{ background: "rgba(147, 51, 234, 0.15)", color: "#9333ea" }}>
              <Wind size={22} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {loadingWeather ? <Loader2 size={16} className="animate-spin" /> : weather.windSpeed}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{t.windSpeed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>{t.quickActions}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              Comprehensive modules engineered for modern agricultural productivity
            </p>
          </div>
        </div>

        <div className="action-tiles-grid">
          {/* Card 1: GreenAI Doctor */}
          <div className="action-tile" onClick={() => onNavigate("chat")}>
            <div className="action-tile-icon" style={{ background: "linear-gradient(135deg, #10b981, #047857)" }}>
              <Sprout size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>GreenAI Crop Doctor</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Instant pest diagnosis with photo upload, organic remedies, and personalized fertilizer advice.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary-600)", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }}>
              <span>Consult AI Doctor</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 2: Market Forecast */}
          <div className="action-tile" onClick={() => onNavigate("market")}>
            <div className="action-tile-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>Mandi Price Forecast</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                AI price predictions for APMC mandis across India, market trends, and recommended selling windows.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-500)", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }}>
              <span>Analyze Prices</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 3: Live Map */}
          <div className="action-tile" onClick={() => onNavigate("map")}>
            <div className="action-tile-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
              <MapPin size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>Live Agri Map</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Locate nearest APMC mandis, cold storage units, seed centers, and fertilizer depots on OpenStreetMap.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#3b82f6", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }}>
              <span>Explore Map</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 4: Farm Reminders */}
          <div className="action-tile" onClick={() => onNavigate("reminders")}>
            <div className="action-tile-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <CalendarClock size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>Farm Schedules</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Automated scheduling for drip irrigation, spray cycles, fertilizing, and crop harvest timers.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#8b5cf6", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }}>
              <span>Manage Schedules</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 5: Farmer Forum */}
          <div className="action-tile" onClick={() => onNavigate("community")}>
            <div className="action-tile-icon" style={{ background: "linear-gradient(135deg, #ec4899, #be185d)" }}>
              <MessageSquare size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>Farmer Community</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Ask fellow farmers questions, share harvest photos, and discuss real-time weather and pest alerts.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#ec4899", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }}>
              <span>Join Discussion</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 6: Kisan Helplines */}
          <div className="action-tile" onClick={() => onNavigate("helpline")}>
            <div className="action-tile-icon" style={{ background: "linear-gradient(135deg, #14b8a6, #0f766e)" }}>
              <PhoneCall size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>Kisan Helplines</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Direct access to national toll-free agricultural experts, Kisan Call Centre 1800-180-1551, and support.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#14b8a6", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }}>
              <span>Call Experts</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
