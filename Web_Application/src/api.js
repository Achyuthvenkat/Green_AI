// Base URL can be relative thanks to Vite proxy, or fallback to http://127.0.0.1:8080
const API_BASE = "";

export const api = {
  // Login user and verify password
  async login(email, password) {
    const res = await fetch(`${API_BASE}/check_email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to log in");
    }
    // Record user as active in database
    try {
      await fetch(`${API_BASE}/add_active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (e) {
      console.warn("Could not record active session:", e);
    }
    return data;
  },

  // Sign up new user
  async signup(userData) {
    const res = await fetch(`${API_BASE}/userdetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to sign up");
    }
    // Mark as active
    try {
      await fetch(`${API_BASE}/add_active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });
    } catch (e) {
      console.warn("Could not record active session:", e);
    }
    return data;
  },

  // Get active or specific user profile details
  async getUserDetails(email) {
    const url = email
      ? `${API_BASE}/get_active_user_details?email=${encodeURIComponent(email)}`
      : `${API_BASE}/get_active_user_details`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "User not found");
    }
    return data.data;
  },

  // Update profile
  async updateUserProfile(userData, currentEmail) {
    const res = await fetch(`${API_BASE}/update_user_profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, target_email: currentEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    return data.data;
  },

  // Reminders API
  async getReminders(userId = 1) {
    const res = await fetch(`${API_BASE}/api/reminders?user_id=${userId}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to load reminders");
    }
    return data.reminders || [];
  },

  async createReminder(reminder) {
    const res = await fetch(`${API_BASE}/api/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create reminder");
    }
    return data.reminder;
  },

  async deleteReminder(id) {
    const res = await fetch(`${API_BASE}/api/reminders/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete reminder");
    }
    return data;
  },

  // Community Chat API
  async getMessages() {
    const res = await fetch(`${API_BASE}/get_messages`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to load community messages");
    }
    return data.messages || [];
  },

  async sendMessage(name, message) {
    const res = await fetch(`${API_BASE}/send_message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send message");
    }
    return data.data;
  },

  // Green AI Crop Doctor Chat
  async sendChatMessage(message, imageBase64) {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, image_base64: imageBase64 }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "AI service temporarily unavailable");
    }
    return data.reply;
  },

  // Market Price Prediction
  async predictPrice({ crop, location, quantity, date }) {
    const res = await fetch(`${API_BASE}/api/predict_price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop, location, quantity, date }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Price prediction unavailable");
    }
    return data.prediction;
  },

  // Real-time live weather
  async getWeather(lat = 17.3850, lng = 78.4867) {
    try {
      const res = await fetch(`${API_BASE}/api/weather?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
    } catch (e) {
      console.warn("Backend weather proxy fallback, trying direct Open-Meteo:", e);
    }
    // Direct Open-Meteo fallback
    const directRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,soil_moisture_0_to_1cm`
    );
    const directData = await directRes.json();
    const cur = directData.current || {};
    const rawSm = cur.soil_moisture_0_to_1cm;
    const smPct = rawSm != null ? Math.round(Math.min(100, Math.max(0, (rawSm / 0.45) * 100)) * 10) / 10 : 42;
    return {
      temperature: `${cur.temperature_2m ?? 28}°C`,
      humidity: `${cur.relative_humidity_2m ?? 60}%`,
      wind_speed: `${cur.wind_speed_10m ?? 10} km/h`,
      soil_moisture: `${smPct}%`,
    };
  },
};
