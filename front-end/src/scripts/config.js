// Simple configuration - frontend only, always use production API
const isDevelopment =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    : false;

const CONFIG = {
  // API Base URL - use proxy for production to avoid Mixed Content error
  BASE_URL: isDevelopment
    ? "http://52.77.219.198:3000/api" // Direct HTTP for local development
    : "/api", // Use Vercel proxy for production deployment

  // PocketBase configuration
  POCKETBASE_URL: "http://52.77.219.198:8090",
  POCKETBASE_COLLECTION_ID: "pbc_2982428850",

  // External APIs
  RAPIDAPI_KEY: "9488edf391mshdabc5307e62701ap10e436jsn67c635c5cd14",
  RAPIDAPI_HOST: "contextualwebsearch-websearch-v1.p.rapidapi.com",

  // App settings
  APP_NAME: "Dermalyze",
  VERSION: "1.0.0-mvp",

  // Development flags
  IS_DEVELOPMENT: isDevelopment,
  ENABLE_LOGGING: isDevelopment, // Only log in development
};

export default CONFIG;
