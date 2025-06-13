import BaseModel from "../core/BaseModel.js";

/**
 * AnalysisModel - Mengelola skin analysis, history, dan ML predictions
 * Handles: Frontend → Backend API → ML Service → Backend API → Frontend
 */
class AnalysisModel extends BaseModel {
  constructor() {
    super();
    this.cacheKey = "analysis_history";
    this.log("AnalysisModel initialized");
  }

  /**
   * Predict skin type from uploaded image
   * Flow: Frontend → Backend API → ML Service → Backend API → Frontend
   * @param {File} imageFile - Image file to analyze
   * @returns {Promise<Object>} Analysis result
   */
  async predictSkinType(imageFile) {
    try {
      this.log("Starting skin type prediction", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
      });

      if (!this.isAuthenticated()) {
        throw new Error("Authentication required. Please login first.");
      }

      // Validate image file
      const validation = this.validateImageFile(imageFile);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("file", imageFile);

      this.log("Sending to Backend API", { endpoint: "/predict" });

      // Call Backend API (which will handle ML service communication)
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: formData,
      });

      // Handle response
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        this.log("Failed to parse response as JSON", parseError);

        if (
          responseText.includes("<!DOCTYPE") ||
          responseText.includes("<html")
        ) {
          throw new Error(
            "Server returned HTML error page instead of JSON. Check server logs."
          );
        } else {
          throw new Error("Server returned invalid response format");
        }
      }

      if (!response.ok) {
        const errorMessage =
          data.error || data.message || `Server error: ${response.status}`;

        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        } else if (response.status === 500) {
          throw new Error(
            "Backend server error. The prediction service is currently unavailable."
          );
        } else if (response.status === 404) {
          throw new Error(
            "Prediction endpoint not found. Please check server configuration."
          );
        } else {
          throw new Error(errorMessage);
        }
      }

      this.log("Prediction successful", data);

      // Transform backend response for UI
      const transformedResult = this.transformBackendResponse(data);

      // Cache the result
      this.cacheAnalysisResult(transformedResult);

      return {
        success: true,
        data: transformedResult,
      };
    } catch (error) {
      this.log("Prediction error", error);

      // Provide user-friendly error messages
      let userMessage = error.message;

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        userMessage =
          "Cannot connect to server. Please check your internet connection.";
      } else if (error.message.includes("NetworkError")) {
        userMessage = "Network error. Please check your internet connection.";
      }

      return {
        success: false,
        message: this.formatError(error) || userMessage,
      };
    }
  }

  /**
   * Get analysis history for current user
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} History data
   */
  async getHistory(page = 1, limit = 10) {
    try {
      this.log("Fetching analysis history", { page, limit });

      if (!this.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      // Check cache first
      const cacheKey = `${this.cacheKey}_${page}_${limit}`;
      const cached = this.getCache(cacheKey, 5 * 60 * 1000); // 5 minutes
      if (cached) {
        this.log("Returning cached history");
        return cached;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const data = await this.apiCall(`/history?${queryParams}`, {
        method: "GET",
      });

      const result = {
        success: true,
        data: data,
      };

      // Cache successful response
      this.setCache(cacheKey, result, 5 * 60 * 1000); // 5 minutes

      this.log("History fetched successfully", {
        count: data.history?.length || 0,
      });

      return result;
    } catch (error) {
      this.log("History fetch error", error);

      // Try to return cached data as fallback
      const fallbackCache = this.getCache(this.cacheKey, 24 * 60 * 60 * 1000); // 24 hours
      if (fallbackCache) {
        this.log("Returning fallback cached history");
        return fallbackCache;
      }

      return {
        success: false,
        message: this.formatError(error),
        data: { history: [], pagination: null },
      };
    }
  }

  /**
   * Delete analysis from history
   * @param {string} analysisId - ID of analysis to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteAnalysis(analysisId) {
    try {
      this.log("Deleting analysis", { analysisId });

      if (!this.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      const data = await this.apiCall(`/history/${analysisId}`, {
        method: "DELETE",
      });

      // Clear related cache
      this.clearCache();

      this.log("Analysis deleted successfully", { analysisId });

      return {
        success: true,
        message: "Analisis berhasil dihapus",
      };
    } catch (error) {
      this.log("Delete analysis error", error);
      return {
        success: false,
        message: this.formatError(error),
      };
    }
  }

  /**
   * Get detailed analysis by ID
   * @param {string} analysisId - ID of analysis
   * @returns {Promise<Object>} Analysis details
   */
  async getAnalysisById(analysisId) {
    try {
      this.log("Fetching analysis details", { analysisId });

      if (!this.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      // Check cache first
      const cacheKey = `analysis_${analysisId}`;
      const cached = this.getCache(cacheKey);
      if (cached) {
        this.log("Returning cached analysis details");
        return cached;
      }

      const data = await this.apiCall(`/history/${analysisId}`, {
        method: "GET",
      });

      const result = {
        success: true,
        data: data,
      };

      // Cache the result
      this.setCache(cacheKey, result);

      this.log("Analysis details fetched successfully", { analysisId });

      return result;
    } catch (error) {
      this.log("Get analysis details error", error);
      return {
        success: false,
        message: this.formatError(error),
      };
    }
  }

  /**
   * Validate image file before upload
   * @param {File} file - Image file to validate
   * @returns {Object} Validation result
   */
  validateImageFile(file) {
    const errors = [];

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      errors.push("Format file harus JPEG, PNG, atau WebP");
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push("Ukuran file maksimal 5MB");
    }

    // Check minimum size (at least 1KB)
    if (file.size < 1024) {
      errors.push("File terlalu kecil, minimal 1KB");
    }

    return {
      isValid: errors.length === 0,
      error: errors[0] || null,
    };
  }

  /**
   * Transform backend response to match UI expectations
   * @param {Object} backendResponse - Response from backend API
   * @returns {Object} Transformed result for UI
   */
  transformBackendResponse(backendResponse) {
    const analysisData = backendResponse.data || backendResponse;

    // Map backend skin type to standardized format
    const skinType = this.mapSkinType(analysisData.hasil || "unknown");
    const confidence = analysisData.akurasi || 0.85;

    return {
      id: analysisData.id,
      skinType: skinType,
      confidence: Math.round(confidence * 100), // Convert to percentage
      recommendations: this.getSkinCareRecommendations(skinType),
      timestamp: analysisData.created || new Date().toISOString(),
      imageUrl: analysisData.wajah
        ? this.buildImageUrl(analysisData.wajah)
        : null,
      userId: analysisData.userid,
      collectionId: analysisData.collectionId,
      accuracy: Math.round(confidence * 100),
      rawResult: analysisData.hasil,
    };
  }

  /**
   * Map backend skin type to standardized format
   * @param {string} backendSkinType - Skin type from backend
   * @returns {string} Standardized skin type
   */
  mapSkinType(backendSkinType) {
    const mapping = {
      normal: "Normal",
      oily: "Oily",
      dry: "Dry",
      combination: "Combination",
      sensitive: "Sensitive",
    };

    return mapping[backendSkinType.toLowerCase()] || "Normal";
  }

  /**
   * Build proper image URL from backend path
   * @param {string} imagePath - Image path from backend
   * @param {string} recordId - Record ID from PocketBase (optional)
   * @returns {string} Complete image URL
   */
  buildImageUrl(imagePath, recordId = null) {
    if (!imagePath) return null;

    // If already a complete URL, check if it needs proxy conversion
    if (imagePath.startsWith("http")) {
      // Convert PocketBase URLs to use Netlify proxy
      if (imagePath.includes("52.77.219.198:8090/api/files/")) {
        const pathPart = imagePath.split("/api/files/")[1];
        return `/files/${pathPart}`;
      }
      return imagePath;
    }

    // Clean the path
    let cleanPath = imagePath;
    if (cleanPath.startsWith("uploads/")) {
      cleanPath = cleanPath.substring(8);
    }

    const filename = cleanPath.includes("/")
      ? cleanPath.split("/").pop()
      : cleanPath;

    if (recordId) {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJwYmNfMTczNjQ1NTQ5NCIsImV4cCI6MTc1MDE0MDgzNCwiaWQiOiI0bXdoNWU3MjA0OTcwNDEiLCJyZWZyZXNoYWJsZSI6dHJ1ZSwidHlwZSI6ImF1dGgifQ.guxzRknaLiMQMnyGiXV4U-zni7bRugBaMbWFRDksyqw";
      return `/files/pbc_2982428850/${recordId}/${filename}?token=${token}`;
    }

    // Try to extract record ID from filename
    const recordIdMatch = filename.match(/^([a-z0-9]{15})/);
    if (recordIdMatch) {
      const extractedRecordId = recordIdMatch[1];
      return `/files/pbc_2982428850/${extractedRecordId}/${filename}`;
    }

    // Fallback to backend API endpoint
    return `${this.baseUrl}/images/${filename}`;
  }

  /**
   * Get skin care recommendations based on skin type
   * @param {string} skinType - Detected skin type
   * @returns {Array} Array of recommendations
   */
  getSkinCareRecommendations(skinType) {
    const recommendations = {
      normal: [
        "Gunakan pembersih wajah yang lembut 2x sehari",
        "Aplikasikan pelembab ringan setiap pagi dan malam",
        "Gunakan sunscreen SPF 30+ setiap hari",
        "Lakukan eksfoliasi ringan 1-2x seminggu",
        "Gunakan serum vitamin C di pagi hari",
      ],
      oily: [
        "Gunakan pembersih wajah berbahan salicylic acid 2x sehari",
        "Aplikasikan toner bebas alkohol untuk mengontrol minyak",
        "Gunakan pelembab oil-free atau gel-based",
        "Gunakan sunscreen non-comedogenic SPF 30+",
        "Lakukan clay mask 1-2x seminggu",
        "Hindari over-cleansing yang dapat memicu produksi minyak berlebih",
      ],
      dry: [
        "Gunakan pembersih wajah yang sangat lembut dan hydrating",
        "Aplikasikan pelembab kaya dan nourishing 2x sehari",
        "Gunakan serum hyaluronic acid untuk hidrasi ekstra",
        "Gunakan sunscreen dengan moisturizer SPF 30+",
        "Hindari produk berbahan alkohol",
        "Gunakan face oil di malam hari untuk nutrisi ekstra",
      ],
      combination: [
        "Gunakan pembersih wajah yang seimbang",
        "Aplikasikan produk berbeda untuk area T-zone dan pipi",
        "Gunakan toner untuk area berminyak",
        "Aplikasikan pelembab ringan di T-zone, lebih kaya di pipi",
        "Gunakan sunscreen SPF 30+ setiap hari",
      ],
      sensitive: [
        "Gunakan produk hypoallergenic dan fragrance-free",
        "Lakukan patch test sebelum menggunakan produk baru",
        "Gunakan pembersih yang sangat lembut",
        "Aplikasikan pelembab yang menenangkan",
        "Gunakan sunscreen mineral SPF 30+",
        "Hindari eksfoliasi berlebihan",
      ],
    };

    return recommendations[skinType.toLowerCase()] || recommendations.normal;
  }

  /**
   * Cache analysis result for offline access
   * @param {Object} result - Analysis result to cache
   */
  cacheAnalysisResult(result) {
    try {
      const cached = this.getCache("recent_analyses") || [];
      cached.unshift(result);

      // Keep only last 10 results
      const trimmed = cached.slice(0, 10);
      this.setCache("recent_analyses", trimmed, 24 * 60 * 60 * 1000); // 24 hours

      this.log("Analysis result cached", { id: result.id });
    } catch (error) {
      this.log("Failed to cache analysis result", error);
    }
  }

  /**
   * Get cached analysis results for offline access
   * @returns {Array} Cached analysis results
   */
  getCachedAnalyses() {
    return this.getCache("recent_analyses") || [];
  }
}

export default AnalysisModel;
