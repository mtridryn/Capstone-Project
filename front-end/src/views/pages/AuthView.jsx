import { useCallback, useState } from "react";
import { AuthPresenter } from "../../presenters/index.js";
import useMVPPresenter from "../hooks/useMVPPresenter.js";
import ErrorMessage from "../shared/ErrorMessage.jsx";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

/**
 * AuthView - Login/Register page menggunakan MVP pattern
 * Pure UI component yang delegate semua logic ke AuthPresenter
 */
const AuthView = ({ mode = "login" }) => {
  // Local UI state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // MVP Presenter integration
  const { presenter, loading, error, clearError } = useMVPPresenter(
    AuthPresenter,
    {
      viewMethods: {
        // Success callbacks
        onLoginSuccess: (result) => {
          setSuccessMessage("Login berhasil! Mengalihkan...");
          setTimeout(() => {
            window.location.hash = "#/";
          }, 1000);
        },

        onRegisterSuccess: (result) => {
          setSuccessMessage("Registrasi berhasil! Mengalihkan...");
          setTimeout(() => {
            window.location.hash = "#/";
          }, 1000);
        },

        onLogoutSuccess: () => {
          setSuccessMessage("Logout berhasil!");
          window.location.hash = "#/";
        },
      },
    }
  );

  // Form handlers
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear validation error when user starts typing
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [validationErrors]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSuccessMessage("");
      clearError();

      // Client-side validation using presenter
      const validation = presenter.validateForm(formData, mode);
      if (!validation.isValid) {
        const errors = {};
        validation.errors.forEach((error) => {
          if (error.includes("Email")) errors.email = error;
          else if (error.includes("Password") || error.includes("password"))
            errors.password = error;
          else if (error.includes("Nama")) errors.name = error;
          else errors.general = error;
        });
        setValidationErrors(errors);
        return;
      }

      setValidationErrors({});

      // Delegate to presenter
      if (mode === "login") {
        await presenter.handleLogin(formData);
      } else {
        await presenter.handleRegister(formData);
      }
    },
    [formData, mode, presenter, clearError]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const switchMode = useCallback(() => {
    const newMode = mode === "login" ? "register" : "login";
    window.location.hash = `#/${newMode}`;
  }, [mode]);

  // Render form fields
  const renderEmailField = () => (
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          validationErrors.email ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Masukkan email Anda"
        disabled={loading}
      />
      {validationErrors.email && (
        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
      )}
    </div>
  );

  const renderPasswordField = () => (
    <div>
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10 ${
            validationErrors.password ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Masukkan password Anda"
          disabled={loading}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
      {validationErrors.password && (
        <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
      )}
    </div>
  );

  const renderNameField = () => (
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Nama Lengkap
      </label>
      <input
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        value={formData.name}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          validationErrors.name ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Masukkan nama lengkap Anda"
        disabled={loading}
      />
      {validationErrors.name && (
        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
      )}
    </div>
  );

  const renderConfirmPasswordField = () => (
    <div>
      <label
        htmlFor="confirmPassword"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Konfirmasi Password
      </label>
      <div className="relative">
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10 ${
            validationErrors.confirmPassword
              ? "border-red-500"
              : "border-gray-300"
          }`}
          placeholder="Konfirmasi password Anda"
          disabled={loading}
        />
        <button
          type="button"
          onClick={toggleConfirmPasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </button>
      </div>
      {validationErrors.confirmPassword && (
        <p className="mt-1 text-sm text-red-600">
          {validationErrors.confirmPassword}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-derma-cream to-derma-rose flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
          </h1>
          {mode === "login" && (
            <p className="text-gray-600">
              Silakan masuk untuk melanjutkan ke Dermalyze
            </p>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (register only) */}
            {mode === "register" && renderNameField()}

            {/* Email field */}
            {renderEmailField()}

            {/* Password field */}
            {renderPasswordField()}

            {/* Confirm password field (register only) */}
            {mode === "register" && renderConfirmPasswordField()}

            {/* General validation error */}
            {validationErrors.general && (
              <ErrorMessage
                message={validationErrors.general}
                type="error"
                onDismiss={() =>
                  setValidationErrors((prev) => ({ ...prev, general: null }))
                }
              />
            )}

            {/* Error from presenter */}
            {error && (
              <ErrorMessage
                message={error}
                type="error"
                onDismiss={clearError}
                onRetry={() => handleSubmit({ preventDefault: () => {} })}
              />
            )}

            {/* Success message */}
            {successMessage && (
              <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <LoadingSpinner size="small" message="Memproses..." />
              ) : mode === "login" ? (
                "Masuk"
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={switchMode}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
                disabled={loading}
              >
                {mode === "login" ? "Daftar sekarang" : "Masuk sekarang"}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <a
            href="#/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
