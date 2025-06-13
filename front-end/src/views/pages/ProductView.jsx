import React, { useState, useCallback, useEffect } from 'react';
import { ProductPresenter } from '../../presenters/index.js';
import useMVPPresenter from '../hooks/useMVPPresenter.js';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import ErrorMessage from '../shared/ErrorMessage.jsx';
import EmptyState from '../shared/EmptyState.jsx';

/**
 * ProductView - Product catalog page menggunakan MVP pattern
 * Pure UI component yang delegate semua logic ke ProductPresenter
 */
const ProductView = () => {
  // Local UI state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // MVP Presenter integration
  const { 
    presenter, 
    loading, 
    error, 
    clearError,
    presenterState 
  } = useMVPPresenter(ProductPresenter, {
    viewMethods: {
      // Product display methods
      showProducts: (products) => {
        console.log('Products updated:', products.length);
      },

      showCategories: (categories) => {
        console.log('Categories updated:', categories.length);
      },

      updateFilters: (filters) => {
        console.log('Filters updated:', filters);
      },

      // Product interaction methods
      onProductSelected: (product) => {
        setSelectedProduct(product);
      }
    }
  });

  // Get data from presenter state
  const products = presenterState.products || [];
  const categories = presenterState.categories || [];
  const filters = presenterState.filters || {};
  const pagination = presenterState.pagination || {};

  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const skinTypeParam = urlParams.get("skinType");

    if (skinTypeParam && presenter) {
      presenter.handleFilterChange({ skinType: skinTypeParam });
    }
  }, [presenter]);

  // Event handlers
  const handleFilterChange = useCallback((filterType, value) => {
    if (presenter) {
      presenter.handleFilterChange({ [filterType]: value });
    }
  }, [presenter]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (presenter) {
      presenter.handleSearch(query);
    }
  }, [presenter]);

  const handleSortChange = useCallback((sortBy, sortOrder) => {
    if (presenter) {
      presenter.handleSortChange(sortBy, sortOrder);
    }
  }, [presenter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    if (presenter) {
      presenter.clearFilters();
    }
  }, [presenter]);

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const closeProductModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSkinTypeColor = (skintype) => {
    const colors = {
      Oily: "bg-blue-100 text-blue-700",
      Dry: "bg-orange-100 text-orange-700",
      Sensitive: "bg-pink-100 text-pink-700",
      Normal: "bg-green-100 text-green-700",
      All: "bg-gray-100 text-gray-700",
    };
    return colors[skintype] || "bg-gray-100 text-gray-700";
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Render filter section
  const renderFilters = () => (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300 ${
      showFilters ? 'block' : 'hidden'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showFilters ? '🔼' : '🔽'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, brand..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skin Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skin Type
          </label>
          <select
            value={filters.skinType || 'all'}
            onChange={(e) => handleFilterChange('skinType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
          >
            <option value="all">All Skin Types</option>
            <option value="Normal">Normal</option>
            <option value="Oily">Oily</option>
            <option value="Dry">Dry</option>
            <option value="Sensitive">Sensitive</option>
            <option value="Combination">Combination</option>
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price
          </label>
          <select
            value={filters.maxPrice || 0}
            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
          >
            <option value={0}>All Prices</option>
            <option value={50000}>< Rp 50K</option>
            <option value={100000}>< Rp 100K</option>
            <option value={200000}>< Rp 200K</option>
            <option value={300000}>< Rp 300K</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  // Render product card
  const renderProductCard = (product) => (
    <div
      key={product.id}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border cursor-pointer product-card group animate-fade-in-up"
      onClick={() => handleProductClick(product)}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.picture_src || product.picture ||
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"}
          alt={product.product_name || "Product"}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 left-3 transform transition-all duration-300 group-hover:scale-110">
          <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm bg-orange-100/90">
            {product.product_type}
          </span>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <span className="text-primary-500 text-sm">❤️</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="mb-2 transform transition-all duration-300 group-hover:translate-x-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide transition-colors duration-300 group-hover:text-primary-600">
            {product.brand}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 leading-tight transition-colors duration-300 group-hover:text-primary-700">
          {product.product_name}
        </h3>

        <p className="text-sm text-gray-600 mb-2 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
          {truncateDescription(product.description)}
        </p>

        {/* Effects */}
        {product.effects && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.effects.slice(0, 2).map((effect, index) => (
                <span
                  key={index}
                  className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full transition-all duration-300 hover:bg-orange-100 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {effect}
                </span>
              ))}
              {product.effects.length > 2 && (
                <span className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-primary-500">
                  +{product.effects.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600 transition-all duration-300 group-hover:text-primary-600 group-hover:scale-105">
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 ${getSkinTypeColor(product.skintype)}`}>
            {product.skintype}
          </span>
        </div>
      </div>
    </div>
  );

  // Render product grid
  const renderProductGrid = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" message="Memuat Produk.." />
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <EmptyState
          icon="🛍️"
          title="Tidak ada produk yang ditemukan"
          description="Tidak ada produk yang cocok dengan filter Anda saat ini. Coba sesuaikan kriteria pencarian Anda."
          actionLabel="Hapus Filter"
          onAction={clearFilters}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`animate-fade-in-up animate-delay-${Math.min((index % 8 + 1) * 100, 500)}`}
          >
            {renderProductCard(product)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Catalog
          </h1>
          <p className="text-gray-600">
            Discover skincare products tailored to your skin type
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage 
            message={error} 
            type="error"
            onDismiss={clearError}
            onRetry={() => presenter?.loadProducts()}
            className="mb-6"
          />
        )}

        {/* Filters */}
        {renderFilters()}



        {/* Product Grid */}
        {renderProductGrid()}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={closeProductModal}
            formatPrice={formatPrice}
            getSkinTypeColor={getSkinTypeColor}
          />
        )}
      </div>
    </div>
  );
};

// Product Detail Modal Component
const ProductDetailModal = ({ product, isOpen, onClose, formatPrice, getSkinTypeColor }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const imageUrl = product.picture_src || product.picture;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 modal-content animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-300 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg hover:scale-110 animate-bounce"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Product Image */}
          <div className="mb-6 animate-fade-in-up">
            <img
              src={imageUrl || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop"}
              alt={product.product_name || "Product"}
              className="w-full h-64 object-cover rounded-xl transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Brand and Type */}
            <div className="flex items-center gap-3 animate-fade-in-up animate-delay-100">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide transition-colors duration-300 hover:text-primary-600">
                {product.brand}
              </span>
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 hover:bg-orange-200 hover:scale-105">
                {product.product_type}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 ${getSkinTypeColor(product.skintype)}`}>
                {product.skintype}
              </span>
            </div>

            {/* Product Name */}
            <h2 className="text-2xl font-bold text-gray-900 animate-fade-in-up animate-delay-200 transition-colors duration-300 hover:text-primary-700">
              {product.product_name}
            </h2>

            {/* Price */}
            <div className="text-3xl font-bold text-orange-600 animate-fade-in-up animate-delay-300 transition-all duration-300 hover:text-primary-600 hover:scale-105">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            <div className="animate-fade-in-up animate-delay-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors duration-300 hover:text-primary-700">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed transition-colors duration-300 hover:text-gray-700">
                {product.description}
              </p>
            </div>

            {/* Effects */}
            {product.effects && product.effects.length > 0 && (
              <div className="animate-fade-in-up animate-delay-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors duration-300 hover:text-primary-700">
                  Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full transition-all duration-300 hover:bg-orange-100 hover:scale-105 animate-bounce"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
