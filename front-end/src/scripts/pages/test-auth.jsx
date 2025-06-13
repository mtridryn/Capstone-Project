import { useAuth } from "../contexts/AuthContext.jsx";

const TestAuth = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧪 Authentication Test
        </h1>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Loading State:</h3>
            <p
              className={`text-lg ${
                isLoading ? "text-primary-500" : "text-green-600"
              }`}
            >
              {isLoading ? "⏳ Loading..." : "✅ Loaded"}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Authentication Status:
            </h3>
            <p
              className={`text-lg ${
                isAuthenticated ? "text-green-600" : "text-red-600"
              }`}
            >
              {isAuthenticated ? "🔓 Authenticated" : "🔒 Not Authenticated"}
            </p>
          </div>

          {user && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">User Data:</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              LocalStorage Check:
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Token:</strong>{" "}
                {localStorage.getItem("dermalyze_token")
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {localStorage.getItem("dermalyze_user")
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <a
              href="#/login"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              Login
            </a>
            <a
              href="#/"
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-center hover:bg-gray-700 transition-colors"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
