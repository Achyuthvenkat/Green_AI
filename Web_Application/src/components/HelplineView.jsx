import React, { useState } from "react";
import { translations } from "../translations";
import { 
  PhoneCall, 
  Copy, 
  Check, 
  Headphones, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  HelpCircle,
  ExternalLink
} from "lucide-react";

const HELPLINES = [
  {
    id: "kcc",
    title: "Kisan Call Centre (KCC)",
    number: "1800-180-1551",
    rawNumber: "18001801551",
    desc: "National 24/7 toll-free service answering farmer queries in 22 local Indian languages with agriculture scientists.",
    badge: "Official Govt 24/7",
    color: "#10b981",
  },
  {
    id: "general",
    title: "General Agriculture Advisory Helpline",
    number: "1800-123-4567",
    rawNumber: "18001234567",
    desc: "Support for fertilizer subsidy, seed availability, and local mandi transport facilitation.",
    badge: "Toll Free",
    color: "#3b82f6",
  },
  {
    id: "crop_insurance",
    title: "PM Fasal Bima Yojana (Crop Insurance)",
    number: "1800-200-5142",
    rawNumber: "18002005142",
    desc: "Report crop damage from unseasonal rainfall, drought, floods, or pests for claim registration.",
    badge: "Crop Damage & Claims",
    color: "#f59e0b",
  },
  {
    id: "private",
    title: "GreenAI Dedicated Agronomist Expert",
    number: "+91 98765 43210",
    rawNumber: "+919876543210",
    desc: "Direct consultation with GreenAI certified agronomists for customized soil health and crop treatment plans.",
    badge: "Specialist On-Call",
    color: "#8b5cf6",
  },
];

export default function HelplineView({ currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, num) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PhoneCall size={28} color="var(--primary-600)" />
          <span>{t.helplineTitle}</span>
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          {t.helplineDesc}
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", flexShrink: 0 }}>
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: "1.02rem", color: "#b45309", marginBottom: "0.2rem" }}>
            24/7 Immediate Emergency Assistance
          </h4>
          <p style={{ fontSize: "0.86rem", color: "var(--text-main)", lineHeight: 1.4 }}>
            For unseasonal crop damage, locust outbreaks, or urgent pesticide poisoning emergencies, dial <strong>1800-180-1551</strong> immediately. All calls are toll-free and recorded for quality.
          </p>
        </div>
      </div>

      {/* Helplines List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "1.25rem" }}>
        {HELPLINES.map((item) => (
          <div key={item.id} className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: `${item.color}20`, color: item.color, padding: "0.25rem 0.65rem", borderRadius: "var(--radius-full)", fontSize: "0.78rem", fontWeight: 700 }}>
                <Headphones size={13} /> {item.badge}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.35rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>

            {/* Big Phone Number Display */}
            <div style={{ background: "var(--surface-hover)", padding: "0.85rem 1.25rem", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-main)" }}>
                {item.number}
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => handleCopy(item.id, item.number)}
                title={t.copyNumber}
              >
                {copiedId === item.id ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
              <a
                href={`tel:${item.rawNumber}`}
                className="btn-primary"
                style={{ flex: 1, textDecoration: "none" }}
              >
                <PhoneCall size={17} />
                <span>{t.callNow}</span>
              </a>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopy(item.id, item.number)}
              >
                {copiedId === item.id ? (
                  <>
                    <Check size={16} color="#10b981" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{t.copyNumber}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
