/**
 * MVP Routes - Routing configuration menggunakan MVP Views
 * Gradually replace old routes dengan MVP-based views
 */

// MVP Views (New)
import { AnalysisView, AuthView, ProductView } from "../views/index.js";

// Legacy Pages (Keep for now during migration)
import AboutPage from "../scripts/pages/about/about-page.jsx";
import ArtikelDetailPage from "../scripts/pages/artikel/artikel-detail.jsx";
import ArtikelPage from "../scripts/pages/artikel/artikel.jsx";
import HistoryPage from "../scripts/pages/history/history.jsx";
import HomePage from "../scripts/pages/home/home-page.jsx";
import TestAuth from "../scripts/pages/test-auth.jsx";

/**
 * MVP Routes Configuration
 *
 * Status Legend:
 * ✅ MVP - Fully migrated to MVP pattern
 * 🔄 Legacy - Still using old pattern (to be migrated)
 */
const mvpRoutes = {
  // ✅ MVP Routes - Using new MVP pattern
  "/login": () => <AuthView mode="login" />,
  "/register": () => <AuthView mode="register" />,
  "/produk": ProductView,
  "/analisis": AnalysisView,

  // 🔄 Legacy Routes - Still using old pattern
  "/": HomePage,
  "/about": AboutPage,
  "/artikel": ArtikelPage,
  "/artikel/:id": ArtikelDetailPage,
  "/riwayat": HistoryPage,
  "/test-auth": TestAuth,
};

/**
 * Route Status Tracker
 * Helps track migration progress
 */
export const routeStatus = {
  mvp: ["/login", "/register", "/produk", "/analisis"],
  legacy: ["/", "/about", "/artikel", "/artikel/:id", "/riwayat", "/test-auth"],
};

/**
 * Get migration progress
 * @returns {Object} Migration statistics
 */
export const getMigrationProgress = () => {
  const totalRoutes = routeStatus.mvp.length + routeStatus.legacy.length;
  const migratedRoutes = routeStatus.mvp.length;
  const percentage = Math.round((migratedRoutes / totalRoutes) * 100);

  return {
    total: totalRoutes,
    migrated: migratedRoutes,
    remaining: routeStatus.legacy.length,
    percentage,
  };
};

/**
 * Check if route is using MVP pattern
 * @param {string} path - Route path
 * @returns {boolean} Is MVP route
 */
export const isMVPRoute = (path) => {
  return routeStatus.mvp.includes(path);
};

/**
 * Get route component with MVP status info
 * @param {string} path - Route path
 * @returns {Object} Route info with component and status
 */
export const getRouteInfo = (path) => {
  const component = mvpRoutes[path];
  const isMVP = isMVPRoute(path);

  return {
    component,
    isMVP,
    status: isMVP ? "MVP" : "Legacy",
    path,
  };
};

// Log migration progress on module load
const progress = getMigrationProgress();
console.log(
  `🚀 MVP Migration Progress: ${progress.migrated}/${progress.total} routes (${progress.percentage}%)`
);
console.log(`✅ MVP Routes: ${routeStatus.mvp.join(", ")}`);
console.log(`🔄 Legacy Routes: ${routeStatus.legacy.join(", ")}`);

export default mvpRoutes;
