/**
 * Analysis Service
 * Handles skin analysis prediction and history management
 */

import CONFIG from "../config.js";

class AnalysisService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.enableLogging = CONFIG.ENABLE_LOGGING;
  }

  /**
   * Get authentication token from localStorage
   * @returns {string|null} Token or null if not found
   */
  getToken() {
    return localStorage.getItem("dermalyze_token");
  }

  /**
   * Predict skin type from uploaded image
   * @param {File} imageFile - Image file to analyze
   * @returns {Promise<Object>} Analysis result
   */
  async predictSkinType(imageFile) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      console.log("🚀 Starting skin type prediction...");
      console.log("📁 Image file:", imageFile.name, imageFile.size, "bytes");

      const formData = new FormData();
      formData.append("file", imageFile);

      console.log("📤 Sending to Backend API:", `${this.baseUrl}/predict`);
      console.log(
        "🔄 Flow: Frontend → Backend API → Flask → PocketBase → Response"
      );

      const response = await fetch(`${this.baseUrl}/predict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📥 Backend API Response Status:", response.status);
      console.log(
        "📋 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Get response text first to handle both JSON and HTML responses
      const responseText = await response.text();
      console.log("📄 Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("📊 Backend API Response Data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", parseError);
        console.log("📄 Response is not JSON, likely HTML error page");

        // If it's HTML, it's probably an error page
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
        console.error("Server error:", errorMessage);

        // Provide specific error messages based on status code
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

      console.log("✅ Prediction successful! Backend processed the image.");
      console.log("📊 Final result:", data);

      // Transform backend response to match UI expectations
      const transformedResult = this.transformBackendResponse(data);
      console.log("🔄 Transformed result:", transformedResult);

      return {
        success: true,
        data: transformedResult,
      };
    } catch (error) {
      console.error("Prediction error:", error);

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
        message:
          userMessage || "Terjadi kesalahan saat analisis. Silakan coba lagi.",
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
      const token = this.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseUrl}/history?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("History fetch error:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil riwayat",
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
      const token = this.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${this.baseUrl}/history/${analysisId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete analysis");
      }

      return {
        success: true,
        message: "Analisis berhasil dihapus",
      };
    } catch (error) {
      console.error("Delete analysis error:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat menghapus analisis",
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
      const token = this.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${this.baseUrl}/history/${analysisId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch analysis details");
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("Get analysis details error:", error);
      return {
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil detail analisis",
      };
    }
  }

  /**
   * Transform backend response to match UI expectations
   * @param {Object} backendResponse - Response from backend API
   * @returns {Object} Transformed result for UI
   */
  transformBackendResponse(backendResponse) {
    // Extract analysis data from backend response structure
    // New format: { success: true, data: { akurasi, hasil, id, ... } }
    const analysisData = backendResponse.data || backendResponse;

    // Map backend field names to UI expected format
    const skinType = this.mapSkinType(analysisData.hasil || "unknown");

    // Use actual confidence from backend if available
    const confidence = analysisData.akurasi || 0.85;

    // Only return ML results - no additional frontend processing
    return {
      id: analysisData.id,
      skinType: skinType,
      confidence: Math.round(confidence * 100), // Convert to percentage (0.9994 → 99%)
      recommendations: this.getSkinCareRecommendations(skinType),
      timestamp: analysisData.created || new Date().toISOString(),
      imageUrl: analysisData.wajah
        ? this.buildImageUrl(analysisData.wajah)
        : null,
      userId: analysisData.userid,
      collectionId: analysisData.collectionId,

      // Additional backend data
      accuracy: Math.round(confidence * 100), // Also in percentage
      rawResult: analysisData.hasil,
    };
  }

  /**
   * Build proper image URL from backend path
   * @param {string} imagePath - Image path from backend
   * @param {string} recordId - Record ID from PocketBase (optional)
   * @returns {string} Complete image URL
   */
  buildImageUrl(imagePath, recordId = null) {
    if (!imagePath) {
      console.warn("⚠️ buildImageUrl: No image path provided");
      return null;
    }

    console.log("🔗 buildImageUrl called with:", { imagePath, recordId });

    // If already a complete URL, check if it needs proxy conversion
    if (imagePath.startsWith("http")) {
      console.log("🌐 Image path is already a complete URL");

      // For PocketBase URLs with tokens, we need to proxy them to avoid CORS issues
      if (imagePath.includes("52.77.219.198:8090/api/files/")) {
        // Extract the path after /api/files/ including query parameters
        const pathPart = imagePath.split("/api/files/")[1];

        // Detect environment
        const isDevelopment =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.port === "5173";

        if (isDevelopment) {
          // In development, use the direct URL
          console.log("🔗 Development: Using direct PocketBase URL");
          return imagePath;
        } else {
          // In production, use Vercel proxy
          const proxyUrl = `/files/${pathPart}`;
          console.log("🔄 Production: Converted to proxy URL:", proxyUrl);
          return proxyUrl;
        }
      }

      // For other HTTP URLs, return as-is
      return imagePath;
    }

    console.log("🔗 Building PocketBase image URL for:", imagePath);
    console.log("🆔 Record ID:", recordId);

    // Clean the path - remove leading "uploads/" if it exists
    let cleanPath = imagePath;
    if (cleanPath.startsWith("uploads/")) {
      cleanPath = cleanPath.substring(8);
      console.log("🧹 Cleaned path (removed uploads/):", cleanPath);
    }

    // Extract filename from path
    const filename = cleanPath.includes("/")
      ? cleanPath.split("/").pop()
      : cleanPath;

    console.log("📁 Extracted filename:", filename);

    // Use the correct PocketBase API format with token support
    // Format: http://52.77.219.198:8090/api/files/pbc_2982428850/{record_id}/{filename}?token=
    if (recordId) {
      // Handle case where imagePath might already include the record ID
      let actualFilename = filename;
      if (imagePath.includes("/")) {
        // If imagePath is like "ctr2dgurf472a7x/image.jpg", extract just the filename
        actualFilename = imagePath.split("/").pop();
      }

      console.log("📁 Actual filename to use:", actualFilename);

      // Build PocketBase URL with token parameter (token will be added by PocketBase automatically)
      const directUrl = `http://52.77.219.198:8090/api/files/pbc_2982428850/${recordId}/${actualFilename}?token=`;
      console.log("🔗 Built direct PocketBase URL with token:", directUrl);

      // Detect environment and return appropriate URL
      const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.port === "5173";

      if (isDevelopment) {
        // In development, use direct URL
        return directUrl;
      } else {
        // For production deployment, use Vercel proxy
        const proxyUrl = `/files/pbc_2982428850/${recordId}/${actualFilename}?token=`;
        console.log("🔗 Built proxy URL for production:", proxyUrl);
        return proxyUrl;
      }
    }

    // Fallback: try to extract record ID from filename or use a pattern
    // If filename contains record ID pattern, extract it
    const recordIdMatch = filename.match(/^([a-z0-9]{15})/);
    if (recordIdMatch) {
      const extractedRecordId = recordIdMatch[1];
      const proxyUrl = `/files/pbc_2982428850/${extractedRecordId}/${filename}`;
      console.log("🔗 Built proxy URL with extracted record ID:", proxyUrl);
      return proxyUrl;
    }

    // Last fallback: use backend API endpoint via proxy
    console.warn("⚠️ No record ID available, falling back to backend API");
    const fallbackUrl = `/api/images/${filename}`;
    console.log("🔗 Fallback URL:", fallbackUrl);
    return fallbackUrl;
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
   * Transform analysis result for UI display (legacy method)
   * @param {Object} apiResult - Raw API result
   * @returns {Object} Transformed result for UI
   */
  transformAnalysisResult(apiResult) {
    // Transform the API response to match the expected UI format
    return {
      skinType: apiResult.skinType || "Unknown",
      oilLevel: apiResult.oilLevel || 0,
      moistureLevel: apiResult.moistureLevel || 0,
      acneRisk: apiResult.acneRisk || 0,
      wrinkleLevel: apiResult.wrinkleLevel || 0,
      poreSize: apiResult.poreSize || "Unknown",
      skinTone: apiResult.skinTone || "Unknown",
      recommendations: apiResult.recommendations || [],
      detectedIssues: apiResult.detectedIssues || [],
      confidence: apiResult.confidence || 0,
      timestamp: apiResult.timestamp || new Date().toISOString(),
    };
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
}

// Create and export a singleton instance
const analysisService = new AnalysisService();
export default analysisService;
