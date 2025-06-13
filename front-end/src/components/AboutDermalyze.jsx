const AboutDermalyze = () => {
  const features = [
    {
      id: 1,
      title: "Analisis AI Canggih",
      description:
        "Teknologi machine learning terdepan untuk analisis kulit yang akurat dan mendalam",
      icon: (
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
      ),
      color: "blue",
    },
    {
      id: 2,
      title: "Rekomendasi Personal",
      description:
        "Saran perawatan kulit yang disesuaikan dengan kondisi dan kebutuhan unik Anda",
      icon: (
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      ),
      color: "orange",
    },
    {
      id: 3,
      title: "Hasil Instan",
      description:
        "Dapatkan analisis komprehensif dan rekomendasi dalam hitungan detik",
      icon: (
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      ),
      color: "green",
    },
  ];

  const advantages = [
    {
      title: "Teknologi AI Terdepan",
      description:
        "Menggunakan algoritma machine learning yang telah dilatih dengan ribuan data kulit untuk memberikan analisis yang akurat dan terpercaya.",
      icon: "🤖",
    },
    {
      title: "Mudah & Praktis",
      description:
        "Cukup upload foto atau ambil foto langsung, tidak perlu kunjungan ke klinik atau peralatan khusus.",
      icon: "📱",
    },
    {
      title: "Rekomendasi Ahli",
      description:
        "Saran perawatan yang dikembangkan bersama dermatolog berpengalaman dan disesuaikan dengan kondisi kulit Anda.",
      icon: "👩‍⚕️",
    },
    {
      title: "Gratis & Aman",
      description:
        "Platform yang aman dengan privasi terjamin, tanpa biaya tersembunyi untuk analisis dasar.",
      icon: "🔒",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tentang <span className="text-orange-600">Dermalyze</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Platform analisis kulit berbasis AI yang membantu Anda memahami
            kondisi kulit dan mendapatkan rekomendasi perawatan yang tepat dari
            kenyamanan rumah Anda.
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12 animate-fade-in-up">
            Fitur Unggulan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`text-center group card transition-all duration-500 hover:shadow-xl p-6 rounded-xl animate-fade-in-up animate-delay-${
                  (index + 1) * 100
                }`}
              >
                <div className="flex justify-center mb-6 transform group-hover:scale-125 transition-all duration-300 group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages Section */}
        <div className="bg-gradient-to-br from-derma-cream to-derma-rose rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Mengapa Memilih Dermalyze?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="text-3xl flex-shrink-0">{advantage.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {advantage.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600">Analisis Dilakukan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Tingkat Akurasi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">5K+</div>
              <div className="text-gray-600">Pengguna Aktif</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Tersedia</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Siap Untuk Analisis Kulit Anda?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Mulai perjalanan skincare Anda dengan analisis AI yang akurat.
              Dapatkan rekomendasi perawatan yang tepat dalam hitungan detik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#/analisis"
                className="btn-primary inline-flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Mulai Analisis Sekarang
              </a>
              <a
                href="#/artikel"
                className="btn-secondary inline-flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Baca Artikel Tips
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDermalyze;
