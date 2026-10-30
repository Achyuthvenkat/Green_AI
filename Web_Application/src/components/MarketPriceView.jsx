import React, { useState } from "react";
import { api } from "../api";
import { translations } from "../translations";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  IndianRupee, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  Loader2,
  Scale
} from "lucide-react";

const CROPS = [
  "Wheat", "Rice", "Cotton", "Sugarcane", "Corn", "Barley",
  "Tomato", "Onion", "Potato", "Soybean", "Groundnut", "Chili", "Mustard"
];

const LOCATIONS = [
  "Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Gujarat",
  "Rajasthan", "Karnataka", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Madhya Pradesh"
];

export default function MarketPriceView({ currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;

  const [crop, setCrop] = useState("Wheat");
  const [location, setLocation] = useState("Punjab");
  const [quantity, setQuantity] = useState("25");
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const res = await api.predictPrice({
        crop,
        location,
        quantity: quantity || "10",
        date,
      });
      setPrediction(res);
    } catch (err) {
      setError(err.message || "Failed to generate market prediction");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (!trend) return <Minus size={20} />;
    const lower = trend.toLowerCase();
    if (lower.includes("bull") || lower.includes("up")) {
      return <TrendingUp size={22} color="#10b981" />;
    }
    if (lower.includes("bear") || lower.includes("down")) {
      return <TrendingDown size={22} color="#ef4444" />;
    }
    return <Minus size={22} color="#f59e0b" />;
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={28} color="var(--accent-500)" />
          <span>Mandi Price AI Forecaster</span>
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Predict commodity prices across APMC mandis using seasonal dynamics, arrival volumes, and historical patterns
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem" }}>
        {/* Form Panel */}
        <div style={{ gridColumn: "span 5" }} className="card-glass">
          <h3 style={{ fontSize: "1.15rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Scale size={20} color="var(--primary-600)" />
            <span>Forecast Parameters</span>
          </h3>

          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label className="form-label">{t.cropType}</label>
              <select
                className="form-input select-clean"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.stateMandi}</label>
              <select
                className="form-input select-clean"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.quantityQuintal}</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.targetDate}</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Computing Economic Model...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{t.predictPriceBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Panel */}
        <div style={{ gridColumn: "span 7" }} className="card-glass">
          {error && (
            <div style={{ padding: "1.25rem", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderRadius: "var(--radius-md)", fontSize: "0.9rem", fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {!prediction && !loading && !error && (
            <div style={{ textAlign: "center", padding: "3.5rem 1.5rem", color: "var(--text-muted)" }}>
              <div style={{ width: "64px", height: "64px", margin: "0 auto 1rem", borderRadius: "50%", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-500)" }}>
                <TrendingUp size={32} />
              </div>
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No Forecast Generated Yet</h4>
              <p style={{ maxWidth: "380px", margin: "0 auto", fontSize: "0.88rem" }}>
                Select your crop, target mandi location, and quantity on the left, then click <strong>"{t.predictPriceBtn}"</strong> to view live AI predictions.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem", color: "var(--text-muted)" }}>
              <Loader2 size={40} className="animate-spin" color="var(--primary-600)" style={{ margin: "0 auto 1.25rem" }} />
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Analyzing APMC Market Trends...</h4>
              <p style={{ fontSize: "0.88rem" }}>
                Evaluating supply arrival volume, seasonal harvest indices, and historical mandi pricing curves for {crop} in {location}.
              </p>
            </div>
          )}

          {prediction && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.3s ease" }}>
              {/* Highlight Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {/* Price */}
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    {t.predictedPrice}
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-600)", marginTop: "0.25rem" }}>
                    ₹{prediction.predicted_price?.toLocaleString() || "—"}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>per Quintal</div>
                </div>

                {/* Total Value */}
                <div style={{ background: "var(--surface-hover)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Estimated Yield
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.25rem" }}>
                    ₹{((prediction.predicted_price || 0) * (Number(quantity) || 1)).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>for {quantity} Quintals</div>
                </div>

                {/* Trend */}
                <div style={{ background: "var(--surface-hover)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    {t.marketTrend}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
                    {getTrendIcon(prediction.market_trend)}
                    <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>{prediction.market_trend || "Stable"}</span>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    {prediction.trend_percentage ? `${prediction.trend_percentage}% projected shift` : "High stability"}
                  </div>
                </div>
              </div>

              {/* Best Window & Confidence */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: "0.9rem 1.25rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.confidence}: </span>
                  <span style={{ fontWeight: 800, color: "var(--primary-600)" }}>{prediction.confidence_level || "High"}</span>
                </div>
                <div>•</div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.sellingTime}: </span>
                  <span style={{ fontWeight: 800 }}>{prediction.best_selling_time || "Next 2-3 weeks"}</span>
                </div>
              </div>

              {/* Insights */}
              {prediction.market_insights?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <CheckCircle size={16} color="var(--primary-600)" />
                    <span>{t.insights}</span>
                  </h4>
                  <ul style={{ paddingLeft: "1.25rem", fontSize: "0.88rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {prediction.market_insights.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {prediction.recommendations?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={16} color="var(--accent-500)" />
                    <span>{t.recommendations}</span>
                  </h4>
                  <ul style={{ paddingLeft: "1.25rem", fontSize: "0.88rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {prediction.risk_factors?.length > 0 && (
                <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <h4 style={{ fontSize: "0.92rem", marginBottom: "0.4rem", fontWeight: 700, color: "#d97706", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <AlertTriangle size={16} />
                    <span>{t.risks}</span>
                  </h4>
                  <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {prediction.risk_factors.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
