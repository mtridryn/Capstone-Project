const NEWS_API_KEY = "8b64d643aeef4d07a8757feafbe1227d";
const NEWS_API_BASE_URL = "https://newsapi.org/v2";
// Alternative proxy URLs to bypass CORS
const PROXY_URLS = [
  "https://api.allorigins.win/raw?url=",
  "https://cors-anywhere.herokuapp.com/",
  "https://api.codetabs.com/v1/proxy?quest=",
];

class NewsApiService {
  constructor() {
    this.apiKey = NEWS_API_KEY;
    this.baseUrl = NEWS_API_BASE_URL;
  }

  async fetchSkincareNews(page = 1, pageSize = 6) {
    // Try multiple approaches to get real data
    const approaches = [
      () => this.tryDirectAPI(page, pageSize),
      () => this.tryWithProxy(page, pageSize),
      () => this.tryAlternativeAPI(page, pageSize),
    ];

    for (const approach of approaches) {
      try {
        console.log("Trying API approach...");
        const result = await approach();
        if (result && result.articles && result.articles.length > 0) {
          console.log(
            "Successfully fetched real data:",
            result.articles.length,
            "articles"
          );
          return result;
        }
      } catch (error) {
        console.log("API approach failed:", error.message);
        continue;
      }
    }

    // If all approaches fail, throw error to trigger fallback
    throw new Error("All API approaches failed - using fallback data");
  }

  async tryDirectAPI(page, pageSize) {
    const searchQuery =
      'skincare OR "skin care" OR beauty OR "facial care" OR "makeup tips" OR "beauty routine" OR cosmetics OR dermatology';

    const url =
      `${this.baseUrl}/everything?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `language=en&` +
      `sortBy=publishedAt&` +
      `page=${page}&` +
      `pageSize=${pageSize}&` +
      `apiKey=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Direct API failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      articles: this.transformArticles(data.articles),
      totalResults: data.totalResults,
      totalPages: Math.ceil(data.totalResults / pageSize),
    };
  }

  async tryWithProxy(page, pageSize) {
    const searchQuery =
      'skincare OR "skin care" OR beauty OR "facial care" OR "makeup tips" OR "beauty routine" OR cosmetics OR dermatology';

    const apiUrl =
      `${this.baseUrl}/everything?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `language=en&` +
      `sortBy=publishedAt&` +
      `page=${page}&` +
      `pageSize=${pageSize}&` +
      `apiKey=${this.apiKey}`;

    // Try different proxy services
    for (const proxyUrl of PROXY_URLS) {
      try {
        const url = proxyUrl + encodeURIComponent(apiUrl);
        console.log("Trying proxy:", proxyUrl);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            return {
              articles: this.transformArticles(data.articles),
              totalResults: data.totalResults,
              totalPages: Math.ceil(data.totalResults / pageSize),
            };
          }
        }
      } catch (error) {
        console.log("Proxy failed:", proxyUrl, error.message);
        continue;
      }
    }

    throw new Error("All proxies failed");
  }

  async tryAlternativeAPI(page, pageSize) {
    // Try with different search terms
    const alternativeQueries = [
      "skincare tips",
      "beauty routine",
      "facial care",
      "makeup tutorial",
      "skin health",
      "beauty trends",
      "cosmetics review",
    ];

    for (const query of alternativeQueries) {
      try {
        const apiUrl =
          `${this.baseUrl}/everything?` +
          `q=${encodeURIComponent(query)}&` +
          `language=en&` +
          `sortBy=popularity&` +
          `page=${page}&` +
          `pageSize=${pageSize}&` +
          `apiKey=${this.apiKey}`;

        const url = PROXY_URLS[0] + encodeURIComponent(apiUrl);
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            return {
              articles: this.transformArticles(data.articles),
              totalResults: data.totalResults,
              totalPages: Math.ceil(data.totalResults / pageSize),
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error("Alternative API approaches failed");
  }

  transformArticles(articles) {
    return articles
      .filter(
        (article) =>
          article.title &&
          article.description &&
          article.urlToImage &&
          !article.title.includes("[Removed]") &&
          !article.description.includes("[Removed]")
      )
      .map((article, index) => ({
        id: this.generateId(article.url),
        title: this.cleanTitle(article.title),
        excerpt: this.cleanDescription(article.description),
        content: article.content || article.description,
        category: this.categorizeArticle(article.title, article.description),
        author: article.author || article.source?.name || "Beauty Expert",
        publishedAt:
          article.publishedAt?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        readTime: this.estimateReadTime(article.content || article.description),
        image: article.urlToImage,
        tags: this.extractTags(article.title, article.description),
        views: 0, // Real views should come from backend
        likes: 0, // Real likes should come from backend
        sourceUrl: article.url,
        source: article.source?.name,
      }));
  }

  generateId(url) {
    // Generate a simple hash from URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  cleanTitle(title) {
    // Remove source name from title if present
    return title.replace(/ - [^-]*$/, "").trim();
  }

  cleanDescription(description) {
    // Clean up description and limit length
    const cleaned = description.replace(/\[.*?\]/g, "").trim();
    return cleaned.length > 150 ? cleaned.substring(0, 150) + "..." : cleaned;
  }

  categorizeArticle(title, description) {
    const text = (title + " " + description).toLowerCase();

    if (
      text.includes("acne") ||
      text.includes("pimple") ||
      text.includes("jerawat")
    )
      return "Perawatan Jerawat";
    if (
      text.includes("anti-aging") ||
      text.includes("wrinkle") ||
      text.includes("aging") ||
      text.includes("anti aging")
    )
      return "Anti-Aging";
    if (
      text.includes("sunscreen") ||
      text.includes("sun protection") ||
      text.includes("spf") ||
      text.includes("uv")
    )
      return "Perlindungan Kulit";
    if (
      text.includes("makeup") ||
      text.includes("cosmetic") ||
      text.includes("foundation") ||
      text.includes("lipstick")
    )
      return "Makeup Tips";
    if (
      text.includes("korean") ||
      text.includes("k-beauty") ||
      text.includes("kbeauty")
    )
      return "K-Beauty";
    if (
      text.includes("natural") ||
      text.includes("organic") ||
      text.includes("diy") ||
      text.includes("alami")
    )
      return "Perawatan Alami";
    if (text.includes("sensitive") || text.includes("gentle"))
      return "Kulit Sensitif";
    if (text.includes("trend") || text.includes("2024") || text.includes("new"))
      return "Trend Kecantikan";
    if (
      text.includes("routine") ||
      text.includes("regimen") ||
      text.includes("facial")
    )
      return "Perawatan Wajah";

    return "Tips Kecantikan";
  }

  extractTags(title, description) {
    const text = (title + " " + description).toLowerCase();
    const tags = [];

    const tagKeywords = {
      skincare: ["skincare", "skin care"],
      beauty: ["beauty", "beautiful"],
      tips: ["tips", "advice"],
      routine: ["routine", "regimen"],
      acne: ["acne", "pimple", "breakout"],
      "anti-aging": ["anti-aging", "wrinkle", "aging"],
      sunscreen: ["sunscreen", "spf", "sun protection"],
      moisturizer: ["moisturizer", "hydration"],
      natural: ["natural", "organic"],
      sensitive: ["sensitive", "gentle"],
    };

    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags.slice(0, 3); // Limit to 3 tags
  }

  estimateReadTime(content) {
    if (!content) return "3 min";

    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    return `${Math.max(1, Math.min(minutes, 15))} min`; // Between 1-15 minutes
  }

  async searchArticles(query, page = 1, pageSize = 6) {
    try {
      const searchQuery = `${query} skincare beauty skin care`;

      const apiUrl =
        `${this.baseUrl}/everything?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `language=en&` +
        `sortBy=relevancy&` +
        `page=${page}&` +
        `pageSize=${pageSize}&` +
        `apiKey=${this.apiKey}`;

      // Use proxy to bypass CORS
      const url = PROXY_URLS[0] + encodeURIComponent(apiUrl);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transformedArticles = this.transformArticles(data.articles);

      return {
        articles: transformedArticles,
        totalResults: data.totalResults,
        totalPages: Math.ceil(data.totalResults / pageSize),
      };
    } catch (error) {
      console.error("Error searching articles:", error);
      throw error;
    }
  }
}

export default new NewsApiService();
