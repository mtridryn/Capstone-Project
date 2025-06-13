/**
 * Product Service
 * Handles all product-related API calls and data management
 */

import CONFIG from "../config.js";
import authService from "./authService.js";

class ProductService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.enableLogging = CONFIG.ENABLE_LOGGING;
  }

  /**
   * Get authentication headers
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders() {
    const token = authService.getToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Fetch all products with optional filtering
   * @param {Object} options - Filter options
   * @param {string} options.category - Filter by product_type
   * @param {string} options.skinType - Filter by skintype
   * @param {string} options.effect - Filter by notable_effects
   * @param {number} options.minPrice - Minimum price filter
   * @param {number} options.maxPrice - Maximum price filter
   * @param {string} options.brand - Filter by brand
   * @param {string} options.search - Search query (not supported by backend)
   * @param {number} options.limit - Items per page (not supported by backend)
   * @returns {Promise<Object>} Products data
   */
  async getProducts(options = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Map frontend parameters to backend parameters
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

      const fullUrl = `${this.baseUrl}/products?${queryParams}`;
      console.log("🌐 Making API request to:", fullUrl);
      console.log("📝 Query parameters:", Object.fromEntries(queryParams));

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required. Please login first.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Backend returns { success: true, products: [...] }
      // Frontend expects { products: [...] }
      return {
        products: data.products || [],
        success: data.success || false,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
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
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required. Please login first.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  /**
   * Get product categories (static list since backend doesn't have categories endpoint)
   * @returns {Promise<Array>} Categories array
   */
  async getCategories() {
    // Return static categories since backend doesn't have /api/categories endpoint
    return [
      { id: "all", name: "All Products", count: 0 },
      { id: "Face Wash", name: "Face Wash", count: 0 },
      { id: "Toner", name: "Toner", count: 0 },
      { id: "Serum", name: "Serum", count: 0 },
      { id: "Moisturizer", name: "Moisturizer", count: 0 },
      { id: "Sunscreen", name: "Sunscreen", count: 0 },
      { id: "Exfoliator", name: "Exfoliator", count: 0 },
      { id: "Face Mask", name: "Face Mask", count: 0 },
      { id: "Facial Oil", name: "Facial Oil", count: 0 },
      { id: "Eye Cream", name: "Eye Cream", count: 0 },
    ];
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
   * Get products by skin type recommendation
   * @param {string} skinType - Detected skin type
   * @returns {Promise<Array>} Recommended products
   */
  async getRecommendedProducts(skinType) {
    try {
      console.log(
        "🎯 ProductService: Getting recommendations for skin type:",
        skinType
      );

      // Convert skin type to lowercase for API consistency
      const normalizedSkinType = skinType.toLowerCase();
      console.log(
        "🔄 ProductService: Normalized skin type:",
        normalizedSkinType
      );

      // Get all products first since API filter might not work with comma-separated values
      const allProducts = await this.getProducts({});

      console.log("🔄 ProductService: Raw API response:", allProducts);

      // Filter products manually on frontend since skintype field contains comma-separated values
      const allProductsList = allProducts.products || [];
      console.log(
        "📦 ProductService: Total products received:",
        allProductsList.length
      );

      // Filter products that match the skin type (case-insensitive, partial match)
      const filteredProducts = allProductsList.filter((product) => {
        const productSkinTypes = (product.skintype || "").toLowerCase();
        const matches = productSkinTypes.includes(normalizedSkinType);

        if (matches) {
          console.log(
            `✅ Product "${product.product_name}" matches - skintype: "${product.skintype}", brand: "${product.brand}"`
          );
        }

        return matches;
      });

      console.log(
        "✅ ProductService: Filtered products count:",
        filteredProducts.length
      );

      // Diversify brands - try to get different brands
      const diversifiedProducts = this.diversifyBrands(filteredProducts);

      console.log(
        "🎨 ProductService: Diversified products count:",
        diversifiedProducts.length
      );
      console.log(
        "📋 ProductService: Final product details:",
        diversifiedProducts.map((p) => ({
          id: p.id,
          name: p.product_name,
          skintype: p.skintype,
          brand: p.brand,
        }))
      );

      // Return first 6 diversified products
      return diversifiedProducts.slice(0, 6);
    } catch (error) {
      console.error(
        "❌ ProductService: Error fetching recommended products:",
        error
      );
      return [];
    }
  }

  /**
   * Diversify products by brand to avoid showing only one brand
   * @param {Array} products - Array of products to diversify
   * @returns {Array} Diversified products array
   */
  diversifyBrands(products) {
    if (products.length <= 6) {
      return products; // If we have 6 or fewer products, return all
    }

    const brandGroups = {};
    const diversified = [];

    // Group products by brand
    products.forEach((product) => {
      const brand = product.brand || "Unknown";
      if (!brandGroups[brand]) {
        brandGroups[brand] = [];
      }
      brandGroups[brand].push(product);
    });

    const brands = Object.keys(brandGroups);
    console.log(`🎨 ProductService: Available brands: ${brands.join(", ")}`);
    console.log(
      `🎨 ProductService: Brand distribution:`,
      Object.fromEntries(
        brands.map((brand) => [brand, brandGroups[brand].length])
      )
    );

    // If we have multiple brands, try to get variety
    if (brands.length > 1) {
      let brandIndex = 0;
      let maxPerBrand = Math.ceil(6 / brands.length); // Distribute evenly

      // Round-robin selection from different brands
      while (diversified.length < 6 && diversified.length < products.length) {
        const currentBrand = brands[brandIndex % brands.length];
        const brandProducts = brandGroups[currentBrand];

        // Count how many products we already have from this brand
        const currentBrandCount = diversified.filter(
          (p) => p.brand === currentBrand
        ).length;

        if (
          currentBrandCount < maxPerBrand &&
          brandProducts.length > currentBrandCount
        ) {
          const productToAdd = brandProducts[currentBrandCount];
          if (!diversified.find((p) => p.id === productToAdd.id)) {
            diversified.push(productToAdd);
            console.log(
              `🎨 Added product from ${currentBrand}: ${productToAdd.product_name}`
            );
          }
        }

        brandIndex++;

        // Safety break if we've cycled through all brands multiple times
        if (brandIndex > brands.length * 10) {
          break;
        }
      }

      // If we still need more products, fill with remaining products
      if (diversified.length < 6) {
        for (const product of products) {
          if (diversified.length >= 6) break;
          if (!diversified.find((p) => p.id === product.id)) {
            diversified.push(product);
          }
        }
      }
    } else {
      // Only one brand available, just return first 6
      return products.slice(0, 6);
    }

    return diversified;
  }
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService;
