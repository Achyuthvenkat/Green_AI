import React, { useState } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  Sprout, 
  Eye, 
  EyeOff, 
  MapPin, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Leaf
} from "lucide-react";

const CROPS_LIST = [
  "Wheat", "Rice", "Cotton", "Sugarcane", "Corn", "Tomato",
  "Potato", "Onion", "Soybean", "Groundnut", "Barley", "Millet", "Chili", "Pulses"
];

const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];

export default function AuthView({ onAuthSuccess, currentLang = "English", setCurrentLang, theme, toggleTheme }) {
  const t = translations[currentLang] || translations.English;
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [language, setLanguage] = useState(currentLang);
  const [location, setLocation] = useState("");
  const [landSize, setLandSize] = useState("");
  const [selectedCrops, setSelectedCrops] = useState(["Wheat", "Rice"]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        setError("Unable to retrieve GPS coordinates. Please type manually.");
      }
    );
  };

  const toggleCrop = (crop) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== crop));
      }
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!name || !mobile) {
        setError("Please enter your full name and mobile number");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.login(email.trim(), password);
        setSuccessMsg(res.message || "Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          onAuthSuccess({ email: email.trim(), name: res.name || email.split("@")[0] });
        }, 500);
      } else {
        const userData = {
          name: name.trim(),
          email: email.trim(),
          password,
          mobile: mobile.trim(),
          language,
          location: location || "17.3850, 78.4867",
          crops: selectedCrops.join(", "),
          land_size: landSize ? `${landSize} Acres` : "5 Acres",
        };
        await api.signup(userData);
        setSuccessMsg("Account created successfully! Logging you in...");
        setTimeout(() => {
          onAuthSuccess({ email: userData.email, name: userData.name });
        }, 700);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)", backgroundImage: "var(--bg-gradient)" }}>
      {/* Top Header */}
      <header style={{ padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-card-blur)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="brand-logo-icon">
            <Sprout size={24} />
          </div>
          <div>
            <div className="brand-title">GreenAI</div>
            <div className="brand-tagline">Farmer Ecosystem</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <select 
            className="select-clean"
            value={currentLang} 
            onChange={(e) => setCurrentLang(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
        <div className="card-glass" style={{ maxWidth: "520px", width: "100%", padding: "2.5rem 2rem", boxShadow: "var(--shadow-xl)" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ width: "54px", height: "54px", margin: "0 auto 0.75rem", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)" }}>
              <Leaf size={28} />
            </div>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.3rem" }}>
              {isLogin ? "Farmer Sign In" : "Register Farm Account"}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {isLogin 
                ? "Enter your credentials to access farm analytics and crop advisory" 
                : "Create a new profile sharing data with your mobile app"}
            </p>
          </div>

          {/* Tab Selector */}
          <div style={{ display: "flex", background: "var(--surface-hover)", padding: "0.35rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); }}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: isLogin ? "var(--surface-card)" : "transparent",
                color: isLogin ? "var(--primary-600)" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.92rem",
                boxShadow: isLogin ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); }}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: !isLogin ? "var(--surface-card)" : "transparent",
                color: !isLogin ? "var(--primary-600)" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.92rem",
                boxShadow: !isLogin ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              {t.signup}
            </button>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", fontSize: "0.88rem", fontWeight: 600 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--primary-600)", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", fontSize: "0.88rem", fontWeight: 600 }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">{t.fullName}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.enterFullName}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.email}</label>
              <input
                type="email"
                className="form-input"
                placeholder={t.enterEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">{t.mobile}</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t.enterMobile}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder={t.enterPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">{t.confirmPassword}</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.selectLanguage}</label>
                  <select
                    className="form-input select-clean"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.farmLocation}</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Latitude, Longitude (e.g. 17.3850, 78.4867)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleDetectLocation}
                      style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem" }}
                    >
                      <MapPin size={16} /> {t.detectLocation}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.crops}</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                    {CROPS_LIST.map((crop) => {
                      const isSelected = selectedCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          style={{
                            padding: "0.3rem 0.75rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            border: isSelected ? "1px solid var(--primary-500)" : "1px solid var(--border-subtle)",
                            background: isSelected ? "rgba(16, 185, 129, 0.15)" : "var(--surface-hover)",
                            color: isSelected ? "var(--primary-600)" : "var(--text-main)",
                            cursor: "pointer",
                            transition: "var(--transition)"
                          }}
                        >
                          {crop} {isSelected && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.landSize}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t.enterLandSize}
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: "1.25rem", padding: "0.85rem", fontSize: "0.96rem" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? t.signIn : t.createAccount}</span>
              )}
            </button>
          </form>

          {/* Switcher Footer */}
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}{" "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--primary-600)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
            >
              {isLogin ? t.signup : t.login}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "1.25rem 2rem", textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
        GreenAI Unified Platform • Connected to SQLite Database <code>instance/greenai.db</code>
      </footer>
    </div>
  );
}
