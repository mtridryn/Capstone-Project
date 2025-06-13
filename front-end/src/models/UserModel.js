import BaseModel from '../core/BaseModel.js';

/**
 * UserModel - Mengelola data user, authentication, dan profile management
 * Extends BaseModel untuk common functionality
 */
class UserModel extends BaseModel {
  constructor() {
    super();
    this.log('UserModel initialized');
  }

  /**
   * Store authentication data
   * @param {string} token - JWT token
   * @param {Object} user - User object
   */
  setAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.log('Auth data stored', { userId: user?.id, email: user?.email });
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.clearCache(); // Clear all cached data
    this.log('Auth data cleared');
  }

  /**
   * Get authentication status and data
   * @returns {Object} Auth status and data
   */
  getAuth() {
    const token = this.getToken();
    const user = this.getUser();
    
    return {
      isAuthenticated: !!(token && user),
      token,
      user
    };
  }

  /**
   * Validate login credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Validation result
   */
  validateLoginCredentials(email, password) {
    const errors = [];

    if (!email || !password) {
      errors.push("Email dan password harus diisi");
    }

    if (email && !this.validateEmail(email)) {
      errors.push("Format email tidak valid");
    }

    if (password && password.length < 6) {
      errors.push("Password minimal 6 karakter");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate registration data
   * @param {Object} userData - Registration data
   * @returns {Object} Validation result
   */
  validateRegistrationData(userData) {
    const { name, email, password, confirmPassword } = userData;
    const errors = [];

    // Required fields
    if (!name || !email || !password || !confirmPassword) {
      errors.push("Semua field harus diisi");
    }

    // Name validation
    if (name && name.length < 2) {
      errors.push("Nama minimal 2 karakter");
    }

    // Email validation
    if (email && !this.validateEmail(email)) {
      errors.push("Format email tidak valid");
    }

    // Password validation
    if (password && password.length < 6) {
      errors.push("Password minimal 6 karakter");
    }

    // Password confirmation
    if (password && confirmPassword && password !== confirmPassword) {
      errors.push("Password dan konfirmasi password tidak cocok");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  async login(email, password) {
    try {
      this.log('Login attempt', { email });

      // Validate credentials
      const validation = this.validateLoginCredentials(email, password);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors[0]
        };
      }

      // Call API
      const data = await this.apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.success || data.token) {
        // Store auth data
        this.setAuthData(data.token, data.user);
        
        this.log('Login successful', { userId: data.user?.id });
        
        return {
          success: true,
          user: data.user,
          token: data.token,
          message: "Login berhasil"
        };
      } else {
        return {
          success: false,
          message: data.error || data.message || "Login gagal"
        };
      }
    } catch (error) {
      this.log('Login error', error);
      return {
        success: false,
        message: this.formatError(error)
      };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const { name, email, password, confirmPassword } = userData;
      
      this.log('Registration attempt', { name, email });

      // Validate registration data
      const validation = this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors[0]
        };
      }

      // Call API
      const data = await this.apiCall('/register', {
        method: 'POST',
        body: JSON.stringify({
          nama: name,
          email,
          password,
          passwordConfirm: confirmPassword
        })
      });

      if (data.success) {
        // Generate session token if not provided
        const sessionToken = data.token || 
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.setAuthData(sessionToken, data.user);
        
        this.log('Registration successful', { userId: data.user?.id });
        
        return {
          success: true,
          message: "Registrasi berhasil",
          user: data.user
        };
      } else {
        return {
          success: false,
          message: data.message || data.error || "Registrasi gagal"
        };
      }
    } catch (error) {
      this.log('Registration error', error);
      return {
        success: false,
        message: this.formatError(error)
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Call backend logout endpoint
        await this.apiCall('/logout', {
          method: 'POST'
        });
      }
      
      this.log('Logout successful');
    } catch (error) {
      this.log('Logout error', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} Profile result
   */
  async getProfile() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      const data = await this.apiCall('/auth/profile', {
        method: 'GET'
      });

      if (data.success) {
        // Update stored user data
        const token = this.getToken();
        this.setAuthData(token, data.user);
        
        return {
          success: true,
          user: data.user
        };
      } else {
        throw new Error(data.message || "Failed to get profile");
      }
    } catch (error) {
      this.log('Get profile error', error);
      return {
        success: false,
        message: this.formatError(error)
      };
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(userData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      const data = await this.apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      if (data.success) {
        // Update stored user data
        const token = this.getToken();
        this.setAuthData(token, data.user);
        
        return {
          success: true,
          user: data.user,
          message: "Profil berhasil diperbarui"
        };
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      this.log('Update profile error', error);
      return {
        success: false,
        message: this.formatError(error)
      };
    }
  }

  /**
   * Verify token validity
   * @returns {Promise<boolean>} Token validity
   */
  async verifyToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        return false;
      }

      // For now, just return true if token exists
      // TODO: Implement real verification when backend is ready
      this.log('Token verification skipped - using local validation');
      return true;

      // Uncomment when backend verification is ready:
      /*
      const data = await this.apiCall('/auth/verify', {
        method: 'GET'
      });
      
      return data.success;
      */
    } catch (error) {
      this.log('Token verification error', error);
      this.clearAuthData();
      return false;
    }
  }
}

export default UserModel;
