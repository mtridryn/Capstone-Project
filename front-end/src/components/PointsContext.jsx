import { createContext, useContext, useEffect, useState } from "react";
import pointsService from "../scripts/services/pointsService.js";

const PointsContext = createContext();

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
};

export const PointsProvider = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [readingSessions, setReadingSessions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load points and sessions on mount
  useEffect(() => {
    initializePoints();
  }, []);

  const initializePoints = async () => {
    try {
      setLoading(true);

      // Get current points from backend (via user data)
      const currentPoints = await pointsService.getCurrentPoints();
      setPoints(currentPoints);

      // Load reading sessions from localStorage
      const sessions = pointsService.getReadingSessions();
      setReadingSessions(sessions);

      // Sync any offline points
      await pointsService.syncLocalPoints();
    } catch (error) {
      console.error("Error initializing points:", error);
      setError(error.message);

      // Fallback to local data
      const localPoints = pointsService.getLocalPoints();
      setPoints(localPoints);

      const sessions = pointsService.getReadingSessions();
      setReadingSessions(sessions);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (amount, reason = "") => {
    try {
      setLoading(true);
      const result = await pointsService.addPoints(amount, reason);

      if (result.success) {
        setPoints(result.points);
        setError(null);
      } else {
        // Fallback: add locally
        setPoints((prevPoints) => prevPoints + amount);
        setError("Points added offline - will sync when online");
      }
    } catch (error) {
      console.error("Error adding points:", error);
      setError(error.message);
      // Fallback: add locally
      setPoints((prevPoints) => prevPoints + amount);
    } finally {
      setLoading(false);
    }
  };

  const awardReadingPoints = async (articleId, articleTitle = "") => {
    try {
      console.log("awardReadingPoints called with articleId:", articleId);

      setLoading(true);
      const result = await pointsService.awardReadingPoints(
        articleId,
        articleTitle
      );

      if (result.success) {
        setPoints(result.points);
        setReadingSessions(pointsService.getReadingSessions());
        setError(null);
        return true;
      } else if (result.alreadyAwarded) {
        console.log("Points already awarded for article:", articleId);
        return false;
      } else {
        setError(result.error || "Failed to award points");
        return false;
      }
    } catch (error) {
      console.error("Error awarding reading points:", error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPoints = () => {
    pointsService.resetPoints();
    setPoints(0);
    setReadingSessions(new Set());
    setError(null);
  };

  const value = {
    points,
    addPoints,
    awardReadingPoints,
    resetPoints,
    readingSessions: [...readingSessions],
    loading,
    error,
  };

  return (
    <PointsContext.Provider value={value}>{children}</PointsContext.Provider>
  );
};
