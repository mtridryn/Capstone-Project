import BaseModel from '../core/BaseModel.js';

/**
 * ProductModel - Mengelola data produk, filtering, dan rekomendasi
 * Extends BaseModel untuk common functionality
 */
class ProductModel extends BaseModel {
  constructor() {
    super();
    this.cacheKey = 'products';
    this.categoriesKey = 'categories';
    this.log('ProductModel initialized');
  }

  /**
   * Get all products with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Products data with caching
   */
  async getProducts(options = {}) {
    try {
      this.log('Fetching products', options);

      // Check cache first
      const cacheKey = `${this.cacheKey}_${JSON.stringify(options)}`;
      const cached = this.getCache(cacheKey);
      if (cached) {
        this.log('Returning cached products', { count: cached.products?.length });
        return cached;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (options.category && options.category !== "all") {
        queryParams.append("product_type", options.category);
      }
      if (options.skinType && options.skinType !== "all") {
        queryParams.append("skintype", options.skinType);
      }
      if (options.effect && options.effect !== "all") {
        queryParams.append("notable_effects", options.effect);
      }
      if (options.brand) {
        queryParams.append("brand", options.brand);
      }
      if (options.minPrice) {
        queryParams.append("min_price", options.minPrice);
      }
      if (options.maxPrice) {
        queryParams.append("max_price", options.maxPrice);
      }

      // Call API
      const data = await this.apiCall(`/products?${queryParams}`, {
        method: 'GET'
      });

      const result = {
        products: data.products || [],
        success: data.success || false
      };

      // Cache successful response
      if (result.success) {
        this.setCache(cacheKey, result);
      }

      this.log('Products fetched successfully', { count: result.products.length });
      return result;

    } catch (error) {
      this.log('Error fetching products', error);
      
      // Try to return cached data as fallback
      const fallbackCache = this.getCache(this.cacheKey, 24 * 60 * 60 * 1000); // 24 hours
      if (fallbackCache) {
        this.log('Returning fallback cached products');
        return fallbackCache;
      }
      
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(id) {
    try {
      this.log('Fetching product by ID', { id });

      // Check cache first
      const cacheKey = `product_${id}`;
      const cached = this.getCache(cacheKey);
      if (cached) {
        this.log('Returning cached product');
        return cached;
      }

      // Call API
      const data = await this.apiCall(`/products/${id}`, {
        method: 'GET'
      });

      // Cache successful response
      if (data.success !== false) {
        this.setCache(cacheKey, data);
      }

      this.log('Product fetched successfully', { productId: id });
      return data;

    } catch (error) {
      this.log('Error fetching product', error);
      throw error;
    }
  }

  /**
   * Get product categories
   * @returns {Promise<Array>} Categories array
   */
  async getCategories() {
    try {
      // Check cache first
      const cached = this.getCache(this.categoriesKey);
      if (cached) {
        this.log('Returning cached categories');
        return cached;
      }

      // Static categories since backend doesn't have categories endpoint
      const categories = [
        { id: "all", name: "All Products", count: 0 },
        { id: "Face Wash", name: "Face Wash", count: 0 },
        { id: "Toner", name: "Toner", count: 0 },
        { id: "Serum", name: "Serum", count: 0 },
        { id: "Moisturizer", name: "Moisturizer", count: 0 },
        { id: "Sunscreen", name: "Sunscreen", count: 0 },
        { id: "Exfoliator", name: "Exfoliator", count: 0 },
        { id: "Face Mask", name: "Face Mask", count: 0 },
        { id: "Facial Oil", name: "Facial Oil", count: 0 },
        { id: "Eye Cream", name: "Eye Cream", count: 0 }
      ];

      // Cache categories
      this.setCache(this.categoriesKey, categories, 24 * 60 * 60 * 1000); // 24 hours

      this.log('Categories loaded', { count: categories.length });
      return categories;

    } catch (error) {
      this.log('Error loading categories', error);
      throw error;
    }
  }

  /**
   * Get recommended products by skin type
   * @param {string} skinType - Detected skin type
   * @returns {Promise<Array>} Recommended products
   */
  async getRecommendedProducts(skinType) {
    try {
      this.log('Getting product recommendations', { skinType });

      // Normalize skin type
      const normalizedSkinType = skinType.toLowerCase();

      // Check cache first
      const cacheKey = `recommendations_${normalizedSkinType}`;
      const cached = this.getCache(cacheKey, 30 * 60 * 1000); // 30 minutes
      if (cached) {
        this.log('Returning cached recommendations', { count: cached.length });
        return cached;
      }

      // Get all products first
      const allProducts = await this.getProducts({});
      const productsList = allProducts.products || [];

      this.log('Filtering products for skin type', { 
        totalProducts: productsList.length,
        skinType: normalizedSkinType 
      });

      // Filter products that match the skin type
      const filteredProducts = productsList.filter(product => {
        const productSkinTypes = (product.skintype || "").toLowerCase();
        return productSkinTypes.includes(normalizedSkinType);
      });

      this.log('Products filtered', { 
        matchingProducts: filteredProducts.length 
      });

      // Diversify brands for better recommendations
      const diversifiedProducts = this.diversifyBrands(filteredProducts);

      // Cache recommendations
      const recommendations = diversifiedProducts.slice(0, 6);
      this.setCache(cacheKey, recommendations, 30 * 60 * 1000); // 30 minutes

      this.log('Recommendations generated', { 
        count: recommendations.length,
        brands: [...new Set(recommendations.map(p => p.brand))]
      });

      return recommendations;

    } catch (error) {
      this.log('Error getting recommendations', error);
      return [];
    }
  }

  /**
   * Diversify products by brand to show variety
   * @param {Array} products - Products to diversify
   * @returns {Array} Diversified products
   */
  diversifyBrands(products) {
    if (products.length <= 6) {
      return products;
    }

    // Group products by brand
    const brandGroups = {};
    products.forEach(product => {
      const brand = product.brand || "Unknown";
      if (!brandGroups[brand]) {
        brandGroups[brand] = [];
      }
      brandGroups[brand].push(product);
    });

    const brands = Object.keys(brandGroups);
    const diversified = [];

    if (brands.length > 1) {
      // Round-robin selection from different brands
      let brandIndex = 0;
      const maxPerBrand = Math.ceil(6 / brands.length);

      while (diversified.length < 6 && diversified.length < products.length) {
        const currentBrand = brands[brandIndex % brands.length];
        const brandProducts = brandGroups[currentBrand];
        
        const currentBrandCount = diversified.filter(p => p.brand === currentBrand).length;
        
        if (currentBrandCount < maxPerBrand && brandProducts.length > currentBrandCount) {
          const productToAdd = brandProducts[currentBrandCount];
          if (!diversified.find(p => p.id === productToAdd.id)) {
            diversified.push(productToAdd);
          }
        }

        brandIndex++;
        
        // Safety break
        if (brandIndex > brands.length * 10) {
          break;
        }
      }

      // Fill remaining slots if needed
      if (diversified.length < 6) {
        for (const product of products) {
          if (diversified.length >= 6) break;
          if (!diversified.find(p => p.id === product.id)) {
            diversified.push(product);
          }
        }
      }
    } else {
      // Only one brand, return first 6
      return products.slice(0, 6);
    }

    return diversified;
  }

  /**
   * Format price to Indonesian Rupiah
   * @param {number} price - Price in number
   * @returns {string} Formatted price string
   */
  formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Search products by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchProducts(query, filters = {}) {
    try {
      this.log('Searching products', { query, filters });

      // Get all products first (since backend doesn't support search)
      const allProducts = await this.getProducts(filters);
      const productsList = allProducts.products || [];

      if (!query || query.trim() === '') {
        return productsList;
      }

      // Client-side search
      const searchTerm = query.toLowerCase().trim();
      const searchResults = productsList.filter(product => {
        const searchableText = [
          product.product_name,
          product.brand,
          product.product_type,
          product.notable_effects,
          product.skintype
        ].join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
      });

      this.log('Search completed', { 
        query,
        totalProducts: productsList.length,
        results: searchResults.length 
      });

      return searchResults;

    } catch (error) {
      this.log('Error searching products', error);
      return [];
    }
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    try {
      const allProducts = await this.getProducts({});
      const products = allProducts.products || [];

      const stats = {
        total: products.length,
        byCategory: {},
        bySkinType: {},
        byBrand: {},
        priceRange: {
          min: Math.min(...products.map(p => p.price || 0)),
          max: Math.max(...products.map(p => p.price || 0)),
          average: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
        }
      };

      // Count by category
      products.forEach(product => {
        const category = product.product_type || 'Unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        const brand = product.brand || 'Unknown';
        stats.byBrand[brand] = (stats.byBrand[brand] || 0) + 1;

        // Handle multiple skin types
        const skinTypes = (product.skintype || '').split(',').map(s => s.trim());
        skinTypes.forEach(skinType => {
          if (skinType) {
            stats.bySkinType[skinType] = (stats.bySkinType[skinType] || 0) + 1;
          }
        });
      });

      this.log('Product statistics calculated', stats);
      return stats;

    } catch (error) {
      this.log('Error calculating product stats', error);
      return {
        total: 0,
        byCategory: {},
        bySkinType: {},
        byBrand: {},
        priceRange: { min: 0, max: 0, average: 0 }
      };
    }
  }
}

export default ProductModel;
