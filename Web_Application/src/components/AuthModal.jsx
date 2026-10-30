import React, { useState } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { X, Eye, EyeOff, MapPin, User, Mail, Lock, Phone, Sprout, Layers, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const CROPS_LIST = [
  "Wheat", "Rice", "Cotton", "Sugarcane", "Corn", "Tomato",
  "Potato", "Onion", "Soybean", "Groundnut", "Barley", "Millet", "Chili", "Pulses"
];

const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, currentLang = "English" }) {
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

  if (!isOpen) return null;

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
      setError("Please fill in email and password");
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
        setError("Please enter your name and mobile number");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.login(email.trim(), password);
        setSuccessMsg(res.message || "Logged in successfully!");
        setTimeout(() => {
          onAuthSuccess({ email: email.trim(), name: res.name || email.split("@")[0] });
          onClose();
        }, 600);
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
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem" }}>{isLogin ? t.login : t.signup}</h2>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
              {isLogin ? "Sign in to access your farm intelligence" : "Join thousands of smart farmers using GreenAI"}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", background: "var(--surface-hover)", padding: "0.3rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            style={{
              flex: 1,
              padding: "0.55rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: isLogin ? "var(--surface-card)" : "transparent",
              color: isLogin ? "var(--primary-600)" : "var(--text-muted)",
              fontWeight: 700,
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
              padding: "0.55rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: !isLogin ? "var(--surface-card)" : "transparent",
              color: !isLogin ? "var(--primary-600)" : "var(--text-muted)",
              fontWeight: 700,
              boxShadow: !isLogin ? "var(--shadow-sm)" : "none",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            {t.signup}
          </button>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", fontSize: "0.88rem", fontWeight: 600 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--primary-600)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", fontSize: "0.88rem", fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t.fullName}</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.enterFullName}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
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
                  placeholder="Repeat your password"
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
            style={{ width: "100%", marginTop: "0.75rem", padding: "0.85rem" }}
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
      </div>
    </div>
  );
}
