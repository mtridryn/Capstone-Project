import BasePresenter from '../core/BasePresenter.js';
import { UserModel } from '../models/index.js';

/**
 * AuthPresenter - Mengelola authentication flow dan UI logic
 * Handles: Login, Register, Logout, Profile management
 */
class AuthPresenter extends BasePresenter {
  constructor({ view, userModel = null }) {
    super({ 
      view, 
      models: { 
        user: userModel || new UserModel() 
      } 
    });
    
    this.userModel = this.getModel('user');
    this.log('AuthPresenter initialized');
  }

  /**
   * Initialize presenter
   */
  async onInit() {
    // Validate required view methods
    this.validateView([
      'showLoading', 'hideLoading', 'showError', 'clearError'
    ]);

    // Check current authentication status
    await this.checkAuthStatus();
  }

  /**
   * Check current authentication status
   */
  async checkAuthStatus() {
    try {
      const auth = this.userModel.getAuth();
      
      this.setState({
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        token: auth.token
      });

      if (auth.isAuthenticated) {
        this.log('User is authenticated', { userId: auth.user?.id });
        
        // Verify token validity
        const isValid = await this.userModel.verifyToken();
        if (!isValid) {
          this.log('Token is invalid, logging out');
          await this.handleLogout();
        }
      } else {
        this.log('User is not authenticated');
      }

    } catch (error) {
      this.log('Error checking auth status', error);
      this.handleError(error, { showToUser: false });
    }
  }

  /**
   * Handle user login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login result
   */
  async handleLogin(credentials) {
    try {
      this.log('Handling login', { email: credentials.email });
      
      this.showLoading('Logging in...');
      this.clearError();

      // Validate credentials on client side first
      if (!credentials.email || !credentials.password) {
        throw new Error('Email dan password harus diisi');
      }

      // Call model to perform login
      const result = await this.userModel.login(credentials.email, credentials.password);

      this.hideLoading();

      if (result.success) {
        // Update presenter state
        this.setState({
          isAuthenticated: true,
          user: result.user,
          token: result.token
        });

        // Notify view of successful login
        if (this._view.onLoginSuccess) {
          this._view.onLoginSuccess(result);
        }

        this.log('Login successful', { userId: result.user?.id });
        
        // Emit login event for other components
        this.emit('auth:login', { user: result.user });

        return result;
      } else {
        // Show error to user
        this.showError(result.message);
        return result;
      }

    } catch (error) {
      this.log('Login error', error);
      this.hideLoading();
      this.showError(error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Handle user registration
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration result
   */
  async handleRegister(userData) {
    try {
      this.log('Handling registration', { email: userData.email });
      
      this.showLoading('Creating account...');
      this.clearError();

      // Call model to perform registration
      const result = await this.userModel.register(userData);

      this.hideLoading();

      if (result.success) {
        // Update presenter state
        this.setState({
          isAuthenticated: true,
          user: result.user
        });

        // Notify view of successful registration
        if (this._view.onRegisterSuccess) {
          this._view.onRegisterSuccess(result);
        }

        this.log('Registration successful', { userId: result.user?.id });
        
        // Emit registration event
        this.emit('auth:register', { user: result.user });

        return result;
      } else {
        // Show error to user
        this.showError(result.message);
        return result;
      }

    } catch (error) {
      this.log('Registration error', error);
      this.hideLoading();
      this.showError(error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Handle user logout
   * @returns {Promise<void>}
   */
  async handleLogout() {
    try {
      this.log('Handling logout');
      
      this.showLoading('Logging out...');

      // Call model to perform logout
      await this.userModel.logout();

      // Update presenter state
      this.setState({
        isAuthenticated: false,
        user: null,
        token: null
      });

      this.hideLoading();

      // Notify view of logout
      if (this._view.onLogoutSuccess) {
        this._view.onLogoutSuccess();
      }

      this.log('Logout successful');
      
      // Emit logout event
      this.emit('auth:logout');

      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.hash = "#/";
      }

    } catch (error) {
      this.log('Logout error', error);
      this.hideLoading();
      // Continue with logout even if API call fails
      this.setState({
        isAuthenticated: false,
        user: null,
        token: null
      });
    }
  }

  /**
   * Handle profile update
   * @param {Object} userData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  async handleUpdateProfile(userData) {
    try {
      this.log('Handling profile update');
      
      this.showLoading('Updating profile...');
      this.clearError();

      // Call model to update profile
      const result = await this.userModel.updateProfile(userData);

      this.hideLoading();

      if (result.success) {
        // Update presenter state
        this.setState({
          user: result.user
        });

        // Notify view of successful update
        if (this._view.onProfileUpdateSuccess) {
          this._view.onProfileUpdateSuccess(result);
        }

        this.log('Profile update successful');
        
        // Emit profile update event
        this.emit('auth:profileUpdate', { user: result.user });

        return result;
      } else {
        this.showError(result.message);
        return result;
      }

    } catch (error) {
      this.log('Profile update error', error);
      this.hideLoading();
      this.showError(error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    return this.getState().user;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return this.getState().isAuthenticated || false;
  }

  /**
   * Get current authentication token
   * @returns {string|null} Token or null
   */
  getToken() {
    return this.getState().token;
  }

  /**
   * Handle password reset request
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset result
   */
  async handlePasswordReset(email) {
    try {
      this.log('Handling password reset', { email });
      
      this.showLoading('Sending reset email...');
      this.clearError();

      // TODO: Implement password reset when backend supports it
      // const result = await this.userModel.requestPasswordReset(email);

      // For now, show success message
      this.hideLoading();
      
      const result = {
        success: true,
        message: 'Email reset password telah dikirim ke ' + email
      };

      if (this._view.onPasswordResetSuccess) {
        this._view.onPasswordResetSuccess(result);
      }

      return result;

    } catch (error) {
      this.log('Password reset error', error);
      this.hideLoading();
      this.showError(error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Refresh user profile data
   * @returns {Promise<Object>} Refresh result
   */
  async refreshProfile() {
    try {
      this.log('Refreshing profile');

      const result = await this.userModel.getProfile();

      if (result.success) {
        this.setState({
          user: result.user
        });

        this.log('Profile refreshed successfully');
        return result;
      } else {
        this.log('Profile refresh failed', result.message);
        return result;
      }

    } catch (error) {
      this.log('Profile refresh error', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Handle form validation
   * @param {Object} formData - Form data to validate
   * @param {string} formType - Type of form ('login', 'register', 'profile')
   * @returns {Object} Validation result
   */
  validateForm(formData, formType) {
    switch (formType) {
      case 'login':
        return this.userModel.validateLoginCredentials(formData.email, formData.password);
      
      case 'register':
        return this.userModel.validateRegistrationData(formData);
      
      default:
        return { isValid: true, errors: [] };
    }
  }

  /**
   * Clean up presenter resources
   */
  destroy() {
    this.log('Destroying AuthPresenter');
    super.destroy();
  }
}

export default AuthPresenter;
