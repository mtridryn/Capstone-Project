import BasePresenter from '../core/BasePresenter.js';
import { ProductModel, UserModel } from '../models/index.js';

/**
 * ProductPresenter - Mengelola product catalog, filtering, dan search
 * Handles: Product listing, filtering, search, recommendations
 */
class ProductPresenter extends BasePresenter {
  constructor({ view, productModel = null, userModel = null }) {
    super({ 
      view, 
      models: { 
        product: productModel || new ProductModel(),
        user: userModel || new UserModel()
      } 
    });
    
    this.productModel = this.getModel('product');
    this.userModel = this.getModel('user');
    
    // Initialize state
    this.setState({
      products: [],
      categories: [],
      filters: {
        category: 'all',
        skinType: 'all',
        maxPrice: 0,
        minPrice: 0,
        brand: '',
        search: ''
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12
      },
      sortBy: 'name',
      sortOrder: 'asc',
      loading: false,
      error: null
    });
    
    this.log('ProductPresenter initialized');
  }

  /**
   * Initialize presenter
   */
  async onInit() {
    // Validate required view methods
    this.validateView([
      'showLoading', 'hideLoading', 'showError', 'clearError',
      'showProducts', 'showCategories'
    ]);

    // Load initial data
    await this.loadInitialData();
  }

  /**
   * Load initial data (categories and products)
   */
  async loadInitialData() {
    try {
      this.log('Loading initial data');
      
      // Load categories and products in parallel
      await Promise.all([
        this.loadCategories(),
        this.loadProducts()
      ]);

    } catch (error) {
      this.log('Error loading initial data', error);
      this.handleError(error, {
        fallbackAction: () => this.loadCachedData()
      });
    }
  }

  /**
   * Load product categories
   */
  async loadCategories() {
    try {
      this.log('Loading categories');
      
      const categories = await this.productModel.getCategories();
      
      this.setState({ categories });
      
      if (this._view.showCategories) {
        this._view.showCategories(categories);
      }

      this.log('Categories loaded', { count: categories.length });

    } catch (error) {
      this.log('Error loading categories', error);
      throw error;
    }
  }

  /**
   * Load products with current filters
   */
  async loadProducts() {
    try {
      this.log('Loading products', this.getState().filters);
      
      this.showLoading('Loading products...');
      this.clearError();

      // Check authentication for API access
      if (!this.userModel.isAuthenticated()) {
        throw new Error('Authentication required to view products');
      }

      const filters = this.getState().filters;
      const result = await this.productModel.getProducts(filters);

      if (result.success) {
        const products = result.products || [];
        
        // Apply client-side sorting
        const sortedProducts = this.sortProducts(products);
        
        this.setState({ 
          products: sortedProducts,
          pagination: {
            ...this.getState().pagination,
            totalItems: products.length,
            totalPages: Math.ceil(products.length / this.getState().pagination.itemsPerPage)
          }
        });

        if (this._view.showProducts) {
          this._view.showProducts(sortedProducts);
        }

        this.log('Products loaded', { count: products.length });
      } else {
        throw new Error('Failed to load products');
      }

    } catch (error) {
      this.log('Error loading products', error);
      this.handleError(error, {
        fallbackAction: () => this.loadCachedProducts()
      });
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handle filter changes
   * @param {Object} newFilters - New filter values
   */
  async handleFilterChange(newFilters) {
    try {
      this.log('Handling filter change', newFilters);
      
      const currentFilters = this.getState().filters;
      const updatedFilters = { ...currentFilters, ...newFilters };
      
      this.setState({ filters: updatedFilters });
      
      // Notify view of filter update
      if (this._view.updateFilters) {
        this._view.updateFilters(updatedFilters);
      }

      // Reload products with new filters
      await this.loadProducts();

    } catch (error) {
      this.log('Error handling filter change', error);
      this.handleError(error);
    }
  }

  /**
   * Handle search query
   * @param {string} query - Search query
   */
  async handleSearch(query) {
    try {
      this.log('Handling search', { query });
      
      this.showLoading('Searching products...');
      
      const filters = this.getState().filters;
      const searchResults = await this.productModel.searchProducts(query, filters);
      
      // Apply sorting to search results
      const sortedResults = this.sortProducts(searchResults);
      
      this.setState({ 
        products: sortedResults,
        filters: { ...filters, search: query }
      });

      if (this._view.showProducts) {
        this._view.showProducts(sortedResults);
      }

      this.log('Search completed', { 
        query, 
        results: searchResults.length 
      });

    } catch (error) {
      this.log('Search error', error);
      this.handleError(error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handle sorting change
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order ('asc' or 'desc')
   */
  handleSortChange(sortBy, sortOrder) {
    try {
      this.log('Handling sort change', { sortBy, sortOrder });
      
      this.setState({ sortBy, sortOrder });
      
      const products = this.getState().products;
      const sortedProducts = this.sortProducts(products);
      
      this.setState({ products: sortedProducts });
      
      if (this._view.showProducts) {
        this._view.showProducts(sortedProducts);
      }

    } catch (error) {
      this.log('Sort error', error);
      this.handleError(error);
    }
  }

  /**
   * Sort products array
   * @param {Array} products - Products to sort
   * @returns {Array} Sorted products
   */
  sortProducts(products) {
    const { sortBy, sortOrder } = this.getState();
    
    return [...products].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle different data types
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  /**
   * Get product recommendations for skin type
   * @param {string} skinType - Detected skin type
   * @returns {Promise<Array>} Recommended products
   */
  async getRecommendations(skinType) {
    try {
      this.log('Getting product recommendations', { skinType });
      
      this.showLoading('Loading recommendations...');
      
      const recommendations = await this.productModel.getRecommendedProducts(skinType);
      
      this.log('Recommendations loaded', { 
        count: recommendations.length,
        skinType 
      });
      
      return recommendations;

    } catch (error) {
      this.log('Error getting recommendations', error);
      this.handleError(error, { showToUser: false });
      return [];
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    try {
      this.log('Clearing filters');
      
      const defaultFilters = {
        category: 'all',
        skinType: 'all',
        maxPrice: 0,
        minPrice: 0,
        brand: '',
        search: ''
      };
      
      this.setState({ filters: defaultFilters });
      
      if (this._view.updateFilters) {
        this._view.updateFilters(defaultFilters);
      }

      await this.loadProducts();

    } catch (error) {
      this.log('Error clearing filters', error);
      this.handleError(error);
    }
  }

  /**
   * Get product by ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object|null>} Product or null
   */
  async getProductById(productId) {
    try {
      this.log('Getting product by ID', { productId });
      
      const product = await this.productModel.getProductById(productId);
      
      this.log('Product retrieved', { productId });
      return product;

    } catch (error) {
      this.log('Error getting product', error);
      this.handleError(error, { showToUser: false });
      return null;
    }
  }

  /**
   * Load cached products as fallback
   */
  async loadCachedProducts() {
    try {
      this.log('Loading cached products');
      
      // Try to get cached data
      const cached = this.productModel.getCache('products');
      if (cached && cached.products) {
        this.setState({ products: cached.products });
        
        if (this._view.showProducts) {
          this._view.showProducts(cached.products);
        }
        
        this.log('Cached products loaded', { count: cached.products.length });
        return true;
      }
      
      return false;

    } catch (error) {
      this.log('Error loading cached products', error);
      return false;
    }
  }

  /**
   * Load cached data as fallback
   */
  async loadCachedData() {
    try {
      this.log('Loading cached data');
      
      const hasProducts = await this.loadCachedProducts();
      
      if (!hasProducts) {
        this.showError('No products available offline. Please check your connection.');
      }

    } catch (error) {
      this.log('Error loading cached data', error);
      this.showError('Failed to load products. Please try again.');
    }
  }

  /**
   * Get current products
   * @returns {Array} Current products
   */
  getProducts() {
    return this.getState().products;
  }

  /**
   * Get current filters
   * @returns {Object} Current filters
   */
  getFilters() {
    return this.getState().filters;
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    try {
      const stats = await this.productModel.getProductStats();
      this.log('Product statistics retrieved', stats);
      return stats;
    } catch (error) {
      this.log('Error getting product stats', error);
      return null;
    }
  }

  /**
   * Format price for display
   * @param {number} price - Price to format
   * @returns {string} Formatted price
   */
  formatPrice(price) {
    return this.productModel.formatPrice(price);
  }

  /**
   * Clean up presenter resources
   */
  destroy() {
    this.log('Destroying ProductPresenter');
    super.destroy();
  }
}

export default ProductPresenter;
