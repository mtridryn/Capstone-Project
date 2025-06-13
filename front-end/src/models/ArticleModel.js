import BaseModel from "../core/BaseModel.js";
import CONFIG from "../scripts/config.js";

/**
 * ArticleModel - Mengelola artikel beauty/skincare dari external APIs
 * Handles: Frontend → External News APIs (RapidAPI, NewsAPI, etc.)
 */
class ArticleModel extends BaseModel {
  constructor() {
    super();
    this.rapidApiKey = CONFIG.RAPIDAPI_KEY;
    this.rapidApiHost = CONFIG.RAPIDAPI_HOST;
    this.rapidApiUrl = `https://${CONFIG.RAPIDAPI_HOST}`;
    this.cacheKey = "articles";
    this.fallbackData = this.getEnhancedFallbackArticles();
    this.log("ArticleModel initialized");
  }

  /**
   * Fetch articles from multiple external APIs
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Articles data
   */
  async fetchArticles(
    query = "beauty skincare makeup",
    page = 1,
    pageSize = 12
  ) {
    try {
      this.log("Fetching articles", { query, page, pageSize });

      // Check cache first
      const cacheKey = `${this.cacheKey}_${query}_${page}_${pageSize}`;
      const cached = this.getCache(cacheKey, 30 * 60 * 1000); // 30 minutes
      if (cached) {
        this.log("Returning cached articles", {
          count: cached.articles?.length,
        });
        return cached;
      }

      // Try multiple API approaches
      const approaches = [
        () => this.tryRapidAPI(query, page, pageSize),
        () => this.tryAlternativeAPI(query, page, pageSize),
        () => this.tryNewsAPI(query, page, pageSize),
      ];

      for (const approach of approaches) {
        try {
          const result = await approach();
          if (result && result.articles && result.articles.length > 0) {
            this.log("Successfully fetched real articles", {
              count: result.articles.length,
            });

            const response = {
              success: true,
              articles: result.articles,
              totalResults: result.totalResults,
              isUsingFallback: false,
            };

            // Cache successful response
            this.setCache(cacheKey, response, 30 * 60 * 1000); // 30 minutes
            return response;
          }
        } catch (error) {
          this.log("API approach failed", error.message);
          continue;
        }
      }

      throw new Error("All API approaches failed");
    } catch (error) {
      this.log("All APIs failed, using fallback data", error);

      // Return enhanced fallback data with pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = this.fallbackData.slice(startIndex, endIndex);

      const fallbackResponse = {
        success: true,
        articles: paginatedArticles,
        totalResults: this.fallbackData.length,
        isUsingFallback: true,
        error: error.message,
      };

      // Cache fallback data for shorter time
      const cacheKey = `${this.cacheKey}_fallback_${page}_${pageSize}`;
      this.setCache(cacheKey, fallbackResponse, 10 * 60 * 1000); // 10 minutes

      return fallbackResponse;
    }
  }

  /**
   * Try RapidAPI for articles
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} API response
   */
  async tryRapidAPI(query, page, pageSize) {
    const beautyQueries = [
      "skincare routine tips beauty",
      "makeup tutorial cosmetics",
      "anti-aging skincare products",
      "natural beauty remedies",
      "Korean skincare K-beauty",
      "dermatologist beauty recommendations",
      "cosmetics makeup trends",
      "facial skincare treatment",
    ];

    const searchQuery =
      query || beautyQueries[Math.floor(Math.random() * beautyQueries.length)];

    const url = `${
      this.rapidApiUrl
    }/api/search/NewsSearchAPI?q=${encodeURIComponent(
      searchQuery
    )}&pageNumber=${page}&pageSize=${pageSize}&autoCorrect=true&safeSearch=false`;

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": this.rapidApiKey,
        "X-RapidAPI-Host": this.rapidApiHost,
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`RapidAPI error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.value && data.value.length > 0) {
      const transformedArticles = data.value
        .filter((article) => this.isBeautyRelated(article))
        .filter((article) => article.url && !article.url.includes("removed"))
        .map((article) => this.transformRapidApiArticle(article));

      return {
        articles: transformedArticles,
        totalResults: data.totalCount || transformedArticles.length,
      };
    }

    throw new Error("No valid articles from RapidAPI");
  }

  /**
   * Try alternative API (Bing News)
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} API response
   */
  async tryAlternativeAPI(query, page, pageSize) {
    const alternativeHost = "bing-news-search1.p.rapidapi.com";
    const alternativeUrl = `https://${alternativeHost}/news/search?q=${encodeURIComponent(
      query + " beauty skincare"
    )}&count=${pageSize}&offset=${
      (page - 1) * pageSize
    }&mkt=en-US&safeSearch=Moderate`;

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": this.rapidApiKey,
        "X-RapidAPI-Host": alternativeHost,
      },
    };

    const response = await fetch(alternativeUrl, options);

    if (!response.ok) {
      throw new Error(`Alternative API error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.value && data.value.length > 0) {
      const transformedArticles = data.value
        .filter((article) => this.isBeautyRelated(article))
        .filter((article) => article.url && !article.url.includes("removed"))
        .map((article) => this.transformBingApiArticle(article));

      return {
        articles: transformedArticles,
        totalResults: data.totalEstimatedMatches || transformedArticles.length,
      };
    }

    throw new Error("No valid articles from alternative API");
  }

  /**
   * Try public news APIs (likely to fail due to CORS)
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} API response
   */
  async tryNewsAPI(query, page, pageSize) {
    const publicSources = [
      "https://newsapi.org/v2/everything",
      "https://api.currentsapi.services/v1/search",
    ];

    for (const source of publicSources) {
      try {
        const url = `${source}?q=${encodeURIComponent(
          query + " beauty"
        )}&page=${page}&pageSize=${pageSize}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            return {
              articles: data.articles.map((article) =>
                this.transformNewsApiArticle(article)
              ),
              totalResults: data.totalResults || data.articles.length,
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error("No valid articles from news APIs");
  }

  /**
   * Check if article is beauty/skincare related
   * @param {Object} article - Article object
   * @returns {boolean} Is beauty related
   */
  isBeautyRelated(article) {
    const beautyKeywords = [
      "beauty",
      "skincare",
      "makeup",
      "cosmetic",
      "facial",
      "skin",
      "anti-aging",
      "moisturizer",
      "serum",
      "cleanser",
      "sunscreen",
      "foundation",
      "lipstick",
      "dermatology",
      "acne",
      "wrinkle",
      "glow",
      "routine",
      "treatment",
      "spa",
      "mascara",
      "concealer",
      "primer",
      "toner",
      "exfoliate",
      "hydrating",
    ];

    const text = `${article.title || ""} ${article.body || ""} ${
      article.snippet || ""
    }`.toLowerCase();

    return beautyKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Transform RapidAPI article to our format
   * @param {Object} article - Raw article from RapidAPI
   * @returns {Object} Transformed article
   */
  transformRapidApiArticle(article) {
    const categories = [
      "Tips Kecantikan",
      "Skincare Routine",
      "Makeup Tutorial",
      "Anti-Aging",
      "K-Beauty",
      "Natural Beauty",
      "Perawatan Wajah",
    ];

    const selectedCategory =
      this.getCategoryFromContent(article) ||
      categories[Math.floor(Math.random() * categories.length)];

    return {
      id: Date.now() + Math.random(),
      title: article.title || "Beauty Article",
      excerpt:
        article.snippet ||
        article.body?.substring(0, 150) + "..." ||
        "Discover the latest beauty tips and skincare advice...",
      content: article.body || article.snippet || "Full article content...",
      category: selectedCategory,
      author: article.provider?.name || "Beauty Expert",
      publishedAt: article.datePublished || new Date().toISOString(),
      readTime: `${Math.floor(Math.random() * 8) + 3} min`,
      image:
        article.image?.url || this.getBeautyImage(article, selectedCategory),
      tags: this.extractBeautyTags(article),
      views: 0,
      likes: 0,
      sourceUrl: article.url,
      source: article.provider?.name || "Beauty News",
      rating: (Math.random() * 2 + 3).toFixed(1),
      trending: Math.random() > 0.7,
    };
  }

  /**
   * Transform Bing API article to our format
   * @param {Object} article - Raw article from Bing API
   * @returns {Object} Transformed article
   */
  transformBingApiArticle(article) {
    const categories = [
      "Tips Kecantikan",
      "Skincare Routine",
      "Makeup Tutorial",
      "Anti-Aging",
      "K-Beauty",
      "Natural Beauty",
      "Perawatan Wajah",
    ];

    const selectedCategory =
      this.getCategoryFromContent(article) ||
      categories[Math.floor(Math.random() * categories.length)];

    return {
      id: Date.now() + Math.random(),
      title: article.name || "Beauty Article",
      excerpt:
        article.description ||
        "Discover the latest beauty tips and skincare advice...",
      content: article.description || "Full article content...",
      category: selectedCategory,
      author: article.provider?.[0]?.name || "Beauty Expert",
      publishedAt: article.datePublished || new Date().toISOString(),
      readTime: `${Math.floor(Math.random() * 8) + 3} min`,
      image:
        article.image?.thumbnail?.contentUrl ||
        this.getBeautyImage(article, selectedCategory),
      tags: this.extractBeautyTags(article),
      views: 0,
      likes: 0,
      sourceUrl: article.url,
      source: article.provider?.[0]?.name || "Beauty News",
      rating: (Math.random() * 2 + 3).toFixed(1),
      trending: Math.random() > 0.7,
    };
  }

  /**
   * Transform NewsAPI article to our format
   * @param {Object} article - Raw article from NewsAPI
   * @returns {Object} Transformed article
   */
  transformNewsApiArticle(article) {
    const categories = [
      "Tips Kecantikan",
      "Skincare Routine",
      "Makeup Tutorial",
      "Anti-Aging",
      "K-Beauty",
      "Natural Beauty",
      "Perawatan Wajah",
    ];

    const selectedCategory =
      this.getCategoryFromContent(article) ||
      categories[Math.floor(Math.random() * categories.length)];

    return {
      id: Date.now() + Math.random(),
      title: article.title || "Beauty Article",
      excerpt:
        article.description ||
        "Discover the latest beauty tips and skincare advice...",
      content:
        article.content || article.description || "Full article content...",
      category: selectedCategory,
      author: article.author || article.source?.name || "Beauty Expert",
      publishedAt: article.publishedAt || new Date().toISOString(),
      readTime: `${Math.floor(Math.random() * 8) + 3} min`,
      image:
        article.urlToImage || this.getBeautyImage(article, selectedCategory),
      tags: this.extractBeautyTags(article),
      views: 0,
      likes: 0,
      sourceUrl: article.url,
      source: article.source?.name || "Beauty News",
      rating: (Math.random() * 2 + 3).toFixed(1),
      trending: Math.random() > 0.7,
    };
  }

  /**
   * Get category from article content
   * @param {Object} article - Article object
   * @returns {string|null} Category or null
   */
  getCategoryFromContent(article) {
    const text = `${article.title || ""} ${
      article.snippet || ""
    }`.toLowerCase();

    if (text.includes("korean") || text.includes("k-beauty")) return "K-Beauty";
    if (text.includes("makeup") || text.includes("cosmetic"))
      return "Makeup Tutorial";
    if (text.includes("skincare") || text.includes("routine"))
      return "Skincare Routine";
    if (text.includes("anti-aging") || text.includes("wrinkle"))
      return "Anti-Aging";
    if (text.includes("natural") || text.includes("organic"))
      return "Natural Beauty";

    return null;
  }

  /**
   * Extract beauty-related tags from article
   * @param {Object} article - Article object
   * @returns {Array} Array of tags
   */
  extractBeautyTags(article) {
    const text = `${article.title || ""} ${
      article.snippet || ""
    }`.toLowerCase();
    const allTags = [
      "skincare",
      "makeup",
      "beauty tips",
      "anti-aging",
      "moisturizer",
      "serum",
      "cleanser",
      "sunscreen",
      "K-beauty",
      "natural beauty",
      "acne treatment",
      "glowing skin",
      "routine",
      "dermatologist",
      "facial",
      "cosmetics",
      "foundation",
      "lipstick",
      "mascara",
    ];

    return allTags
      .filter((tag) => text.includes(tag.toLowerCase()))
      .slice(0, 3);
  }

  /**
   * Get appropriate beauty image based on category
   * @param {Object} article - Article object
   * @param {string} category - Article category
   * @returns {string} Image URL
   */
  getBeautyImage(article, category) {
    const imageMap = {
      "K-Beauty": [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop",
      ],
      "Makeup Tutorial": [
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=250&fit=crop",
      ],
      "Skincare Routine": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop",
      ],
      "Tips Kecantikan": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop",
      ],
    };

    const categoryImages = imageMap[category] || imageMap["Tips Kecantikan"];
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
  }

  /**
   * Search articles by query
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Search results
   */
  async searchArticles(query, page = 1, pageSize = 10) {
    return this.fetchArticles(query, page, pageSize);
  }

  /**
   * Fetch skincare-specific news
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Skincare articles
   */
  async fetchSkincareNews(page = 1, pageSize = 10) {
    return this.fetchArticles(
      "skincare routine dermatologist tips",
      page,
      pageSize
    );
  }

  /**
   * Get article by ID (from cache or fallback data)
   * @param {string|number} articleId - Article ID
   * @returns {Object|null} Article or null if not found
   */
  getArticleById(articleId) {
    // Check cached articles first
    const allCachedKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("dermalyze_cache_articles_")
    );

    for (const key of allCachedKeys) {
      try {
        const cached = this.getCache(key.replace("dermalyze_cache_", ""));
        if (cached && cached.articles) {
          const found = cached.articles.find(
            (article) => article.id == articleId
          );
          if (found) return found;
        }
      } catch (error) {
        continue;
      }
    }

    // Check fallback data
    return this.fallbackData.find((article) => article.id == articleId) || null;
  }

  /**
   * Get enhanced fallback articles for offline use
   * @returns {Array} Fallback articles
   */
  getEnhancedFallbackArticles() {
    return [
      {
        id: 1,
        title: "🌟 Rahasia Glass Skin ala Korea: 10 Langkah Mudah",
        excerpt:
          "Dapatkan kulit bening seperti kaca dengan rutinitas K-beauty yang telah terbukti efektif. Tips dari beauty expert Korea untuk kulit glowing maksimal!",
        content:
          "Glass skin adalah tren kecantikan Korea yang menghasilkan kulit bening, halus, dan bercahaya seperti kaca...",
        category: "K-Beauty",
        author: "Dr. Kim Soo-jin",
        publishedAt: "2024-01-20",
        readTime: "8 min",
        image:
          "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop",
        tags: ["glass skin", "K-beauty", "skincare routine"],
        views: 4250,
        likes: 312,
        rating: "4.8",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/glass-skin",
        source: "K-Beauty Indonesia",
      },
      {
        id: 2,
        title: "💄 Makeup Natural untuk Pemula: Tutorial Step by Step",
        excerpt:
          "Pelajari teknik makeup natural yang mudah untuk pemula. Dari base makeup hingga finishing touch, semua dijelaskan dengan detail!",
        content:
          "Makeup natural adalah pilihan terbaik untuk pemula yang ingin tampil cantik tanpa berlebihan...",
        category: "Makeup Tutorial",
        author: "Sarah Beauty",
        publishedAt: "2024-01-19",
        readTime: "6 min",
        image:
          "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop",
        tags: ["makeup natural", "tutorial", "pemula"],
        views: 3180,
        likes: 245,
        rating: "4.6",
        trending: false,
        sourceUrl: "https://www.allure.com/story/natural-makeup-tutorial",
        source: "Beauty Indonesia",
      },
      // Add more fallback articles as needed...
    ];
  }
}

export default ArticleModel;
