import CONFIG from "../config.js";

// Authentication Service for handling login, signup, and user management
class AuthService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL; // Backend API URL from config
    this.tokenKey = "dermalyze_token";
    this.userKey = "dermalyze_user";
    this.enableLogging = CONFIG.ENABLE_LOGGING;

    // Alternative API URLs to try if main one fails
    this.alternativeUrls = [
      "http://52.77.219.198:3000", // Without /api
      "http://52.77.219.198:8000/api", // Different port
      "http://52.77.219.198:5000/api", // Another port
    ];
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Store token and user data
  setAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Clear auth data
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Login user
  async login(email, password) {
    try {
      if (this.enableLogging) {
        console.log("Login attempt:", { email });
      }

      // Validate input
      if (!email || !password) {
        return {
          success: false,
          message: "Email dan password harus diisi",
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: "Password minimal 6 karakter",
        };
      }

      // Backend login
      if (this.enableLogging) {
        console.log("🔄 Attempting login to:", `${this.baseUrl}/login`);
      }

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        credentials: "omit", // Don't send credentials for CORS
        body: JSON.stringify({ email, password }),
      });

      if (this.enableLogging) {
        console.log("📡 Login response status:", response.status);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (response.ok) {
        // Backend login successful
        this.setAuthData(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token,
          message: "Login berhasil",
        };
      } else {
        // Backend login failed
        return {
          success: false,
          message: data.error || data.message || "Login gagal",
        };
      }
    } catch (error) {
      console.error("Login error:", error);

      // Provide more specific error messages
      let errorMessage = "Terjadi kesalahan saat login";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message.includes("CORS")) {
        errorMessage =
          "Masalah CORS. Server tidak mengizinkan akses dari domain ini.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const { name, email, password, confirmPassword } = userData;

      if (this.enableLogging) {
        console.log("Registration attempt:", { name, email });
        console.log("Full userData:", userData);
        console.log("API URL:", `${this.baseUrl}/register`);
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        console.log("Password mismatch error");
        return {
          success: false,
          message: "Password dan konfirmasi password tidak cocok",
        };
      }

      // Validate input
      if (!name || !email || !password) {
        console.log("Missing fields error:", {
          name: !!name,
          email: !!email,
          password: !!password,
        });
        return {
          success: false,
          message: "Semua field harus diisi",
        };
      }

      if (password.length < 6) {
        console.log("Password too short error");
        return {
          success: false,
          message: "Password minimal 6 karakter",
        };
      }

      // Backend registration
      console.log("🚀 Attempting backend registration...");

      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        credentials: "omit", // Don't send credentials for CORS
        body: JSON.stringify({
          nama: name,
          email,
          password,
          passwordConfirm: confirmPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Backend registration response:", data);

      if (response.ok && data.success) {
        // Backend registration successful!
        console.log("✅ Backend registration successful!");

        // Generate session token since backend might not return one
        const sessionToken =
          data.token ||
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.setAuthData(sessionToken, data.user);
        return {
          success: true,
          message: "Registrasi berhasil",
          user: data.user,
        };
      } else {
        // Backend returned error
        console.log("❌ Backend registration failed:", data);
        return {
          success: false,
          message: data.message || data.error || "Registrasi gagal",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat registrasi",
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();

      if (token) {
        // Call backend logout endpoint
        await fetch(`${this.baseUrl}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get profile");
      }

      // Update stored user data
      this.setAuthData(token, data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil profil",
      };
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update stored user data
      this.setAuthData(token, data.user);

      return {
        success: true,
        user: data.user,
        message: "Profil berhasil diperbarui",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat memperbarui profil",
      };
    }
  }

  // Verify token validity
  async verifyToken() {
    try {
      const token = this.getToken();

      if (!token) {
        return false;
      }

      // For now, just return true if token exists
      // Real verification will be implemented when backend is ready
      console.log("Token verification skipped - backend not available");
      return true;

      // Uncomment below when backend is ready:
      /*
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.clearAuthData();
        return false;
      }

      return true;
      */
    } catch (error) {
      console.error("Token verification error:", error);
      this.clearAuthData();
      return false;
    }
  }
}

export default new AuthService();
