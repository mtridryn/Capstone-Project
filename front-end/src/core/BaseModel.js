import CONFIG from "../scripts/config.js";

/**
 * BaseModel - Abstract base class untuk semua Model dalam MVP pattern
 * Menyediakan common functionality untuk API calls, caching, dan error handling
 */
class BaseModel {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.tokenKey = "dermalyze_token";
    this.userKey = "dermalyze_user";
    this.enableLogging = CONFIG.ENABLE_LOGGING;
  }

  /**
   * Get stored authentication token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored user data
   * @returns {Object|null} User object
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Get common headers for API requests
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Common API call method with error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} API response
   */
  async apiCall(endpoint, options = {}) {
    try {
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${this.baseUrl}${endpoint}`;

      const defaultOptions = {
        headers: this.getAuthHeaders(),
      };

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      };

      if (this.enableLogging) {
        console.log(`🌐 API Call: ${options.method || "GET"} ${url}`);
      }

      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required. Please login first.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (this.enableLogging) {
        console.log(`✅ API Response:`, data);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error:`, error);
      throw error;
    }
  }

  /**
   * Cache data to localStorage
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    try {
      localStorage.setItem(
        `dermalyze_cache_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("Failed to cache data:", error);
    }
  }

  /**
   * Get cached data from localStorage
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   * @returns {any|null} Cached data or null if expired/not found
   */
  getCache(key, maxAge = 5 * 60 * 1000) {
    try {
      const cached = localStorage.getItem(`dermalyze_cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        localStorage.removeItem(`dermalyze_cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Failed to get cached data:", error);
      return null;
    }
  }

  /**
   * Clear specific cache or all cache
   * @param {string} key - Specific cache key, or null to clear all
   */
  clearCache(key = null) {
    if (key) {
      localStorage.removeItem(`dermalyze_cache_${key}`);
    } else {
      // Clear all dermalyze cache
      Object.keys(localStorage)
        .filter((k) => k.startsWith("dermalyze_cache_"))
        .forEach((k) => localStorage.removeItem(k));
    }
  }

  /**
   * Validate required fields in data object
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - Required field names
   * @throws {Error} If validation fails
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format error message for user display
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  formatError(error) {
    if (error.message.includes("Authentication required")) {
      return "Silakan login terlebih dahulu untuk mengakses fitur ini.";
    }

    if (error.message.includes("Network")) {
      return "Koneksi internet bermasalah. Silakan coba lagi.";
    }

    if (error.message.includes("HTTP error! status: 500")) {
      return "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
    }

    return error.message || "Terjadi kesalahan yang tidak diketahui.";
  }

  /**
   * Log model activity for debugging
   * @param {string} action - Action being performed
   * @param {any} data - Additional data to log
   */
  log(action, data = null) {
    if (!this.enableLogging) return;
    console.log(`📊 ${this.constructor.name}: ${action}`, data);
  }
}

export default BaseModel;
