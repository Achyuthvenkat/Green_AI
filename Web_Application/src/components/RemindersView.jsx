import React, { useState, useEffect } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Droplet, 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Loader2, 
  X,
  AlertCircle
} from "lucide-react";

const REMINDER_TYPES = [
  "Irrigation", "Fertilization", "Pesticide Spray", "Harvesting",
  "Planting", "Pruning", "Soil Testing", "General Farm Care"
];

const CROPS = [
  "Wheat", "Rice", "Cotton", "Sugarcane", "Corn", "Tomato",
  "Potato", "Onion", "Soybean", "Groundnut", "Chili", "Barley"
];

const INTERVALS = ["Once", "Daily", "Weekly", "Bi-weekly", "Monthly"];

export default function RemindersView({ user, currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New Reminder State
  const [reminderType, setReminderType] = useState("Irrigation");
  const [cropType, setCropType] = useState("Wheat");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("06:30");
  const [intervalType, setIntervalType] = useState("Daily");
  const [submitting, setSubmitting] = useState(false);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await api.getReminders(user?.id || 1);
      setReminders(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reminders from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Backend expects date in DD/MM/YYYY
    const [year, month, day] = date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    try {
      await api.createReminder({
        reminder_type: reminderType,
        crop_type: cropType,
        date: formattedDate,
        time: time,
        interval_type: intervalType,
        user_id: user?.id || 1,
      });

      setSuccess("Reminder scheduled successfully!");
      setShowAddModal(false);
      loadReminders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to schedule reminder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await api.deleteReminder(id);
      setReminders(reminders.filter((r) => r.id !== id));
      setSuccess("Reminder removed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete reminder");
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case "Irrigation":
        return <Droplet size={20} color="#3b82f6" />;
      case "Fertilization":
        return <Sparkles size={20} color="#10b981" />;
      case "Pesticide Spray":
        return <AlertCircle size={20} color="#f59e0b" />;
      default:
        return <CalendarClock size={20} color="#8b5cf6" />;
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarClock size={26} color="var(--primary-600)" />
            <span>{t.remindersTitle}</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Synchronized with the shared database for timely agricultural alerts and watering schedules
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>{t.addReminder}</span>
        </button>
      </div>

      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 1.25rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--primary-600)", borderRadius: "var(--radius-md)", fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 1.25rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderRadius: "var(--radius-md)", fontWeight: 600 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Reminders List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: "0 auto" }} />
          <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>Loading farm schedules...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="card-glass" style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}>
          <CalendarClock size={48} color="var(--text-light)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{t.noReminders}</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 1.5rem", fontSize: "0.88rem" }}>
            Set recurring alerts for irrigation, pesticide spraying, weed management, and harvest deadlines.
          </p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Create First Schedule</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {reminders.map((r) => (
            <div key={r.id} className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--primary-500)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {getReminderIcon(r.reminder_type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.05rem" }}>{r.reminder_type}</h4>
                    <span style={{ fontSize: "0.78rem", color: "var(--primary-600)", fontWeight: 700 }}>{r.crop_type}</span>
                  </div>
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteReminder(r.id)}
                  title="Delete Reminder"
                  style={{ padding: "0.35rem 0.5rem" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.84rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <CalendarIcon size={14} />
                  <span>{r.date}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Clock size={14} />
                  <span>{r.time}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)", fontSize: "0.78rem" }}>
                <span style={{ background: "var(--surface-hover)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
                  🔁 {r.interval_type}
                </span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>● Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.3rem" }}>Add Farm Operation Reminder</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReminder}>
              <div className="form-group">
                <label className="form-label">{t.reminderType}</label>
                <select
                  className="form-input select-clean"
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                >
                  {REMINDER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.cropType}</label>
                <select
                  className="form-input select-clean"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">{t.date}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.time}</label>
                  <input
                    type="time"
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.interval}</label>
                <select
                  className="form-input select-clean"
                  value={intervalType}
                  onChange={(e) => setIntervalType(e.target.value)}
                >
                  {INTERVALS.map((intv) => (
                    <option key={intv} value={intv}>{intv}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowAddModal(false)}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
