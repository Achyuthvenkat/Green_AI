import React, { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  Send, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw,
  X
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  "How to identify and treat fall armyworm in corn?",
  "What is the best organic fertilizer schedule for wheat?",
  "My tomato plants have yellow leaves with brown spots, what should I do?",
  "Recommended drip irrigation water requirements for cotton",
  "How to manage stem borer in paddy rice organically?"
];

export default function GreenAIChatView({ user, currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hello ${user ? user.name : "Farmer"}! I am GreenAI, your dedicated agricultural expert.\n\nAsk me anything about your crops, pest control, soil fertility, fertilizer schedules, or upload a photo of an affected plant leaf for automated disease diagnosis!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // base64
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      // Strip data:image/...;base64, prefix for the raw base64 or pass full string
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (customPrompt) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() && !selectedImage) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: promptToSend,
      image: imagePreview,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    const imgToSend = selectedImage;
    handleClearImage();
    setLoading(true);

    try {
      const reply = await api.sendChatMessage(promptToSend, imgToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: `⚠️ Error: ${err.message || "Failed to reach GreenAI server"}. Please ensure your network connection and server are running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bot size={26} color="var(--primary-600)" />
            <span>GreenAI Crop Doctor & Advisor</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Powered by high-precision Agricultural LLM and Crop Vision Diagnostics
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setMessages([
              {
                id: Date.now(),
                sender: "bot",
                text: "Chat cleared. What can I help you with regarding your crops today?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }}
          style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}
        >
          <RefreshCw size={15} /> Reset Chat
        </button>
      </div>

      <div className="chat-container">
        {/* Quick Suggestion Chips */}
        <div className="quick-prompts-row">
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", alignSelf: "center", fontWeight: 700 }}>
            <Sparkles size={14} style={{ display: "inline", marginRight: "4px" }} /> Suggestions:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSend(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.sender}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", opacity: 0.85, fontSize: "0.76rem" }}>
                {m.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
                <span style={{ fontWeight: 700 }}>{m.sender === "bot" ? "GreenAI" : user ? user.name : "You"}</span>
                <span>• {m.timestamp}</span>
              </div>
              <div>{m.text}</div>
              {m.image && (
                <img src={m.image} alt="Uploaded Crop Sample" className="preview" />
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble bot" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Loader2 size={18} className="animate-spin" color="var(--primary-600)" />
              <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                GreenAI is analyzing agricultural knowledge & generating advice...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview Thumbnail if attached */}
        {imagePreview && (
          <div style={{ padding: "0.75rem 1.5rem", background: "var(--surface-hover)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <img src={imagePreview} alt="Selected" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "2px solid var(--primary-500)" }} />
              <button
                type="button"
                onClick={handleClearImage}
                style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", background: "#ef4444", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={12} />
              </button>
            </div>
            <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
              Crop photo attached for Vision diagnosis. Type any additional symptoms and click send.
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="btn-icon"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Crop Photo for Leaf Diagnosis"
          >
            <ImageIcon size={20} />
          </button>

          <input
            type="text"
            className="chat-input-field"
            placeholder={t.chatPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "0.75rem 1.25rem" }}
            disabled={loading || (!inputText.trim() && !selectedImage)}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
