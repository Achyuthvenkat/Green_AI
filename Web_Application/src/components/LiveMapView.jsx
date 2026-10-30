import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { translations } from "../translations";
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Filter, 
  Phone, 
  Clock, 
  Building2, 
  Compass, 
  Sparkles,
  Info
} from "lucide-react";

// Fix for default Leaflet icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_AGRI_HUBS = [
  {
    id: "hub-1",
    name: "APMC Central Grain & Pulse Mandi",
    category: "Mandi",
    lat: 17.3850 + 0.018,
    lng: 78.4867 + 0.012,
    address: "Market Yard Sector 4, Hyderabad Rural",
    hours: "06:00 AM - 02:30 PM",
    phone: "+91 94401 22334",
    commodities: "Wheat, Paddy, Red Gram, Cotton",
    color: "#10b981",
  },
  {
    id: "hub-2",
    name: "Kisan Cooperative Fertilizer & Bio-Pesticide Depot",
    category: "Fertilizer",
    lat: 17.3850 - 0.014,
    lng: 78.4867 + 0.022,
    address: "National Highway 44 Junction",
    hours: "08:00 AM - 07:00 PM",
    phone: "+91 98480 55667",
    commodities: "Urea, DAP, Potash, Micronutrients",
    color: "#f59e0b",
  },
  {
    id: "hub-3",
    name: "Agritech Mega Cold Storage & Warehouse",
    category: "ColdStorage",
    lat: 17.3850 + 0.026,
    lng: 78.4867 - 0.018,
    address: "Agro Industrial Corridor, Plot 18",
    hours: "24/7 Operations",
    phone: "+91 97000 88991",
    commodities: "Potato, Chili, Fruits, Onion (5,000 MT)",
    color: "#3b82f6",
  },
  {
    id: "hub-4",
    name: "National Seeds Corporation (NSC) Certified Center",
    category: "Seeds",
    lat: 17.3850 - 0.022,
    lng: 78.4867 - 0.015,
    address: "KVK Campus Road, Block B",
    hours: "09:00 AM - 05:30 PM",
    phone: "+91 91234 56780",
    commodities: "High-yield hybrid paddy, certified wheat seeds",
    color: "#8b5cf6",
  },
  {
    id: "hub-5",
    name: "Krishi Vigyan Kendra (KVK) Agricultural Research & Soil Lab",
    category: "Advisory",
    lat: 17.3850 + 0.008,
    lng: 78.4867 - 0.028,
    address: "State Farm Research Station",
    hours: "09:30 AM - 05:00 PM",
    phone: "1800-180-1551",
    commodities: "Soil Testing, Plant Pathologist consultations",
    color: "#ec4899",
  },
];

export default function LiveMapView({ user, currentLang = "English" }) {
  const t = translations[currentLang] || translations.English;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  const [filterCategory, setFilterCategory] = useState("All");
  const [radiusKm, setRadiusKm] = useState(10);
  const [userCoords, setUserCoords] = useState(() => {
    if (user?.location && user.location.includes(",")) {
      const parts = user.location.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
    }
    return [17.3850, 78.4867]; // Default Hyderabad coordinates
  });
  const [selectedHub, setSelectedHub] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: userCoords,
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      circleLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !circleLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    circleLayerRef.current.clearLayers();

    // User Farm Marker (Custom Green Icon)
    const farmerIcon = L.divIcon({
      className: "farmer-custom-marker",
      html: `
        <div style="background: #10b981; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">
          🌱
        </div>
      `,
      iconSize: [34, 34],
    });

    const userMarker = L.marker(userCoords, { icon: farmerIcon }).addTo(markersLayerRef.current);
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <h4 style="margin: 0; color: #10b981;">${user?.name ? `${user.name}'s Farm` : "Your Farm Location"}</h4>
        <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">GPS: ${userCoords[0].toFixed(4)}, ${userCoords[1].toFixed(4)}</p>
      </div>
    `);

    // Radius Circle around user
    L.circle(userCoords, {
      radius: radiusKm * 1000,
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "4, 6",
    }).addTo(circleLayerRef.current);

    // Filtered Hubs
    const hubsToShow = filterCategory === "All"
      ? DEFAULT_AGRI_HUBS
      : DEFAULT_AGRI_HUBS.filter((h) => h.category === filterCategory);

    hubsToShow.forEach((hub) => {
      const hubIcon = L.divIcon({
        className: "hub-custom-marker",
        html: `
          <div style="background: ${hub.color}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25); transform: translate(-50%, -50%); font-weight: bold; font-size: 14px;">
            ${hub.category === "Mandi" ? "🏛️" : hub.category === "Fertilizer" ? "🧪" : hub.category === "ColdStorage" ? "❄️" : "🌱"}
          </div>
        `,
        iconSize: [32, 32],
      });

      const marker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(markersLayerRef.current);
      marker.on("click", () => {
        setSelectedHub(hub);
      });
      marker.bindTooltip(`<b>${hub.name}</b><br/><span style="color:#64748b;">${hub.category}</span>`, {
        direction: "top",
        offset: [0, -18],
      });
    });
  }, [userCoords, filterCategory, radiusKm, user]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCoords, 14, { duration: 1.2 });
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const newPos = [pos.coords.latitude, pos.coords.longitude];
      setUserCoords(newPos);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(newPos, 14);
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Title & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={26} color="var(--primary-600)" />
            <span>{t.mapTitle}</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {t.mapSubtitle}
          </p>
        </div>

        {/* Filter and GPS button */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="select-clean"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">{t.filterAll}</option>
              <option value="Mandi">{t.filterMandis}</option>
              <option value="Fertilizer">{t.filterDepots}</option>
              <option value="ColdStorage">{t.filterStorage}</option>
              <option value="Seeds">Seed Centers</option>
              <option value="Advisory">KVK Labs</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Compass size={16} color="var(--text-muted)" />
            <select
              className="select-clean"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            >
              <option value={5}>5 km {t.radius}</option>
              <option value={10}>10 km {t.radius}</option>
              <option value={25}>25 km {t.radius}</option>
              <option value={50}>50 km {t.radius}</option>
            </select>
          </div>

          <button className="btn-secondary" onClick={handleDetectGPS} style={{ padding: "0.45rem 0.85rem", fontSize: "0.84rem" }}>
            <Navigation size={16} /> GPS Location
          </button>

          <button className="btn-secondary" onClick={handleRecenter} style={{ padding: "0.45rem 0.85rem", fontSize: "0.84rem" }}>
            Center Farm
          </button>
        </div>
      </div>

      {/* Map Layout */}
      <div style={{ display: "grid", gridTemplateColumns: selectedHub ? "7fr 3fr" : "1fr", gap: "1.25rem", minHeight: "560px" }}>
        {/* Map Container */}
        <div className="card-glass" style={{ padding: "0.5rem", position: "relative", minHeight: "560px" }}>
          <div ref={mapContainerRef} style={{ width: "100%", height: "550px", borderRadius: "var(--radius-md)" }} />
        </div>

        {/* Selected Hub Details Panel */}
        {selectedHub && (
          <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: `${selectedHub.color}20`, color: selectedHub.color, padding: "0.25rem 0.65rem", borderRadius: "var(--radius-full)", fontSize: "0.78rem", fontWeight: 700 }}>
                <Building2 size={13} /> {selectedHub.category}
              </div>
              <button className="btn-icon" style={{ width: "28px", height: "28px" }} onClick={() => setSelectedHub(null)}>
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: "1.15rem", lineHeight: 1.3 }}>{selectedHub.name}</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", gap: "0.6rem", color: "var(--text-muted)" }}>
                <MapPin size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{selectedHub.address}</span>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", color: "var(--text-muted)" }}>
                <Clock size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{selectedHub.hours}</span>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", color: "var(--text-muted)" }}>
                <Phone size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
                <a href={`tel:${selectedHub.phone.replace(/[^0-9+]/g, "")}`} style={{ color: "var(--primary-600)", fontWeight: 700, textDecoration: "none" }}>
                  {selectedHub.phone}
                </a>
              </div>
            </div>

            <div style={{ background: "var(--surface-hover)", padding: "0.85rem", borderRadius: "var(--radius-md)", fontSize: "0.84rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Services & Commodities:</div>
              <div style={{ color: "var(--text-muted)" }}>{selectedHub.commodities}</div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHub.lat},${selectedHub.lng}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ flex: 1, textDecoration: "none" }}
              >
                <Navigation size={16} /> Get Directions
              </a>
              <a
                href={`tel:${selectedHub.phone.replace(/[^0-9+]/g, "")}`}
                className="btn-secondary"
                style={{ textDecoration: "none" }}
              >
                <Phone size={16} /> Call
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
