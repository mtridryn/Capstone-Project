/**
 * EventEmitter - Simple event system untuk komunikasi antar komponen MVP
 * Memungkinkan loose coupling antara presenters dan components
 */
class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @param {Object} options - Listener options
   */
  on(event, callback, options = {}) {
    const { once = false, priority = 0 } = options;
    
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    
    // Check max listeners
    if (listeners.length >= this.maxListeners) {
      console.warn(`EventEmitter: Maximum listeners (${this.maxListeners}) exceeded for event '${event}'`);
    }

    const listener = {
      callback,
      once,
      priority,
      id: Date.now() + Math.random()
    };

    listeners.push(listener);
    
    // Sort by priority (higher priority first)
    listeners.sort((a, b) => b.priority - a.priority);

    console.log(`🎧 EventEmitter: Added listener for '${event}'${once ? ' (once)' : ''}`);
    
    return listener.id;
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {number} Listener ID
   */
  once(event, callback) {
    return this.on(event, callback, { once: true });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function|number} callbackOrId - Callback function or listener ID
   */
  off(event, callbackOrId) {
    if (!this.events.has(event)) {
      return;
    }

    const listeners = this.events.get(event);
    
    let index = -1;
    if (typeof callbackOrId === 'function') {
      index = listeners.findIndex(listener => listener.callback === callbackOrId);
    } else if (typeof callbackOrId === 'number') {
      index = listeners.findIndex(listener => listener.id === callbackOrId);
    }

    if (index > -1) {
      listeners.splice(index, 1);
      console.log(`🎧 EventEmitter: Removed listener for '${event}'`);
      
      // Clean up empty event arrays
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @returns {boolean} True if event had listeners
   */
  emit(event, data) {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event);
    const toRemove = [];

    console.log(`📢 EventEmitter: Emitting '${event}' to ${listeners.length} listeners`, data);

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      
      try {
        listener.callback(data, event);
        
        // Mark one-time listeners for removal
        if (listener.once) {
          toRemove.push(i);
        }
      } catch (error) {
        console.error(`EventEmitter: Error in listener for '${event}':`, error);
      }
    }

    // Remove one-time listeners (in reverse order to maintain indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      listeners.splice(toRemove[i], 1);
    }

    // Clean up empty event arrays
    if (listeners.length === 0) {
      this.events.delete(event);
    }

    return true;
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} event - Event name (optional)
   */
  removeAllListeners(event = null) {
    if (event) {
      this.events.delete(event);
      console.log(`🎧 EventEmitter: Removed all listeners for '${event}'`);
    } else {
      this.events.clear();
      console.log('🎧 EventEmitter: Removed all listeners');
    }
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  /**
   * Get all event names
   * @returns {Array<string>} Event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Set maximum listeners per event
   * @param {number} max - Maximum listeners
   */
  setMaxListeners(max) {
    this.maxListeners = max;
  }

  /**
   * Create a promise that resolves when event is emitted
   * @param {string} event - Event name
   * @param {number} timeout - Timeout in milliseconds (optional)
   * @returns {Promise} Promise that resolves with event data
   */
  waitFor(event, timeout = null) {
    return new Promise((resolve, reject) => {
      let timeoutId = null;
      
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      const listener = (data) => {
        cleanup();
        resolve(data);
      };

      this.once(event, listener);

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listener);
          reject(new Error(`Timeout waiting for event '${event}'`));
        }, timeout);
      }
    });
  }
}

// Create global event emitter instance
const globalEventEmitter = new EventEmitter();

export default globalEventEmitter;
export { EventEmitter };
