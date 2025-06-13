import { useAuth } from "../scripts/contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, redirectTo = "#/login" }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "isLoading:",
    isLoading
  );

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white rounded-lg shadow-lg p-8">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 mb-6">
            Anda harus login untuk mengakses halaman ini.
          </p>
          <div className="space-y-3">
            <a
              href={redirectTo}
              className="block w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-orange-600 transition-all duration-200 no-underline"
            >
              Login Sekarang
            </a>
            <a
              href="#/register"
              className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 no-underline"
            >
              Daftar Akun Baru
            </a>
            <a
              href="#/"
              className="block text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 no-underline"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
