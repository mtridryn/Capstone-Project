import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute.jsx";

const NotifikasiPage = () => {
  const [settings, setSettings] = useState({
    // Notifikasi Push
    pushNotifications: true,

    // Notifikasi Analisis
    analysisReminders: true,

    // Notifikasi Produk
    productUpdates: false,

    // Notifikasi Artikel
    newArticles: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Save to localStorage
      localStorage.setItem("notificationSettings", JSON.stringify(settings));

      // Here you would typically save to backend API
      // await notificationService.updateSettings(settings);

      setMessage("Pengaturan notifikasi berhasil disimpan!");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setMessage("Gagal menyimpan pengaturan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      pushNotifications: true,
      analysisReminders: true,
      productUpdates: false,
      newArticles: true,
    };

    setSettings(defaultSettings);
    setMessage("Pengaturan dikembalikan ke default");
    setTimeout(() => setMessage(""), 3000);
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? "bg-primary-500" : "bg-gray-200"
        }`}
        onClick={onChange}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg
                className="w-8 h-8 mr-3 text-primary-500"
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
              Pengaturan Notifikasi
            </h1>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("berhasil") || message.includes("default")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Settings Section */}
          <div className="space-y-6">
            {/* All Notifications in One Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-primary-500"
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
                Pengaturan Notifikasi
              </h2>
              <div className="space-y-0">
                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle("pushNotifications")}
                  label="Aktifkan Notifikasi Push"
                  description="Terima notifikasi langsung di browser atau perangkat Anda"
                />
                <ToggleSwitch
                  checked={settings.analysisReminders}
                  onChange={() => handleToggle("analysisReminders")}
                  label="Pengingat Analisis Kulit"
                  description="Ingatkan untuk melakukan analisis kulit secara berkala"
                />
                <ToggleSwitch
                  checked={settings.productUpdates}
                  onChange={() => handleToggle("productUpdates")}
                  label="Update Produk Baru"
                  description="Notifikasi ketika ada produk skincare baru yang sesuai"
                />
                <ToggleSwitch
                  checked={settings.newArticles}
                  onChange={() => handleToggle("newArticles")}
                  label="Artikel Baru"
                  description="Notifikasi ketika ada artikel kecantikan dan skincare baru"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : (
                    "Simpan Pengaturan"
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset ke Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NotifikasiPage;
