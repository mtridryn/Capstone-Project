/**
 * Points Service
 * Handles points management with backend API integration
 */

import CONFIG from "../config.js";
import authService from "./authService.js";

class PointsService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
    this.cacheKey = "dermalyze_points_cache";
    this.sessionsKey = "dermalyze_reading_sessions";
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
   * Add points to user account
   * @param {number} amount - Points to add
   * @param {string} reason - Reason for adding points
   * @param {string} articleId - Article ID (optional)
   * @returns {Promise<Object>} Result object
   */
  async addPoints(amount, reason = "", articleId = null) {
    try {
      console.log(`🎯 Adding ${amount} points for: ${reason}`);

      const user = authService.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const requestBody = {
        userId: user.id,
        amount: amount,
        reason: reason,
      };

      if (articleId) {
        requestBody.articleId = articleId;
      }

      const response = await fetch(`${this.baseUrl}/add-poin`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Points added successfully:", data);

      // Update cached user data with new points
      if (data.user && data.user.poin !== undefined) {
        const updatedUser = { ...user, poin: data.user.poin };
        authService.setAuthData(authService.getToken(), updatedUser);
      }

      return {
        success: true,
        points: data.user?.poin || 0,
        message: data.message || "Points added successfully",
        data: data,
      };
    } catch (error) {
      console.error("❌ Error adding points:", error);

      // Fallback: store points locally if API fails
      this.addPointsLocally(amount, reason);

      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  /**
   * Get user's current points from backend
   * @returns {Promise<number>} Current points
   */
  async getCurrentPoints() {
    try {
      const user = authService.getUser();
      if (!user) {
        return 0;
      }

      // For now, return points from cached user data
      // TODO: Implement GET endpoint for user points when available
      return user.poin || 0;
    } catch (error) {
      console.error("❌ Error getting current points:", error);
      return this.getLocalPoints();
    }
  }

  /**
   * Award reading points for an article
   * @param {string} articleId - Article ID
   * @param {string} articleTitle - Article title
   * @returns {Promise<Object>} Result object
   */
  async awardReadingPoints(articleId, articleTitle = "") {
    try {
      // Check if points already awarded for this article
      const readingSessions = this.getReadingSessions();
      if (readingSessions.has(articleId)) {
        console.log(`Points already awarded for article: ${articleId}`);
        return {
          success: false,
          alreadyAwarded: true,
          message: "Points already awarded for this article",
        };
      }

      // Add points via API
      const result = await this.addPoints(
        10,
        `Reading article: ${articleTitle || articleId}`,
        articleId
      );

      if (result.success) {
        // Mark article as read
        this.markArticleAsRead(articleId);
        return {
          success: true,
          points: result.points,
          message: "Reading points awarded successfully!",
        };
      } else {
        // Fallback: add points locally
        this.addPointsLocally(
          10,
          `Reading article: ${articleTitle || articleId}`
        );
        this.markArticleAsRead(articleId);
        return {
          success: true,
          points: this.getLocalPoints(),
          message: "Points added locally (will sync when online)",
          fallback: true,
        };
      }
    } catch (error) {
      console.error("❌ Error awarding reading points:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get reading sessions from localStorage
   * @returns {Set} Set of article IDs
   */
  getReadingSessions() {
    try {
      const sessions = localStorage.getItem(this.sessionsKey);
      return sessions ? new Set(JSON.parse(sessions)) : new Set();
    } catch (error) {
      console.error("Error getting reading sessions:", error);
      return new Set();
    }
  }

  /**
   * Mark article as read
   * @param {string} articleId - Article ID
   */
  markArticleAsRead(articleId) {
    try {
      const sessions = this.getReadingSessions();
      sessions.add(articleId);
      localStorage.setItem(this.sessionsKey, JSON.stringify([...sessions]));
      console.log(`📖 Article marked as read: ${articleId}`);
    } catch (error) {
      console.error("Error marking article as read:", error);
    }
  }

  /**
   * Add points locally (fallback)
   * @param {number} amount - Points to add
   * @param {string} reason - Reason
   */
  addPointsLocally(amount, reason) {
    try {
      const currentPoints = this.getLocalPoints();
      const newPoints = currentPoints + amount;
      localStorage.setItem(this.cacheKey, newPoints.toString());
      console.log(
        `💾 Points added locally: +${amount} (${reason}). Total: ${newPoints}`
      );
    } catch (error) {
      console.error("Error adding points locally:", error);
    }
  }

  /**
   * Get local points from localStorage
   * @returns {number} Local points
   */
  getLocalPoints() {
    try {
      const points = localStorage.getItem(this.cacheKey);
      return points ? parseInt(points, 10) : 0;
    } catch (error) {
      console.error("Error getting local points:", error);
      return 0;
    }
  }

  /**
   * Sync local points with backend (for offline support)
   * @returns {Promise<Object>} Sync result
   */
  async syncLocalPoints() {
    try {
      const localPoints = this.getLocalPoints();
      if (localPoints > 0) {
        const result = await this.addPoints(
          localPoints,
          "Syncing offline points"
        );
        if (result.success) {
          // Clear local points after successful sync
          localStorage.removeItem(this.cacheKey);
          console.log("✅ Local points synced successfully");
          return { success: true, syncedPoints: localPoints };
        }
      }
      return { success: true, syncedPoints: 0 };
    } catch (error) {
      console.error("❌ Error syncing local points:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset all points data
   */
  resetPoints() {
    localStorage.removeItem(this.cacheKey);
    localStorage.removeItem(this.sessionsKey);
    console.log("🔄 Points data reset");
  }
}

export default new PointsService();
