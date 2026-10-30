import React, { useState, useEffect } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Sprout, 
  Layers, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser, currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [language, setLanguage] = useState(currentLang);
  const [location, setLocation] = useState("");
  const [crops, setCrops] = useState("");
  const [landSize, setLandSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setMobile(user.mobile || "");
      setLanguage(user.language || currentLang);
      setLocation(user.location || "");
      setCrops(user.crops || "");
      setLandSize(user.land_size || "");
    }
  }, [user, currentLang]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedData = {
        name: name.trim(),
        mobile: mobile.trim(),
        language,
        location: location.trim(),
        crops: crops.trim(),
        land_size: landSize.trim(),
      };

      const res = await api.updateUserProfile(updatedData, user.email);
      setSuccess("Farmer profile updated in database successfully!");
      onUpdateUser({ ...user, ...updatedData });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.45rem" }}>{t.editProfile}</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Changes synchronize directly with the GreenAI database
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.86rem", fontWeight: 600 }}>
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--primary-600)", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.86rem", fontWeight: 600 }}>
            <CheckCircle2 size={17} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">{t.fullName}</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.email} (Registered ID)</label>
            <input
              type="email"
              className="form-input"
              value={user.email}
              disabled
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.mobile}</label>
            <input
              type="tel"
              className="form-input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
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
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 17.3850, 78.4867"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.crops}</label>
            <input
              type="text"
              className="form-input"
              value={crops}
              onChange={(e) => setCrops(e.target.value)}
              placeholder="e.g. Wheat, Rice, Cotton"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.landSize}</label>
            <input
              type="text"
              className="form-input"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              placeholder="e.g. 5 Acres"
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{t.saveChanges}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
