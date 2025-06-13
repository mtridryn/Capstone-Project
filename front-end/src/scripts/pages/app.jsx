import { useEffect, useRef, useState } from "react";
import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";
import { PointsProvider } from "../../components/PointsContext.jsx";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import routes from "../routes/routes.jsx";
import { getActiveRoute } from "../routes/url-parser";

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState(getActiveRoute());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const drawerRef = useRef(null);
  const drawerButtonRef = useRef(null);

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

  const CurrentPageComponent = routes[currentRoute];

  return (
    <div>
      <Header
        currentRoute={currentRoute}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        isMobile={isMobile}
      />

      <main className="min-h-[calc(100vh-4rem)]">
        {CurrentPageComponent && <CurrentPageComponent />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PointsProvider>
        <AppContent />
      </PointsProvider>
    </AuthProvider>
  );
}
