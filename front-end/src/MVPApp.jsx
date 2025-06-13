import { useEffect, useRef, useState } from "react";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import { PointsProvider } from "./components/PointsContext.jsx";
import { getMigrationProgress, getRouteInfo } from "./routes/mvp-routes.jsx";
import { AuthProvider } from "./scripts/contexts/AuthContext.jsx";
import { getActiveRoute } from "./scripts/routes/url-parser";

/**
 * MVPApp - Main application component menggunakan MVP pattern
 * Gradually replaces old App.jsx dengan MVP-based routing
 */

function MVPAppContent() {
  const [currentRoute, setCurrentRoute] = useState(getActiveRoute());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrollProgress, setScrollProgress] = useState(0);
  const drawerRef = useRef(null);
  const drawerButtonRef = useRef(null);

  // Log current route info
  useEffect(() => {
    const routeInfo = getRouteInfo(currentRoute);
    console.log(`🧭 Current Route: ${currentRoute} (${routeInfo.status})`);

    // Log migration progress periodically
    if (Math.random() < 0.1) {
      // 10% chance to avoid spam
      const progress = getMigrationProgress();
      console.log(`📊 MVP Migration: ${progress.percentage}% complete`);
    }
  }, [currentRoute]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getActiveRoute());
      setIsDrawerOpen(false); // Close drawer on route change
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleBodyClick = (event) => {
      if (
        drawerRef.current &&
        drawerButtonRef.current &&
        !drawerRef.current.contains(event.target) &&
        !drawerButtonRef.current.contains(event.target)
      ) {
        setIsDrawerOpen(false);
      }

      // Close drawer when clicking on navigation links
      if (drawerRef.current && drawerRef.current.contains(event.target)) {
        const link = event.target.closest("a");
        if (link) {
          setIsDrawerOpen(false);
        }
      }
    };

    document.body.addEventListener("click", handleBodyClick);
    return () => document.body.removeEventListener("click", handleBodyClick);
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress =
        totalHeight > 0 ? (window.pageYOffset / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(currentProgress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get route component with MVP status
  const routeInfo = getRouteInfo(currentRoute);
  const CurrentPageComponent = routeInfo.component;

  // Add MVP status indicator in development
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-1 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out animate-glow"
          style={{
            width: `${scrollProgress}%`,
            boxShadow:
              scrollProgress > 0 ? "0 0 10px rgba(255, 155, 122, 0.5)" : "none",
          }}
        />
      </div>

      {/* Development MVP Status Indicator */}
      {isDevelopment && (
        <div
          className={`fixed top-2 right-0 z-50 px-2 py-1 text-xs font-mono text-white transition-all duration-300 animate-fade-in-right ${
            routeInfo.isMVP ? "bg-green-600" : "bg-orange-600"
          }`}
        >
          {routeInfo.status}
        </div>
      )}

      <Header
        currentRoute={currentRoute}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        isMobile={isMobile}
        drawerRef={drawerRef}
        drawerButtonRef={drawerButtonRef}
      />

      <main className="min-h-[calc(100vh-4rem)] transition-all duration-300">
        {CurrentPageComponent && <CurrentPageComponent />}
      </main>

      <Footer />
    </div>
  );
}

/**
 * MVP Migration Status Component
 * Shows migration progress in development
 */
const MVPMigrationStatus = () => {
  const [showStatus, setShowStatus] = useState(false);
  const progress = getMigrationProgress();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowStatus(!showStatus)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="MVP Migration Status"
      >
        📊
      </button>

      {/* Status Panel */}
      {showStatus && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            MVP Migration Progress
          </h3>

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Routes:</span>
              <span className="font-medium">{progress.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">✅ MVP:</span>
              <span className="font-medium">{progress.migrated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">🔄 Legacy:</span>
              <span className="font-medium">{progress.remaining}</span>
            </div>
          </div>

          <button
            onClick={() => setShowStatus(false)}
            className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

/**
 * Main MVP App Component
 * Wraps the app with necessary providers and MVP infrastructure
 */
export default function MVPApp() {
  // Initialize MVP infrastructure
  useEffect(() => {
    console.log("🚀 MVP App initialized");
    console.log("📊 Migration Progress:", getMigrationProgress());

    // Global error handler for MVP components
    window.addEventListener("error", (event) => {
      if (event.error && event.error.message.includes("MVP")) {
        console.error("🚨 MVP Error:", event.error);
      }
    });

    // Global unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes("MVP")
      ) {
        console.error("🚨 MVP Promise Rejection:", event.reason);
      }
    });

    return () => {
      console.log("🛑 MVP App cleanup");
    };
  }, []);

  return (
    <AuthProvider>
      <PointsProvider>
        <MVPAppContent />
        <MVPMigrationStatus />
      </PointsProvider>
    </AuthProvider>
  );
}
