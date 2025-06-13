/**
 * DIContainer - Dependency Injection Container untuk MVP pattern
 * Mengelola dependencies dan memudahkan testing dengan mock objects
 */
class DIContainer {
  constructor() {
    this.dependencies = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a dependency with its factory function
   * @param {string} name - Dependency name
   * @param {Function} factory - Factory function that creates the dependency
   * @param {Object} options - Registration options
   */
  register(name, factory, options = {}) {
    const { singleton = false } = options;
    
    this.dependencies.set(name, {
      factory,
      singleton,
      instance: null
    });
    
    console.log(`📦 DIContainer: Registered ${name}${singleton ? ' (singleton)' : ''}`);
  }

  /**
   * Resolve a dependency by name
   * @param {string} name - Dependency name
   * @returns {any} Dependency instance
   */
  resolve(name) {
    const dependency = this.dependencies.get(name);
    
    if (!dependency) {
      throw new Error(`Dependency '${name}' not found. Make sure it's registered.`);
    }

    // Return singleton instance if exists
    if (dependency.singleton) {
      if (!dependency.instance) {
        dependency.instance = dependency.factory(this);
      }
      return dependency.instance;
    }

    // Create new instance
    return dependency.factory(this);
  }

  /**
   * Check if dependency is registered
   * @param {string} name - Dependency name
   * @returns {boolean} Is registered
   */
  has(name) {
    return this.dependencies.has(name);
  }

  /**
   * Get all registered dependency names
   * @returns {Array<string>} Dependency names
   */
  getRegisteredNames() {
    return Array.from(this.dependencies.keys());
  }

  /**
   * Clear all dependencies (useful for testing)
   */
  clear() {
    this.dependencies.clear();
    this.singletons.clear();
    console.log('📦 DIContainer: Cleared all dependencies');
  }

  /**
   * Create a child container with inherited dependencies
   * @returns {DIContainer} Child container
   */
  createChild() {
    const child = new DIContainer();
    
    // Copy parent dependencies
    for (const [name, dependency] of this.dependencies) {
      child.dependencies.set(name, { ...dependency });
    }
    
    return child;
  }
}

// Create global container instance
const container = new DIContainer();

// Register core dependencies
container.register('baseModel', () => {
  const BaseModel = require('./BaseModel.js').default;
  return BaseModel;
}, { singleton: true });

container.register('basePresenter', () => {
  const BasePresenter = require('./BasePresenter.js').default;
  return BasePresenter;
}, { singleton: true });

export default container;
export { DIContainer };
