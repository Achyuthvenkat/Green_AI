import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  User, 
  Loader2, 
  Sparkles,
  Radio
} from "lucide-react";

export default function CommunityView({ user, onOpenAuth, currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [posting, setPosting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await api.getMessages();
      setMessages(data);
    } catch (err) {
      console.warn("Error fetching community messages:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);

    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    const text = inputText.trim();
    setInputText("");
    setPosting(true);

    // Optimistic item
    const tempMsg = {
      id: Date.now(),
      name: user.name || "Farmer",
      message: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.sendMessage(user.name || user.email, text);
      fetchMessages(false);
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setPosting(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "Just now";
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + d.toLocaleDateString();
    } catch {
      return ts;
    }
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare size={26} color="var(--primary-600)" />
            <span>{t.communityTitle}</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {t.communitySubtitle}
          </p>
        </div>

        {/* Live sync pill & manual refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.82rem",
              borderColor: autoRefresh ? "var(--primary-400)" : "var(--border-subtle)",
              color: autoRefresh ? "var(--primary-600)" : "var(--text-muted)"
            }}
          >
            <Radio size={14} className={autoRefresh ? "animate-pulse" : ""} />
            <span>{autoRefresh ? "Live Sync Active" : "Sync Paused"}</span>
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => fetchMessages(false)}
            title="Refresh Messages"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Discussion Chat Container */}
      <div className="card-glass" style={{ padding: 0, height: "620px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Messages feed */}
        <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem", background: "var(--bg-app)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: "0 auto" }} />
              <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>Loading farmer discussions...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
              <MessageSquare size={44} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <h4>No discussion posts yet</h4>
              <p style={{ fontSize: "0.88rem" }}>Be the first farmer to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = user && (user.name === msg.name || user.email === msg.name);
              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    flexDirection: isCurrentUser ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: isCurrentUser ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    {msg.name ? msg.name[0].toUpperCase() : <User size={16} />}
                  </div>

                  <div
                    style={{
                      background: isCurrentUser ? "rgba(16, 185, 129, 0.15)" : "var(--surface-card)",
                      border: isCurrentUser ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-lg)",
                      padding: "0.85rem 1.15rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.86rem", color: isCurrentUser ? "var(--primary-600)" : "var(--text-main)" }}>
                        {msg.name} {isCurrentUser && "(You)"}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "var(--text-main)", lineHeight: 1.5, wordBreak: "break-word" }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: "1rem 1.25rem",
            background: "var(--surface-card)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={user ? t.writeMessage : "Please log in to participate in the farmer forum"}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={posting}
            style={{ flex: 1 }}
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={posting || !inputText.trim()}
            style={{ padding: "0.75rem 1.25rem" }}
          >
            {posting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={18} />
                <span>{t.postMessage}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
