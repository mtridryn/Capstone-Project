import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute.jsx";
import productService from "../../services/productService.js";

const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return "Harga tidak tersedia";
  }
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

const ProductDetailModal = ({ product, isOpen, onClose }) => {
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-2 shadow-md"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Product Image */}
          <div className="mb-6">
            <img
              src={
                imageUrl ||
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop"
              }
              alt={product.product_name || "Product"}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Brand and Type */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {product.brand}
              </span>
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                {product.product_type}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${getSkinTypeColor(
                  product.skintype
                )}`}
              >
                {product.skintype}
              </span>
            </div>

            {/* Product Name */}
            <h2 className="text-2xl font-bold text-gray-900">
              {product.product_name}
            </h2>

            {/* Price */}
            <div className="text-3xl font-bold text-orange-600">
              {formatPrice(product.price)}
            </div>

            {/* Full Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Deskripsi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Effects */}
            {product.effects && product.effects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manfaat
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full"
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

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug logging for image issues - check both picture and picture_src
  console.log("Product image URLs:", {
    picture: product.picture,
    picture_src: product.picture_src,
  });

  const imageUrl = product.picture_src || product.picture;

  const handleImageError = (e) => {
    console.log("Image failed to load:", imageUrl);
    // Try multiple fallback images
    const fallbackImages = [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
      "https://via.placeholder.com/400x400/f0f0f0/666666?text=No+Image",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0f0f0'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='16' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E",
    ];

    if (!e.target.dataset.fallbackIndex) {
      e.target.dataset.fallbackIndex = "0";
    }

    const currentIndex = parseInt(e.target.dataset.fallbackIndex);
    if (currentIndex < fallbackImages.length - 1) {
      e.target.dataset.fallbackIndex = (currentIndex + 1).toString();
      e.target.src = fallbackImages[currentIndex + 1];
    }
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border">
        <div className="relative">
          <img
            src={
              imageUrl ||
              "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
            }
            alt={product.product_name || "Product"}
            className="w-full h-48 object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
              {product.product_type}
            </span>
          </div>
          {/* Skin type tag hidden in product card but still functional for filtering */}
          <div className="absolute top-3 right-3 hidden">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getSkinTypeColor(
                product.skintype
              )}`}
            >
              {product.skintype}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.brand}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
            {product.product_name}
          </h3>

          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
            {truncateDescription(product.description)}
          </p>

          {/* Effects */}
          {product.effects && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {product.effects.slice(0, 2).map((effect, index) => (
                  <span
                    key={index}
                    className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full"
                  >
                    {effect}
                  </span>
                ))}
                {product.effects.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{product.effects.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-orange-600">
              {formatPrice(product.price)}
            </span>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const ProdukPage = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    skinType: "all",
    priceRange: { id: "all", min: 0, max: 0 },
    search: "",
  });
  const [showFilters, setShowFilters] = useState(true);

  const skinTypes = [
    { id: "all", name: "All Skin Types" },
    { id: "Normal", name: "Normal" },
    { id: "Oily", name: "Oily" },
    { id: "Dry", name: "Dry" },
    { id: "Sensitive", name: "Sensitive" },
    { id: "Combination", name: "Combination" },
  ];

  const priceRanges = [
    { id: "all", name: "All Prices", min: 0, max: 0 },
    { id: "under-50k", name: "< Rp 50K", min: 0, max: 50000 },
    { id: "50k-100k", name: "Rp 50K - 100K", min: 50000, max: 100000 },
    { id: "100k-200k", name: "Rp 100K - 200K", min: 100000, max: 200000 },
    { id: "200k-300k", name: "Rp 200K - 300K", min: 200000, max: 300000 },
    { id: "above-300k", name: "> Rp 300K", min: 300000, max: 999999999 },
  ];

  // Load products and categories on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load categories when products are loaded
  useEffect(() => {
    loadCategories();
  }, [allProducts]);

  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const skinTypeParam = urlParams.get("skinType");

    if (skinTypeParam) {
      setFilters((prev) => ({
        ...prev,
        skinType: skinTypeParam,
      }));
    }
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, allProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await productService.getProducts();

      if (result && result.products && Array.isArray(result.products)) {
        setAllProducts(result.products);
        setProducts(result.products);

        if (result.products.length === 0) {
          setError("No products found in the database");
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = () => {
    // Extract categories from actual product data
    if (allProducts.length > 0) {
      const uniqueCategories = [
        ...new Set(allProducts.map((p) => p.product_type)),
      ];
      const categoriesData = uniqueCategories
        .filter((category) => category) // Remove null/undefined
        .map((category) => ({
          id: category,
          name: category,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

      setCategories([{ id: "all", name: "All Categories" }, ...categoriesData]);
    }
  };

  const applyFilters = () => {
    let filteredProducts = [...allProducts];

    if (filters.category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.product_type === filters.category
      );
    }

    if (filters.skinType !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        const productSkinType = product.skintype || "";
        const normalizedProductSkinType = productSkinType.toLowerCase().trim();
        const normalizedFilterSkinType = filters.skinType.toLowerCase().trim();

        // Simple and robust matching logic
        let matches = false;

        // 1. Exact matches (case-insensitive)
        if (normalizedProductSkinType === normalizedFilterSkinType) {
          matches = true;
        }
        // 2. Universal products
        else if (
          productSkinType === "All" ||
          normalizedProductSkinType === "all"
        ) {
          matches = true;
        }
        // 3. Contains match (for comma-separated values)
        else if (normalizedProductSkinType.includes(normalizedFilterSkinType)) {
          matches = true;
        }
        // 4. Special cases for Normal (often empty or "all")
        else if (normalizedFilterSkinType === "normal") {
          if (
            normalizedProductSkinType === "" ||
            normalizedProductSkinType === "all" ||
            normalizedProductSkinType.includes("normal")
          ) {
            matches = true;
          }
        }
        // 5. Special cases for Combination
        else if (normalizedFilterSkinType === "combination") {
          if (
            normalizedProductSkinType.includes("combination") ||
            normalizedProductSkinType.includes("combo") ||
            normalizedProductSkinType.includes("mixed")
          ) {
            matches = true;
          }
        }

        return matches;
      });
    }

    if (filters.priceRange.id !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        const price = product.price || 0;
        const { min, max } = filters.priceRange;

        if (filters.priceRange.id === "under-50k") {
          return price < max;
        } else if (filters.priceRange.id === "above-300k") {
          return price > min;
        } else {
          return price >= min && price <= max;
        }
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          (product.product_name || "").toLowerCase().includes(searchLower) ||
          (product.brand || "").toLowerCase().includes(searchLower) ||
          (product.description || "").toLowerCase().includes(searchLower)
      );
    }

    // Sort products by relevance
    filteredProducts.sort((a, b) => {
      // Priority for skin type filter
      if (filters.skinType !== "all") {
        const aIsSpecific = a.skintype === filters.skinType;
        const bIsSpecific = b.skintype === filters.skinType;
        const aIsAll = a.skintype === "All";
        const bIsAll = b.skintype === "All";

        if (aIsSpecific && !bIsSpecific) return -1;
        if (!aIsSpecific && bIsSpecific) return 1;
        if (aIsAll && !bIsAll) return 1;
        if (!aIsAll && bIsAll) return -1;
      }

      // Default sort by price (ascending)
      return (a.price || 0) - (b.price || 0);
    });

    setProducts(filteredProducts);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      skinType: "all",
      priceRange: { id: "all", min: 0, max: 0 },
      search: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat Produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Produk Skincare
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan produk skincare terbaik untuk jenis kulit Anda
          </p>
        </header>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              Filter Produk
            </button>
          </div>

          {/* Filter Form */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Produk
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Nama produk, brand..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categories.map((category) => (
                      <option
                        key={category.id || category}
                        value={category.id || category}
                      >
                        {category.name || category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skin Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kulit
                  </label>
                  <select
                    value={filters.skinType}
                    onChange={(e) =>
                      handleFilterChange("skinType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {skinTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentang Harga
                  </label>
                  <select
                    value={filters.priceRange.id}
                    onChange={(e) => {
                      const selectedRange = priceRanges.find(
                        (range) => range.id === e.target.value
                      );
                      handleFilterChange("priceRange", selectedRange);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              Tidak ada produk yang sesuai dengan filter Anda
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with ProtectedRoute since API requires authentication
const ProtectedProdukPage = () => {
  return (
    <ProtectedRoute>
      <ProdukPage />
    </ProtectedRoute>
  );
};

export default ProtectedProdukPage;
