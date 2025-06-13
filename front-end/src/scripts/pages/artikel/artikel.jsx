import { useEffect, useState } from "react";
import { usePoints } from "../../../components/PointsContext.jsx";
import newsApiService from "../../services/newsApiService.js";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { awardReadingPoints } = usePoints();
  const [activeTimers, setActiveTimers] = useState(new Map());
  const [, forceUpdate] = useState({});

  // Testing mode - set to true for 10 seconds, false for 2 minutes
  const TESTING_MODE = false;
  const TIMER_DURATION = TESTING_MODE ? 10 * 1000 : 2 * 60 * 1000;

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  // Setup activity listeners
  useEffect(() => {
    const handleActivity = () => {
      // Reset all active timers when user is active
      activeTimers.forEach((timer, articleId) => {
        clearTimeout(timer.timeoutId);
        console.log(
          `Activity detected, cancelling timer for article ${articleId}`
        );
      });
      setActiveTimers(new Map());
    };

    // Listen for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      // Clear all timers on unmount
      activeTimers.forEach((timer) => {
        clearTimeout(timer.timeoutId);
      });
    };
  }, [activeTimers]);

  // Update countdown display every second
  useEffect(() => {
    if (activeTimers.size > 0) {
      const interval = setInterval(() => {
        forceUpdate({});
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTimers.size]);

  const startInactivityTimer = (articleId, articleTitle) => {
    // Clear existing timer for this article if any
    if (activeTimers.has(articleId)) {
      clearTimeout(activeTimers.get(articleId).timeoutId);
    }

    console.log(
      `Starting inactivity timer for article ${articleId}: ${articleTitle}`
    );

    // Show initial notification
    const timeText = TESTING_MODE ? "10 detik" : "2 menit";
    showNotification(
      "info",
      "Timer Dimulai",
      `Poin akan diberikan jika tidak ada aktivitas selama ${timeText}`
    );

    const timeoutId = setTimeout(() => {
      console.log(`${timeText} of inactivity passed for article ${articleId}`);

      // Award points
      awardReadingPoints(articleId, articleTitle)
        .then((awarded) => {
          if (awarded) {
            showNotification(
              "success",
              "+10 Poin!",
              `Terima kasih telah membaca: ${articleTitle}`
            );
          } else {
            console.log(`Points already awarded for article ${articleId}`);
          }
        })
        .catch((error) => {
          console.error("Error awarding points:", error);
        });

      // Remove timer from active timers
      setActiveTimers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(articleId);
        return newMap;
      });
    }, TIMER_DURATION);

    // Store timer
    setActiveTimers((prev) => {
      const newMap = new Map(prev);
      newMap.set(articleId, { timeoutId, articleTitle, startTime: Date.now() });
      return newMap;
    });
  };

  const showNotification = (type, title, message) => {
    const notification = document.createElement("div");
    const bgColor = type === "success" ? "bg-green-500" : "bg-blue-500";
    const icon = type === "success" ? "🎉" : "⏱️";

    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`;
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-lg">${icon}</span>
        <div>
          <div class="font-medium">${title}</div>
          <div class="text-sm">${message}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching articles...", {
        currentPage,
      });

      // Fetch general skincare news
      console.log("Fetching general skincare news");
      const data = await newsApiService.fetchSkincareNews(currentPage, 10);

      console.log("Received data:", data);

      const articles = data.articles || [];
      setArticles(articles);
      setTotalPages(Math.max(1, Math.ceil((data.totalResults || 0) / 10)));

      // Show success message for real data
      if (articles.length > 0) {
        console.log("✅ Successfully loaded real articles from News API");
        setError(null);
        setIsUsingFallback(false);
      } else {
        console.warn("No articles to display");
      }
    } catch (err) {
      console.error("Detailed error fetching articles:", err);
      console.log("Using fallback mock data due to API error");
      setError(
        "Menggunakan data contoh karena API tidak tersedia. Untuk artikel asli, silakan coba lagi nanti."
      );

      // Fallback to realistic mock data with beauty and skincare focus
      const fallbackArticles = [
        {
          id: 1,
          title: "10 Tips Perawatan Wajah untuk Kulit Glowing Alami",
          excerpt:
            "Temukan rahasia perawatan wajah yang direkomendasikan ahli dermatologi untuk mendapatkan kulit sehat dan bercahaya setiap hari.",
          content:
            "Panduan lengkap membangun rutinitas perawatan wajah yang efektif...",
          category: "Tips Kecantikan",
          author: "Dr. Sari Dewi",
          publishedAt: "2024-01-15",
          readTime: "5 min",
          image:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop",
          tags: ["perawatan wajah", "kecantikan", "tips"],
          views: 1250,
          likes: 89,
          sourceUrl:
            "https://www.healthline.com/health/beauty-skin-care/skincare-routine",
          source: "Beauty Indonesia",
        },
        {
          id: 2,
          title: "Mengenal Jenis Kulit Wajah: Panduan Lengkap",
          excerpt:
            "Pelajari cara mengidentifikasi jenis kulit Anda dan memilih produk yang tepat untuk kulit berminyak, kering, kombinasi, atau sensitif.",
          content:
            "Memahami jenis kulit adalah kunci perawatan wajah yang efektif...",
          category: "Perawatan Wajah",
          author: "Dr. Michael Chen",
          publishedAt: "2024-01-12",
          readTime: "7 min",
          image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop",
          tags: ["jenis kulit", "perawatan wajah", "panduan"],
          views: 980,
          likes: 67,
          sourceUrl:
            "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/skin-care/art-20048237",
          source: "Derma Care",
        },
        {
          id: 3,
          title: "Pentingnya Sunscreen dalam Rutinitas Harian",
          excerpt:
            "Mengapa perlindungan SPF adalah langkah paling penting untuk mencegah penuaan dini dan menjaga kesehatan kulit.",
          content:
            "Sunscreen adalah pertahanan terbaik kulit dari sinar UV berbahaya...",
          category: "Perlindungan Kulit",
          author: "Dr. Lisa Wulandari",
          publishedAt: "2024-01-10",
          readTime: "6 min",
          image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
          tags: ["sunscreen", "perlindungan UV", "anti-aging"],
          views: 1450,
          likes: 112,
          sourceUrl:
            "https://www.aad.org/public/everyday-care/sun-protection/sunscreen-patients/sunscreen-faqs",
          source: "Skin Care Indonesia",
        },
        {
          id: 4,
          title: "Cara Mengatasi Jerawat yang Efektif dan Aman",
          excerpt:
            "Pendekatan berbasis bukti untuk mengatasi jerawat, mulai dari pembersihan lembut hingga perawatan profesional.",
          content:
            "Perawatan jerawat memerlukan pendekatan yang komprehensif...",
          category: "Perawatan Jerawat",
          author: "Dr. Amanda Sari",
          publishedAt: "2024-01-08",
          readTime: "8 min",
          image:
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
          tags: ["jerawat", "perawatan", "kulit bermasalah"],
          views: 876,
          likes: 54,
          sourceUrl:
            "https://www.webmd.com/skin-problems-and-treatments/acne/understanding-acne-treatment",
          source: "Acne Care",
        },
        {
          id: 5,
          title: "Bahan Anti-Aging yang Terbukti Efektif",
          excerpt:
            "Temukan bahan-bahan berbasis sains seperti retinol, vitamin C, dan peptida yang dapat membantu mengurangi tanda-tanda penuaan.",
          content: "Pasar skincare anti-aging dipenuhi dengan janji-janji...",
          category: "Anti-Aging",
          author: "Dr. James Pratama",
          publishedAt: "2024-01-05",
          readTime: "10 min",
          image:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=250&fit=crop",
          tags: ["anti-aging", "retinol", "vitamin C"],
          views: 1680,
          likes: 134,
          sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2699641/",
          source: "Beauty Research",
        },
        {
          id: 6,
          title: "Perawatan Kulit Alami: Resep DIY dan Solusi Organik",
          excerpt:
            "Jelajahi alternatif alami yang lembut untuk perawatan kulit menggunakan bahan-bahan dari dapur dan kebun Anda.",
          content:
            "Perawatan kulit alami semakin populer karena orang mencari alternatif yang lebih lembut...",
          category: "Perawatan Alami",
          author: "Dr. Emily Sari",
          publishedAt: "2024-01-03",
          readTime: "9 min",
          image:
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=250&fit=crop",
          tags: ["alami", "organik", "DIY"],
          views: 2100,
          likes: 178,
          sourceUrl:
            "https://www.allure.com/story/diy-natural-skincare-ingredients",
          source: "Natural Beauty",
        },
        {
          id: 7,
          title: "Rutinitas Skincare Korea untuk Kulit Glowing",
          excerpt:
            "Pelajari rahasia 10-step Korean skincare routine yang dapat memberikan kulit sehat dan bercahaya seperti K-beauty idols.",
          content:
            "Korean skincare routine terkenal dengan pendekatan berlapis yang memberikan hasil maksimal...",
          category: "K-Beauty",
          author: "Dr. Kim Soo-jin",
          publishedAt: "2024-01-02",
          readTime: "12 min",
          image:
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=250&fit=crop",
          tags: ["K-beauty", "skincare routine", "glowing skin"],
          views: 2850,
          likes: 245,
          sourceUrl: "https://www.allure.com/story/korean-skin-care-routine",
          source: "K-Beauty Indonesia",
        },
        {
          id: 8,
          title: "Makeup Natural untuk Sehari-hari",
          excerpt:
            "Tips dan trik makeup natural yang mudah diterapkan untuk tampilan fresh dan natural setiap hari.",
          content:
            "Makeup natural adalah kunci untuk tampilan yang segar dan tidak berlebihan...",
          category: "Makeup Tips",
          author: "Rina Makeup Artist",
          publishedAt: "2024-01-01",
          readTime: "8 min",
          image:
            "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop",
          tags: ["makeup", "natural look", "daily makeup"],
          views: 1920,
          likes: 156,
          sourceUrl: "https://www.byrdie.com/natural-makeup-look",
          source: "Makeup Indonesia",
        },
        {
          id: 9,
          title: "Perawatan Kulit Sensitif: Do's and Don'ts",
          excerpt:
            "Panduan lengkap merawat kulit sensitif dengan produk dan teknik yang tepat untuk menghindari iritasi.",
          content:
            "Kulit sensitif memerlukan perhatian khusus dan produk yang diformulasikan khusus...",
          category: "Kulit Sensitif",
          author: "Dr. Maya Dermatologi",
          publishedAt: "2023-12-30",
          readTime: "7 min",
          image:
            "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=250&fit=crop",
          tags: ["kulit sensitif", "perawatan khusus", "dermatologi"],
          views: 1456,
          likes: 98,
          sourceUrl: "https://www.healthline.com/health/sensitive-skin",
          source: "Sensitive Care",
        },
        {
          id: 10,
          title: "Trend Skincare 2024: Ingredient dan Produk Terbaru",
          excerpt:
            "Discover the latest skincare trends, breakthrough ingredients, dan produk inovatif yang akan mendominasi tahun 2024.",
          content:
            "Industri skincare terus berkembang dengan inovasi baru setiap tahunnya...",
          category: "Trend Kecantikan",
          author: "Beauty Editor Team",
          publishedAt: "2023-12-28",
          readTime: "11 min",
          image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=250&fit=crop",
          tags: ["trend 2024", "skincare innovation", "beauty trends"],
          views: 3200,
          likes: 287,
          sourceUrl: "https://www.vogue.com/article/skincare-trends-2024",
          source: "Beauty Trends",
        },
        {
          id: 11,
          title: "Cara Memilih Foundation yang Tepat untuk Jenis Kulit",
          excerpt:
            "Panduan lengkap memilih foundation yang sesuai dengan jenis kulit dan undertone untuk hasil makeup yang flawless.",
          content:
            "Memilih foundation yang tepat adalah kunci makeup yang sempurna...",
          category: "Makeup Tips",
          author: "Makeup Artist Pro",
          publishedAt: "2023-12-25",
          readTime: "6 min",
          image:
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop",
          tags: ["foundation", "makeup", "jenis kulit"],
          views: 1890,
          likes: 145,
          sourceUrl: "https://www.byrdie.com/how-to-choose-foundation",
          source: "Makeup Guide",
        },
        {
          id: 12,
          title: "Skincare Routine Malam untuk Regenerasi Kulit",
          excerpt:
            "Rutinitas perawatan malam yang efektif untuk membantu regenerasi dan pemulihan kulit saat tidur.",
          content:
            "Malam hari adalah waktu terbaik untuk kulit melakukan regenerasi...",
          category: "Perawatan Wajah",
          author: "Dr. Night Care",
          publishedAt: "2023-12-22",
          readTime: "9 min",
          image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop",
          tags: ["night routine", "regenerasi", "perawatan malam"],
          views: 2340,
          likes: 198,
          sourceUrl:
            "https://www.healthline.com/health/beauty-skin-care/night-routine",
          source: "Night Care",
        },
        {
          id: 13,
          title: "Mengatasi Mata Panda dan Kantung Mata Secara Alami",
          excerpt:
            "Tips dan cara alami untuk mengurangi lingkaran hitam di bawah mata dan kantung mata yang mengganggu.",
          content:
            "Mata panda dan kantung mata adalah masalah umum yang bisa diatasi...",
          category: "Perawatan Alami",
          author: "Dr. Eye Care",
          publishedAt: "2023-12-20",
          readTime: "7 min",
          image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
          tags: ["mata panda", "kantung mata", "perawatan mata"],
          views: 1567,
          likes: 123,
          sourceUrl:
            "https://www.healthline.com/health/dark-circles-under-eyes",
          source: "Eye Care",
        },
        {
          id: 14,
          title: "Tren Warna Lipstik 2024 yang Wajib Dicoba",
          excerpt:
            "Discover the hottest lipstick colors and trends for 2024 yang akan mendominasi dunia beauty.",
          content:
            "Tahun 2024 membawa tren warna lipstik yang beragam dan menarik...",
          category: "Trend Kecantikan",
          author: "Color Trend Expert",
          publishedAt: "2023-12-18",
          readTime: "5 min",
          image:
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=250&fit=crop",
          tags: ["lipstik", "trend 2024", "warna"],
          views: 2890,
          likes: 267,
          sourceUrl: "https://www.allure.com/story/lipstick-trends-2024",
          source: "Color Trends",
        },
        {
          id: 15,
          title: "Perawatan Kulit Berminyak: Tips dan Produk Terbaik",
          excerpt:
            "Panduan komprehensif untuk merawat kulit berminyak dengan produk dan teknik yang tepat.",
          content:
            "Kulit berminyak memerlukan perawatan khusus untuk mengontrol sebum...",
          category: "Perawatan Wajah",
          author: "Dr. Oily Skin",
          publishedAt: "2023-12-15",
          readTime: "8 min",
          image:
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
          tags: ["kulit berminyak", "sebum control", "perawatan"],
          views: 1789,
          likes: 134,
          sourceUrl: "https://www.healthline.com/health/oily-skin",
          source: "Oily Care",
        },
      ];

      // Implement pagination for fallback data
      const startIndex = (currentPage - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedArticles = fallbackArticles.slice(startIndex, endIndex);

      setArticles(paginatedArticles);
      setTotalPages(Math.ceil(fallbackArticles.length / 10));
      setError(null); // Clear error since we have fallback data
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Active Timers Indicator */}
        {activeTimers.size > 0 && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">⏱️</span>
              <span className="font-medium">Timer Aktif</span>
            </div>
            <div className="text-sm space-y-1">
              {Array.from(activeTimers.entries()).map(([articleId, timer]) => (
                <div
                  key={articleId}
                  className="flex justify-between items-center"
                >
                  <span className="truncate mr-2">
                    {timer.articleTitle.substring(0, 30)}...
                  </span>
                  <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                    {Math.ceil(
                      (TIMER_DURATION - (Date.now() - timer.startTime)) / 1000
                    )}
                    s
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs mt-2 opacity-75">
              Jangan melakukan aktivitas untuk mendapat poin
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Artikel Kecantikan & Perawatan Kulit
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temukan tips kecantikan, panduan perawatan wajah, dan informasi
            terbaru tentang skincare dari para ahli dermatologi dan beauty
            expert
          </p>
        </div>

        {/* Articles Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchArticles} className="btn-primary">
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <section
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
              aria-label="Daftar artikel kecantikan dan perawatan kulit"
            >
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  aria-labelledby={`article-${article.id}-title`}
                >
                  <a
                    href={
                      isUsingFallback
                        ? `#/artikel/${article.id}`
                        : article.sourceUrl || `#/artikel/${article.id}`
                    }
                    target={
                      isUsingFallback
                        ? "_self"
                        : article.sourceUrl
                        ? "_blank"
                        : "_self"
                    }
                    rel={
                      isUsingFallback
                        ? ""
                        : article.sourceUrl
                        ? "noopener noreferrer"
                        : ""
                    }
                    onClick={(e) => {
                      // Start inactivity timer for external links
                      if (!isUsingFallback && article.sourceUrl) {
                        startInactivityTimer(article.id, article.title);
                      }
                    }}
                    className="block hover:no-underline"
                    aria-label={`Baca artikel: ${article.title}`}
                  >
                    <figure>
                      <img
                        src={article.image}
                        alt={`Gambar artikel: ${article.title}`}
                        className="w-full h-48 object-cover"
                      />
                    </figure>
                    <div className="p-6">
                      <header className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                          {article.category}
                        </span>
                        <time
                          className="text-sm text-gray-500"
                          dateTime={`PT${article.readTime.replace(
                            " min",
                            "M"
                          )}`}
                        >
                          {article.readTime}
                        </time>
                      </header>

                      <h2
                        id={`article-${article.id}-title`}
                        className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
                      >
                        {article.title}
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      <footer className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <address className="not-italic">
                          <span>By {article.author}</span>
                        </address>
                        <time dateTime={article.publishedAt}>
                          {formatDate(article.publishedAt)}
                        </time>
                      </footer>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span
                            className="flex items-center"
                            aria-label={`${article.views} views`}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {article.views}
                          </span>
                          <span
                            className="flex items-center"
                            aria-label={`${article.likes} likes`}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            {article.likes}
                          </span>
                        </div>

                        <span
                          className="text-orange-600 hover:text-orange-700 font-medium"
                          aria-label="Baca artikel lengkap"
                        >
                          Baca Selengkapnya →
                        </span>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <section
                className="flex justify-center"
                aria-label="Navigasi halaman artikel"
              >
                <nav aria-label="Pagination Navigation" role="navigation">
                  <ul className="flex space-x-2">
                    <li>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Halaman sebelumnya"
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index + 1}>
                        <button
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            currentPage === index + 1
                              ? "text-white bg-primary-500 border border-primary-500"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                          aria-label={`Halaman ${index + 1}`}
                          aria-current={
                            currentPage === index + 1 ? "page" : undefined
                          }
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Halaman selanjutnya"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Articles;
