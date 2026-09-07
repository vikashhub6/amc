import axios from "axios";

// Local dev: leave VITE_API_URL unset, Vite proxy (vite.config.js) forwards /api -> localhost:5000.
// Production (Vercel): set VITE_API_URL to the deployed backend URL (e.g. Render), see .env.production.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

// Har request me localStorage se JWT token attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expire/invalid ho to login page par bhej do
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
