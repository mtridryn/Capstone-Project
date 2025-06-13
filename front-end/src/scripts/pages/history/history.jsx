import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute.jsx";
import analysisService from "../../services/analysisService.js";

// Helper function to build alternative image URLs for fallback
const buildAlternativeImageUrls = (imagePath, recordId = null) => {
  if (!imagePath) return [];

  console.log("🔗 Building alternative URLs for:", { imagePath, recordId });

  const backendUrl = "http://52.77.219.198:3000";
  const pocketbaseUrl = "http://52.77.219.198:8090";

  // Clean path
  let cleanPath = imagePath;
  if (cleanPath.startsWith("uploads/")) {
    cleanPath = cleanPath.substring(8);
  }

  // Extract filename
  const filename = cleanPath.includes("/")
    ? cleanPath.split("/").pop()
    : cleanPath;

  console.log("🔗 Processed paths:", { cleanPath, filename });

  const alternatives = [];

  // Primary: Direct PocketBase URLs with token support (correct format based on your API)
  if (recordId) {
    // Direct PocketBase URLs using the correct format you provided with token
    // Format: http://52.77.219.198:8090/api/files/pbc_2982428850/{record_id}/{filename}?token=
    alternatives.push(
      `http://52.77.219.198:8090/api/files/pbc_2982428850/${recordId}/${filename}?token=`,
      `${pocketbaseUrl}/api/files/pbc_2982428850/${recordId}/${filename}?token=`,
      // Fallback without token
      `http://52.77.219.198:8090/api/files/pbc_2982428850/${recordId}/${filename}`,
      `${pocketbaseUrl}/api/files/pbc_2982428850/${recordId}/${filename}`
    );

    // Vercel proxy URLs (for HTTPS deployment) with token support
    alternatives.push(
      `/files/pbc_2982428850/${recordId}/${filename}?token=`,
      `/files/pbc_2982428850/${recordId}/${filename}`,
      `/api/files/pbc_2982428850/${recordId}/${filename}?token=`,
      `/api/files/pbc_2982428850/${recordId}/${filename}`
    );
  }

  // Try to extract record ID from filename if not provided
  if (!recordId) {
    const recordIdMatch = filename.match(/^([a-z0-9]{15})/);
    if (recordIdMatch) {
      const extractedRecordId = recordIdMatch[1];
      console.log("🆔 Extracted record ID from filename:", extractedRecordId);

      alternatives.push(
        `/files/pbc_2982428850/${extractedRecordId}/${filename}?token=`,
        `/files/pbc_2982428850/${extractedRecordId}/${filename}`,
        `/api/files/pbc_2982428850/${extractedRecordId}/${filename}?token=`,
        `/api/files/pbc_2982428850/${extractedRecordId}/${filename}`,
        `${pocketbaseUrl}/api/files/pbc_2982428850/${extractedRecordId}/${filename}?token=`,
        `${pocketbaseUrl}/api/files/pbc_2982428850/${extractedRecordId}/${filename}`
      );
    }
  }

  // Backend API endpoints via proxy
  alternatives.push(
    `/api/images/${cleanPath}`,
    `/api/image/${cleanPath}`,
    `/api/files/${cleanPath}`,
    `/api/file/${cleanPath}`,
    `/api/uploads/${cleanPath}`,
    `/api/static/${cleanPath}`
  );

  // Direct backend URLs (for development)
  alternatives.push(
    `${backendUrl}/api/images/${cleanPath}`,
    `${backendUrl}/api/image/${cleanPath}`,
    `${backendUrl}/api/files/${cleanPath}`,
    `${backendUrl}/api/file/${cleanPath}`,
    `${backendUrl}/images/${cleanPath}`,
    `${backendUrl}/uploads/${cleanPath}`,
    `${backendUrl}/static/${cleanPath}`,
    `${backendUrl}/${imagePath}`, // Original path
    `${backendUrl}/api/uploads/${cleanPath}`,
    `${backendUrl}/api/static/${cleanPath}`
  );

  const filteredAlternatives = alternatives.filter(Boolean);
  console.log("🔗 Generated alternative URLs:", filteredAlternatives);

  return filteredAlternatives;
};

const history = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [monthlyAnalysisCount, setMonthlyAnalysisCount] = useState(0);

  useEffect(() => {
    fetchhistory();
  }, []);

  // Function to calculate monthly analysis count
  const calculateMonthlyAnalysis = (historyData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyCount = historyData.filter((item) => {
      const itemDate = new Date(item.created || item.createdAt);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    }).length;

    console.log(`📊 Monthly analysis calculation:`, {
      currentMonth: currentMonth + 1, // +1 because getMonth() returns 0-11
      currentYear,
      totalItems: historyData.length,
      monthlyCount,
    });

    return monthlyCount;
  };

  const fetchhistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await analysisService.getHistory(1, 20); // Get first 20 items

      if (result.success) {
        // Debug: Log raw data from backend
        console.log("🔍 Raw history data from backend:", result.data);

        // Transform API data to match UI expectations
        // Backend returns: { success: true, history: [...] }
        const transformedHistory =
          result.data.history?.map((item) => {
            // Debug: Log each item to see the structure
            console.log("🔍 Processing history item:", item);
            console.log("🖼️ Image field (wajah):", item.wajah);

            // Generate image URL from backend data - ONLY show real images
            let imageUrl = null;

            if (item.wajah) {
              console.log("🖼️ Raw wajah field:", item.wajah);
              console.log("🆔 Item ID (record ID):", item.id);
              console.log("🔍 Full item data:", item);

              // Build proper image URL using the service method with record ID
              imageUrl = analysisService.buildImageUrl(item.wajah, item.id);

              console.log("🔗 Built image URL:", imageUrl);

              // Also prepare alternative URLs for fallback
              const alternativeUrls = buildAlternativeImageUrls(
                item.wajah,
                item.id
              );
              console.log(
                "🔗 Alternative URLs (first 3):",
                alternativeUrls.slice(0, 3)
              );

              // Test if the primary URL is accessible
              if (imageUrl) {
                console.log("🧪 Testing primary image URL:", imageUrl);
              }
            } else {
              console.log("⚠️ No image data (wajah field is empty)");
              console.log("🔍 Available fields in item:", Object.keys(item));
            }

            return {
              id: item.id,
              date: new Date(item.created || item.createdAt).toLocaleDateString(
                "id-ID"
              ),
              time: new Date(item.created || item.createdAt).toLocaleTimeString(
                "id-ID",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
              skinType: analysisService.mapSkinType(item.hasil) || "Unknown",
              moisture: Math.round((item.akurasi || 0.85) * 100), // Use confidence as moisture for now
              oilLevel: Math.round((item.akurasi || 0.85) * 100), // Use confidence as oil level for now
              concerns: [], // Backend doesn't provide detailed concerns yet
              image: imageUrl,
              recommendations: 0, // Backend doesn't provide recommendation count yet
              rawData: item, // Store original data for detail view
            };
          }) || [];

        console.log("✅ Transformed history data:", transformedHistory);
        setHistory(transformedHistory);

        // Calculate and set monthly analysis count using raw data
        const monthlyCount = calculateMonthlyAnalysis(
          result.data.history || []
        );
        setMonthlyAnalysisCount(monthlyCount);
      } else {
        setError(result.message || "Gagal memuat riwayat analisis");
      }
    } catch (err) {
      setError("Gagal memuat riwayat analisis");
      console.error("Error fetching analysis history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-derma-cream to-derma-rose flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat analisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-derma-cream to-derma-rose flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchhistory} className="btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-derma-cream to-derma-rose py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Riwayat Analisis
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lihat semua hasil analisis kulit Anda
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Analisis
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {history.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analisis Bulan Ini
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {monthlyAnalysisCount}
              </p>
            </div>
          </div>

          {/* Analysis History List */}
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Analisis
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai analisis kulit pertama Anda untuk melihat riwayat di sini
              </p>
              <a href="/analisis" className="btn-primary">
                Mulai Analisis
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {analysis.image ? (
                        <img
                          src={analysis.image}
                          alt="Hasil analisis"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                          onError={(e) => {
                            console.log(
                              "❌ Image failed to load:",
                              analysis.image
                            );

                            // Try alternative URLs if available
                            if (
                              analysis.rawData?.wajah &&
                              !e.target.dataset.retryCount
                            ) {
                              e.target.dataset.retryCount = "1";

                              // Get all alternative URLs
                              const altUrls = buildAlternativeImageUrls(
                                analysis.rawData.wajah,
                                analysis.rawData.id
                              );
                              const currentUrl = e.target.src;
                              const nextUrl = altUrls.find(
                                (url) => url !== currentUrl
                              );

                              if (nextUrl) {
                                console.log(
                                  "🔄 Trying alternative URL:",
                                  nextUrl
                                );
                                e.target.src = nextUrl;
                                return;
                              }
                            } else if (
                              analysis.rawData?.wajah &&
                              parseInt(e.target.dataset.retryCount || "0") < 5
                            ) {
                              // Try next alternative URL
                              const retryCount = parseInt(
                                e.target.dataset.retryCount || "0"
                              );
                              e.target.dataset.retryCount = (
                                retryCount + 1
                              ).toString();

                              const altUrls = buildAlternativeImageUrls(
                                analysis.rawData.wajah,
                                analysis.rawData.id
                              );
                              const nextUrl = altUrls[retryCount];

                              if (nextUrl && nextUrl !== e.target.src) {
                                console.log(
                                  `🔄 Trying alternative URL ${
                                    retryCount + 1
                                  }:`,
                                  nextUrl
                                );
                                e.target.src = nextUrl;
                                return;
                              }
                            }

                            // Hide image if all URLs fail
                            console.log(
                              "❌ All image URLs failed, hiding image"
                            );
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                          onLoad={() => {
                            console.log(
                              "✅ Image loaded successfully:",
                              analysis.image
                            );
                          }}
                        />
                      ) : null}

                      {/* Placeholder for when no image is available */}
                      <div
                        className={`w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center ${
                          analysis.image ? "hidden" : "flex"
                        }`}
                      >
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs text-gray-500">
                            No Image
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {analysis.date}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {analysis.time}
                          </span>
                        </div>

                        {/* Hasil Analisis Kulit */}
                        <div className="mb-4">
                          <h4 className="text-base font-semibold text-gray-800 mb-3">
                            Hasil Analisis Kulit
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-orange-50 px-3 py-4 rounded-lg border border-orange-100">
                              <p className="text-xl font-bold text-orange-500 text-center">
                                {analysis.skinType}
                              </p>
                            </div>
                            <div className="bg-orange-100 px-3 py-4 rounded-lg border border-orange-200">
                              <p className="text-xl font-bold text-orange-500 text-center">
                                {analysis.moisture}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(analysis)}
                        className="px-4 py-2 text-orange-600 border border-orange-400 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detail Analisis
                  </h2>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedAnalysis.image ? (
                    <img
                      src={selectedAnalysis.image}
                      alt="Hasil analisis"
                      className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                      onError={(e) => {
                        console.log(
                          "❌ Modal image failed to load:",
                          selectedAnalysis.image
                        );

                        // Try alternative URLs if available (same logic as list view)
                        if (
                          selectedAnalysis.rawData?.wajah &&
                          !e.target.dataset.retryCount
                        ) {
                          e.target.dataset.retryCount = "1";

                          // Get all alternative URLs
                          const altUrls = buildAlternativeImageUrls(
                            selectedAnalysis.rawData.wajah,
                            selectedAnalysis.rawData.id
                          );
                          const currentUrl = e.target.src;
                          const nextUrl = altUrls.find(
                            (url) => url !== currentUrl
                          );

                          if (nextUrl) {
                            console.log(
                              "🔄 Modal: Trying alternative URL:",
                              nextUrl
                            );
                            e.target.src = nextUrl;
                            return;
                          }
                        } else if (
                          selectedAnalysis.rawData?.wajah &&
                          parseInt(e.target.dataset.retryCount || "0") < 5
                        ) {
                          // Try next alternative URL
                          const retryCount = parseInt(
                            e.target.dataset.retryCount || "0"
                          );
                          e.target.dataset.retryCount = (
                            retryCount + 1
                          ).toString();

                          const altUrls = buildAlternativeImageUrls(
                            selectedAnalysis.rawData.wajah,
                            selectedAnalysis.rawData.id
                          );
                          const nextUrl = altUrls[retryCount];

                          if (nextUrl && nextUrl !== e.target.src) {
                            console.log(
                              `🔄 Modal: Trying alternative URL ${
                                retryCount + 1
                              }:`,
                              nextUrl
                            );
                            e.target.src = nextUrl;
                            return;
                          }
                        }

                        // Hide image and show placeholder if all URLs fail
                        console.log(
                          "❌ Modal: All image URLs failed, showing placeholder"
                        );
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                      onLoad={() => {
                        console.log(
                          "✅ Modal image loaded successfully:",
                          selectedAnalysis.image
                        );
                      }}
                    />
                  ) : null}

                  {/* Placeholder for modal when no image */}
                  <div
                    className={`w-full h-64 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center ${
                      selectedAnalysis.image ? "hidden" : "flex"
                    }`}
                  >
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak Ada Gambar
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Gambar hasil analisis tidak tersedia
                      </p>
                      {selectedAnalysis.rawData?.wajah && (
                        <p className="text-xs text-gray-500">
                          Path: {selectedAnalysis.rawData.wajah}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informasi Analisis */}
                  <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">Tanggal & Waktu</p>
                      <p className="font-semibold text-gray-900">
                        {selectedAnalysis.date} - {selectedAnalysis.time}
                      </p>
                    </div>
                  </div>

                  {/* Hasil Analisis Kulit */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Hasil Analisis Kulit
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-50 px-4 py-6 rounded-lg border border-orange-100">
                        <p className="text-2xl font-bold text-orange-500 text-center">
                          {selectedAnalysis.skinType}
                        </p>
                      </div>
                      <div className="bg-orange-100 px-4 py-6 rounded-lg border border-orange-200">
                        <p className="text-2xl font-bold text-orange-500 text-center">
                          {selectedAnalysis.moisture}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button className="btn-secondary">Analisis Ulang</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default history;
