import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.nama || user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage("Profil berhasil diperbarui!");
      setIsEditing(false);
    } else {
      setMessage(result.message);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.nama || user.name || "",
        email: user.email || "",
      });
    }
    setIsEditing(false);
    setErrors({});
    setMessage("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 mb-6">
            Anda harus login untuk mengakses halaman profil.
          </p>
          <a
            href="#/login"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Login Sekarang
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
          <p className="text-gray-600">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary-500"
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
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-white">
                  {user.nama || user.name}
                </h2>
                <p className="text-primary-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Informasi Profil
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  Edit Profil
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
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
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                  } ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Masukkan nama lengkap Anda"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                  } ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Masukkan email Anda"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.includes("berhasil")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200"
                  >
                    Batal
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {user.analysisCount || 0}
            </div>
            <div className="text-gray-600">Total Analisis</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {user.points || 0}
            </div>
            <div className="text-gray-600">Poin Terkumpul</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {user.joinDate
                ? new Date(user.joinDate).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })
                : "Baru"}
            </div>
            <div className="text-gray-600">Bergabung Sejak</div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
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

export default ProfilePage;
