import CONFIG from "../config.js";

// Enhanced Beauty Articles API Service using RapidAPI
class NewsApiService {
  constructor() {
    // RapidAPI configuration for beauty and skincare content
    this.rapidApiKey = CONFIG.RAPIDAPI_KEY;
    this.rapidApiHost = CONFIG.RAPIDAPI_HOST;
    this.baseUrl = `https://${CONFIG.RAPIDAPI_HOST}`;
    this.fallbackData = this.getEnhancedFallbackArticles();
    this.enableLogging = CONFIG.ENABLE_LOGGING;
  }

  async fetchArticles(
    query = "beauty skincare makeup",
    page = 1,
    pageSize = 12
  ) {
    try {
      console.log("🔍 Fetching beauty articles from multiple sources...");

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
            console.log(
              "✅ Successfully fetched real articles:",
              result.articles.length
            );
            return {
              success: true,
              articles: result.articles,
              totalResults: result.totalResults,
              isUsingFallback: false,
            };
          }
        } catch (error) {
          console.log("API approach failed:", error.message);
          continue;
        }
      }

      throw new Error("All API approaches failed");
    } catch (error) {
      console.error("❌ All APIs failed, using enhanced fallback data...");

      // Return enhanced fallback data with pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = this.fallbackData.slice(startIndex, endIndex);

      return {
        success: true,
        articles: paginatedArticles,
        totalResults: this.fallbackData.length,
        isUsingFallback: true,
        error: error.message,
      };
    }
  }

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
      this.baseUrl
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

  async tryAlternativeAPI(query, page, pageSize) {
    // Try with different RapidAPI endpoint
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

  async tryNewsAPI(query, page, pageSize) {
    // Fallback to public news sources
    const publicSources = [
      "https://newsapi.org/v2/everything",
      "https://api.currentsapi.services/v1/search",
    ];

    // This will likely fail due to CORS, but we try anyway
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

  // Check if article is beauty/skincare related
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

  // Get appropriate image based on article content and category
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
      "Anti-Aging": [
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=250&fit=crop",
      ],
      "Natural Beauty": [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=250&fit=crop",
      ],
      "Tips Kecantikan": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=250&fit=crop",
      ],
    };

    const categoryImages = imageMap[category] || imageMap["Tips Kecantikan"];
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
  }

  // Transform RapidAPI article to our format
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
      views: 0, // Real views from backend
      likes: 0, // Real likes from backend
      sourceUrl: article.url,
      source: article.provider?.name || "Beauty News",
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0 rating
      trending: Math.random() > 0.7, // 30% chance of being trending
    };
  }

  // Transform Bing API article to our format
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
      views: 0, // Real views from backend
      likes: 0, // Real likes from backend
      sourceUrl: article.url,
      source: article.provider?.[0]?.name || "Beauty News",
      rating: (Math.random() * 2 + 3).toFixed(1),
      trending: Math.random() > 0.7,
    };
  }

  // Transform NewsAPI article to our format
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
      views: 0, // Real views from backend
      likes: 0, // Real likes from backend
      sourceUrl: article.url,
      source: article.source?.name || "Beauty News",
      rating: (Math.random() * 2 + 3).toFixed(1),
      trending: Math.random() > 0.7,
    };
  }

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

  transformArticle(article) {
    return {
      id: Date.now() + Math.random(),
      title: article.title,
      excerpt:
        article.description || article.content?.substring(0, 150) + "...",
      content: article.content,
      category: "Kecantikan",
      author: article.author || "Beauty Expert",
      publishedAt: article.publishedAt,
      readTime: "3 min",
      image:
        article.urlToImage ||
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
      tags: ["skincare", "beauty", "tips"],
      views: 0, // Real views from backend
      likes: 0, // Real likes from backend
      sourceUrl: article.url,
      source: article.source?.name || "Beauty News",
    };
  }

  // Add search functionality
  async searchArticles(query, page = 1, pageSize = 10) {
    return this.fetchArticles(query, page, pageSize);
  }

  // Add skincare news functionality
  async fetchSkincareNews(page = 1, pageSize = 10) {
    return this.fetchArticles(
      "skincare routine dermatologist tips",
      page,
      pageSize
    );
  }

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
          "Pelajari teknik makeup natural yang mudah dan cocok untuk sehari-hari. Dari base makeup hingga finishing touch yang sempurna!",
        content:
          "Makeup natural adalah kunci tampilan fresh dan percaya diri setiap hari...",
        category: "Makeup Tutorial",
        author: "Rina Makeup Artist",
        publishedAt: "2024-01-18",
        readTime: "12 min",
        image:
          "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop",
        tags: ["makeup natural", "tutorial", "pemula"],
        views: 3890,
        likes: 267,
        rating: "4.6",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/natural-makeup-look",
        source: "Makeup Indonesia",
      },
      {
        id: 3,
        title: "🧴 Serum Vitamin C: Panduan Lengkap untuk Kulit Cerah",
        excerpt:
          "Manfaat luar biasa vitamin C untuk kulit dan cara menggunakannya dengan benar. Rekomendasi produk terbaik dari dermatologist!",
        content:
          "Vitamin C adalah salah satu ingredient paling powerful dalam skincare...",
        category: "Skincare Routine",
        author: "Dr. Sarah Dermatologi",
        publishedAt: "2024-01-16",
        readTime: "10 min",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
        tags: ["vitamin C", "serum", "brightening"],
        views: 2980,
        likes: 198,
        rating: "4.7",
        trending: false,
        sourceUrl: "https://www.healthline.com/health/vitamin-c-serum-benefits",
        source: "Derma Care",
      },
      {
        id: 4,
        title: "🌿 DIY Face Mask dari Bahan Dapur yang Ampuh",
        excerpt:
          "Buat masker wajah alami dengan bahan-bahan yang ada di dapur. Resep mudah untuk berbagai masalah kulit!",
        content:
          "Perawatan kulit alami menggunakan bahan dapur semakin populer...",
        category: "Natural Beauty",
        author: "Dr. Herbal Beauty",
        publishedAt: "2024-01-14",
        readTime: "7 min",
        image:
          "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=250&fit=crop",
        tags: ["DIY", "natural", "face mask"],
        views: 2156,
        likes: 145,
        rating: "4.4",
        trending: false,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/diy-face-mask",
        source: "Natural Beauty",
      },
      {
        id: 5,
        title: "✨ Anti-Aging Skincare: Ingredient yang Wajib Ada",
        excerpt:
          "Temukan ingredient anti-aging terbaik yang terbukti secara ilmiah. Retinol, peptide, dan bahan aktif lainnya untuk kulit awet muda!",
        content:
          "Proses penuaan kulit bisa diperlambat dengan ingredient yang tepat...",
        category: "Anti-Aging",
        author: "Dr. James Anti-Aging",
        publishedAt: "2024-01-12",
        readTime: "15 min",
        image:
          "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=250&fit=crop",
        tags: ["anti-aging", "retinol", "peptide"],
        views: 3456,
        likes: 234,
        rating: "4.9",
        trending: true,
        sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2699641/",
        source: "Beauty Research",
      },
      {
        id: 6,
        title: "💋 Tren Lipstik 2024: Warna yang Wajib Dicoba",
        excerpt:
          "Discover the hottest lipstick colors and trends for 2024 yang akan mendominasi dunia beauty. From bold reds to subtle nudes!",
        content:
          "Tahun 2024 membawa tren warna lipstik yang beragam dan menarik...",
        category: "Makeup Tutorial",
        author: "Color Trend Expert",
        publishedAt: "2024-01-10",
        readTime: "6 min",
        image:
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=250&fit=crop",
        tags: ["lipstik", "trend 2024", "warna"],
        views: 2890,
        likes: 267,
        rating: "4.5",
        trending: false,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/lipstick-trends",
        source: "Color Trends",
      },
      {
        id: 7,
        title:
          "🌸 Skincare Routine Pagi vs Malam: Perbedaan yang Harus Diketahui",
        excerpt:
          "Pelajari perbedaan penting antara rutinitas skincare pagi dan malam untuk hasil maksimal. Tips dari dermatologist untuk kulit sehat 24/7!",
        content:
          "Rutinitas skincare yang berbeda untuk pagi dan malam sangat penting untuk kesehatan kulit...",
        category: "Skincare Routine",
        author: "Dr. Skincare Expert",
        publishedAt: "2024-01-08",
        readTime: "9 min",
        image:
          "https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?w=400&h=250&fit=crop",
        tags: ["morning routine", "night routine", "skincare"],
        views: 3245,
        likes: 189,
        rating: "4.7",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/morning-vs-night-routine",
        source: "Skincare Daily",
      },
      {
        id: 8,
        title: "✨ Highlighter Guide: Cara Pakai yang Benar untuk Glow Natural",
        excerpt:
          "Master the art of highlighting! Panduan lengkap menggunakan highlighter untuk mendapatkan glow yang natural dan tidak berlebihan.",
        content:
          "Highlighter adalah kunci untuk mendapatkan glow yang natural dan fresh...",
        category: "Makeup Tutorial",
        author: "Makeup Artist Pro",
        publishedAt: "2024-01-06",
        readTime: "7 min",
        image:
          "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=250&fit=crop",
        tags: ["highlighter", "glow", "makeup tips"],
        views: 2567,
        likes: 156,
        rating: "4.6",
        trending: false,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/how-to-apply-highlighter",
        source: "Makeup Mastery",
      },
      {
        id: 9,
        title: "🧴 Retinol untuk Pemula: Panduan Aman Memulai Anti-Aging",
        excerpt:
          "Mulai journey anti-aging dengan retinol yang aman! Tips memilih produk, cara pakai, dan menghindari iritasi untuk pemula.",
        content:
          "Retinol adalah gold standard dalam anti-aging, tapi harus digunakan dengan hati-hati...",
        category: "Anti-Aging",
        author: "Dr. Anti-Aging Specialist",
        publishedAt: "2024-01-04",
        readTime: "11 min",
        image:
          "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=250&fit=crop",
        tags: ["retinol", "anti-aging", "beginner guide"],
        views: 4123,
        likes: 298,
        rating: "4.9",
        trending: true,
        sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2699641/",
        source: "Dermatology Research",
      },
      {
        id: 10,
        title: "🌿 Skincare Ingredients yang Tidak Boleh Dicampur",
        excerpt:
          "Hindari disaster skincare! Pelajari kombinasi ingredients yang berbahaya dan cara layering produk yang aman untuk kulit.",
        content:
          "Mixing skincare ingredients yang salah bisa menyebabkan iritasi dan kerusakan kulit...",
        category: "Skincare Routine",
        author: "Dr. Ingredient Expert",
        publishedAt: "2024-01-02",
        readTime: "8 min",
        image:
          "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=250&fit=crop",
        tags: ["ingredients", "layering", "skincare safety"],
        views: 3789,
        likes: 234,
        rating: "4.8",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/skincare-ingredients-not-to-mix",
        source: "Safe Skincare",
      },
      {
        id: 11,
        title: "💄 Eyeshadow Blending Techniques untuk Mata yang Menawan",
        excerpt:
          "Master the perfect eyeshadow blend! Teknik profesional untuk menciptakan gradient mata yang sempurna dengan tools yang tepat.",
        content:
          "Eyeshadow blending adalah skill yang harus dikuasai untuk makeup mata yang flawless...",
        category: "Makeup Tutorial",
        author: "Eye Makeup Specialist",
        publishedAt: "2023-12-30",
        readTime: "10 min",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop",
        tags: ["eyeshadow", "blending", "eye makeup"],
        views: 2934,
        likes: 187,
        rating: "4.7",
        trending: false,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/eyeshadow-blending",
        source: "Eye Art Studio",
      },
      {
        id: 12,
        title: "🌟 Glass Skin vs Dewy Skin: Mana yang Cocok untuk Anda?",
        excerpt:
          "Pahami perbedaan glass skin dan dewy skin! Panduan memilih finish kulit yang sesuai dengan jenis kulit dan preferensi Anda.",
        content:
          "Glass skin dan dewy skin adalah dua tren yang berbeda dengan teknik berbeda...",
        category: "K-Beauty",
        author: "K-Beauty Guru",
        publishedAt: "2023-12-28",
        readTime: "6 min",
        image:
          "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop",
        tags: ["glass skin", "dewy skin", "K-beauty"],
        views: 3456,
        likes: 245,
        rating: "4.6",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/glass-skin-vs-dewy-skin",
        source: "K-Beauty Trends",
      },
      {
        id: 13,
        title: "🌺 Skincare untuk Kulit Sensitif: Panduan Lengkap",
        excerpt:
          "Kulit sensitif butuh perhatian khusus! Panduan memilih produk, ingredients yang aman, dan rutinitas yang tepat untuk kulit sensitif.",
        content:
          "Merawat kulit sensitif memerlukan pendekatan yang hati-hati dan produk yang tepat...",
        category: "Skincare Routine",
        author: "Dr. Sensitive Skin",
        publishedAt: "2023-12-26",
        readTime: "9 min",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
        tags: ["sensitive skin", "gentle skincare", "hypoallergenic"],
        views: 2876,
        likes: 198,
        rating: "4.8",
        trending: false,
        sourceUrl: "https://www.healthline.com/health/sensitive-skin",
        source: "Gentle Care",
      },
      {
        id: 14,
        title: "💅 Nail Care Routine: Tips untuk Kuku Sehat dan Cantik",
        excerpt:
          "Jangan lupakan nail care! Panduan lengkap merawat kuku dan kutikula untuk hasil yang sehat dan indah secara natural.",
        content:
          "Nail care yang proper adalah bagian penting dari beauty routine yang sering diabaikan...",
        category: "Tips Kecantikan",
        author: "Nail Care Expert",
        publishedAt: "2023-12-24",
        readTime: "7 min",
        image:
          "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=250&fit=crop",
        tags: ["nail care", "manicure", "nail health"],
        views: 1987,
        likes: 134,
        rating: "4.5",
        trending: false,
        sourceUrl: "https://www.healthline.com/health/nail-care-routine",
        source: "Nail Beauty",
      },
      {
        id: 15,
        title: "🌙 Overnight Beauty Treatments yang Wajib Dicoba",
        excerpt:
          "Manfaatkan waktu tidur untuk kecantikan! Discover overnight treatments yang bisa memberikan hasil maksimal saat Anda beristirahat.",
        content:
          "Overnight treatments adalah cara efektif untuk memberikan nutrisi intensif pada kulit...",
        category: "Skincare Routine",
        author: "Night Beauty Specialist",
        publishedAt: "2023-12-22",
        readTime: "8 min",
        image:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop",
        tags: ["overnight treatment", "night skincare", "intensive care"],
        views: 3234,
        likes: 223,
        rating: "4.7",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/overnight-treatments",
        source: "Night Care",
      },
      {
        id: 16,
        title: "🎨 Color Correcting: Teknik Makeup untuk Kulit Sempurna",
        excerpt:
          "Master color correcting techniques! Pelajari cara menggunakan color corrector untuk menyamarkan berbagai masalah kulit dengan sempurna.",
        content:
          "Color correcting adalah teknik makeup yang powerful untuk menciptakan base yang flawless...",
        category: "Makeup Tutorial",
        author: "Color Correction Pro",
        publishedAt: "2023-12-20",
        readTime: "10 min",
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=250&fit=crop",
        tags: ["color correcting", "makeup base", "flawless skin"],
        views: 2765,
        likes: 189,
        rating: "4.6",
        trending: false,
        sourceUrl:
          "https://www.healthline.com/health/beauty-skin-care/color-correcting",
        source: "Makeup Academy",
      },
      {
        id: 17,
        title: "🌿 Skincare Organik vs Konvensional: Mana yang Lebih Baik?",
        excerpt:
          "Organic vs conventional skincare debate! Analisis mendalam tentang perbedaan, keunggulan, dan cara memilih yang tepat untuk kulit Anda.",
        content:
          "Perdebatan antara skincare organik dan konvensional masih terus berlanjut...",
        category: "Natural Beauty",
        author: "Organic Beauty Expert",
        publishedAt: "2023-12-18",
        readTime: "12 min",
        image:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=250&fit=crop",
        tags: ["organic skincare", "natural beauty", "clean beauty"],
        views: 3567,
        likes: 267,
        rating: "4.8",
        trending: true,
        sourceUrl:
          "https://www.healthline.com/health/organic-vs-conventional-skincare",
        source: "Clean Beauty",
      },
      {
        id: 18,
        title: "💫 Skincare Myths yang Harus Berhenti Dipercaya",
        excerpt:
          "Busting skincare myths! Fakta vs mitos dalam dunia skincare yang perlu Anda ketahui untuk routine yang lebih efektif.",
        content:
          "Banyak mitos skincare yang masih dipercaya dan bisa merugikan kesehatan kulit...",
        category: "Tips Kecantikan",
        author: "Myth Buster Dermatologist",
        publishedAt: "2023-12-16",
        readTime: "9 min",
        image:
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=250&fit=crop",
        tags: ["skincare myths", "facts", "dermatology"],
        views: 4123,
        likes: 312,
        rating: "4.9",
        trending: true,
        sourceUrl: "https://www.webmd.com/beauty/features/skincare-myths",
        source: "Fact Check Beauty",
      },
    ];
  }
}

const newsApiService = new NewsApiService();
export default newsApiService;
