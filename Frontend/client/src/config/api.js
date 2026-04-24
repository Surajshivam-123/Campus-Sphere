// API Configuration
// Empty string = use Vite proxy (dev) or Vercel rewrite (prod).
// Only set VITE_API_URL to hit the backend directly (requires CORS).
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
