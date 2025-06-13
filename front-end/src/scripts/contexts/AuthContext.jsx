import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = authService.getUser();
        const token = authService.getToken();

        if (storedUser && token) {
          // For now, just trust the stored data without backend verification
          // Backend verification will be added when backend is ready
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat login",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log("AuthContext: Starting registration process");
      setIsLoading(true);
      const result = await authService.register(userData);
      console.log("AuthContext: Registration result:", result);

      if (result.success) {
        console.log(
          "AuthContext: Registration successful, user needs to login"
        );
        // Don't auto-login after registration
        // User must login manually after successful registration
      } else {
        console.log("AuthContext: Registration failed:", result.message);
      }

      return result;
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat registrasi",
      };
    } finally {
      setIsLoading(false);
      console.log("AuthContext: Registration process completed");
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to home page
      window.location.hash = "#/";
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);

      if (result.success) {
        setUser(result.user);
      }

      return result;
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat memperbarui profil",
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const result = await authService.getProfile();

      if (result.success) {
        setUser(result.user);
      }

      return result;
    } catch (error) {
      console.error("Refresh profile error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengambil profil",
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
