import { useEffect, useRef, useState } from "react";
import { useAuth } from "../scripts/contexts/AuthContext.jsx";

const Header = ({ currentRoute, isDrawerOpen, setIsDrawerOpen, isMobile }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const drawerButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  const navigationItems = [
    { href: "#/", label: "Beranda", route: "/" },
    { href: "#/analisis", label: "Analisis", route: "/analisis" },
    { href: "#/riwayat", label: "Riwayat", route: "/riwayat" },
    { href: "#/produk", label: "Produk", route: "/produk" },
    { href: "#/artikel", label: "Artikel", route: "/artikel" },
    { href: "#/about", label: "About", route: "/about" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <a
          href="#/"
          className="flex items-center space-x-1 text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent no-underline group"
        >
          {/* Logo Icon */}
          <div className="relative">
            <img
              src="/images/logo.png"
              alt="Dermalyze Logo"
              className="w-12 h-12 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 animate-pulse-custom"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-glow"></div>
          </div>
          <span className="transition-all duration-300 group-hover:scale-105">
            Dermalyze
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          ref={drawerRef}
          className={`${
            isMobile
              ? isDrawerOpen
                ? "block animate-fade-in-down"
                : "hidden"
              : "block"
          } ${
            isMobile ? "absolute" : "static"
          } top-full left-0 right-0 bg-white ${
            isMobile ? "shadow-lg backdrop-blur-sm bg-white/95" : ""
          } z-40 transition-all duration-300`}
        >
          <ul
            className={`flex ${isMobile ? "flex-col" : "flex-row"} ${
              isMobile ? "gap-0" : "gap-8"
            } list-none m-0 ${isMobile ? "p-4" : "p-0"}`}
          >
            {navigationItems.map((item, index) => (
              <li
                key={item.route}
                className={
                  isMobile
                    ? `animate-fade-in-left animate-delay-${(index + 1) * 100}`
                    : ""
                }
              >
                <a
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-medium no-underline transition-all duration-300 focus:outline-none relative group ${
                    currentRoute === item.route
                      ? "text-primary-500"
                      : "text-gray-700 hover:text-primary-500"
                  }`}
                  style={
                    currentRoute === item.route
                      ? {
                          borderBottom: "2px solid #f97316",
                        }
                      : {}
                  }
                >
                  {item.label}
                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Side - Auth Section */}
        <div className="flex items-center space-x-4">
          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 transition-all duration-300 border border-gray-200 hover:border-primary-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-primary-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg animate-pulse-custom">
                  <svg
                    className="w-4 h-4 text-orange-600 group-hover:text-primary-600 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-all duration-300 group-hover:scale-105">
                  {user?.nama || user?.name || "User"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-all duration-300 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-scale-in backdrop-blur-sm bg-white/95">
                  <a
                    href="#/notifikasi"
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 text-left no-underline transition-all duration-300 animate-fade-in-up animate-delay-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.73 21a2 2 0 0 1-3.46 0"
                      />
                    </svg>
                    <span>Notifikasi</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 text-left transition-all duration-300 animate-fade-in-up animate-delay-200"
                  >
                    <svg
                      className="w-4 h-4 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <a
                href="#/login"
                className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors duration-200 no-underline"
              >
                Masuk
              </a>
              <a
                href="#/register"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 no-underline"
              >
                Daftar
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            ref={drawerButtonRef}
            onClick={toggleDrawer}
            className={`${
              isMobile ? "block" : "hidden"
            } bg-transparent border-none text-xl text-gray-700 cursor-pointer p-2 hover:text-primary-500 transition-all duration-300 hover:scale-110 hover:bg-primary-50 rounded-lg`}
          >
            <span
              className={`inline-block transition-transform duration-300 ${
                isDrawerOpen ? "rotate-90" : ""
              }`}
            >
              ☰
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
