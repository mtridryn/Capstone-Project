/**
 * BasePresenter - Abstract base class untuk semua Presenter dalam MVP pattern
 * Menyediakan common functionality untuk state management, error handling, dan view coordination
 */
class BasePresenter {
  constructor({ view, models = {} }) {
    this._view = view;
    this._models = models;
    this._state = {};
    this._isInitialized = false;
    this._eventListeners = new Map();
  }

  /**
   * Initialize presenter - should be called after view is rendered
   * @returns {Promise<void>}
   */
  async init() {
    if (this._isInitialized) {
      console.warn(`${this.constructor.name} already initialized`);
      return;
    }

    try {
      this.log('Initializing presenter');
      await this.onInit();
      this._isInitialized = true;
      this.log('Presenter initialized successfully');
    } catch (error) {
      this.log('Presenter initialization failed', error);
      this.handleError(error);
    }
  }

  /**
   * Override this method in child classes for custom initialization
   * @returns {Promise<void>}
   */
  async onInit() {
    // Override in child classes
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this._state };
  }

  /**
   * Update state and notify view if needed
   * @param {Object} newState - New state values
   * @param {boolean} notifyView - Whether to notify view of state change
   */
  setState(newState, notifyView = true) {
    const oldState = { ...this._state };
    this._state = { ...this._state, ...newState };
    
    this.log('State updated', { oldState, newState: this._state });
    
    if (notifyView && this._view && typeof this._view.onStateChange === 'function') {
      this._view.onStateChange(this._state, oldState);
    }
  }

  /**
   * Show loading state
   * @param {string} message - Optional loading message
   */
  showLoading(message = 'Loading...') {
    this.setState({ loading: true, loadingMessage: message });
    
    if (this._view && typeof this._view.showLoading === 'function') {
      this._view.showLoading(message);
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.setState({ loading: false, loadingMessage: null });
    
    if (this._view && typeof this._view.hideLoading === 'function') {
      this._view.hideLoading();
    }
  }

  /**
   * Show error to user
   * @param {Error|string} error - Error to display
   */
  showError(error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    this.setState({ error: errorMessage, loading: false });
    
    if (this._view && typeof this._view.showError === 'function') {
      this._view.showError(errorMessage);
    }
    
    this.log('Error shown to user', errorMessage);
  }

  /**
   * Clear error state
   */
  clearError() {
    this.setState({ error: null });
    
    if (this._view && typeof this._view.clearError === 'function') {
      this._view.clearError();
    }
  }

  /**
   * Handle errors with fallback strategies
   * @param {Error} error - Error to handle
   * @param {Object} options - Error handling options
   */
  async handleError(error, options = {}) {
    this.log('Handling error', error);
    
    const { 
      showToUser = true, 
      fallbackAction = null,
      retryAction = null 
    } = options;

    // Hide loading if active
    this.hideLoading();

    // Try fallback action first
    if (fallbackAction && typeof fallbackAction === 'function') {
      try {
        this.log('Attempting fallback action');
        await fallbackAction();
        return; // Success with fallback
      } catch (fallbackError) {
        this.log('Fallback action failed', fallbackError);
      }
    }

    // Show error to user if requested
    if (showToUser) {
      this.showError(error);
    }

    // Offer retry if available
    if (retryAction && typeof retryAction === 'function') {
      // This could trigger a retry button in the view
      this.setState({ retryAction });
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  removeEventListener(event, callback) {
    if (this._eventListeners.has(event)) {
      const listeners = this._eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this._eventListeners.has(event)) {
      this._eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Validate view interface
   * @param {Array<string>} requiredMethods - Required view methods
   * @throws {Error} If view doesn't implement required methods
   */
  validateView(requiredMethods = []) {
    if (!this._view) {
      throw new Error('View is required');
    }

    const missing = requiredMethods.filter(method => 
      typeof this._view[method] !== 'function'
    );

    if (missing.length > 0) {
      throw new Error(`View missing required methods: ${missing.join(', ')}`);
    }
  }

  /**
   * Get model by name
   * @param {string} modelName - Name of the model
   * @returns {Object|null} Model instance
   */
  getModel(modelName) {
    return this._models[modelName] || null;
  }

  /**
   * Check if presenter is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this._isInitialized;
  }

  /**
   * Cleanup presenter resources
   */
  destroy() {
    this.log('Destroying presenter');
    this._eventListeners.clear();
    this._state = {};
    this._isInitialized = false;
  }

  /**
   * Log presenter activity for debugging
   * @param {string} action - Action being performed
   * @param {any} data - Additional data to log
   */
  log(action, data = null) {
    console.log(`🎭 ${this.constructor.name}: ${action}`, data);
  }
}

export default BasePresenter;
