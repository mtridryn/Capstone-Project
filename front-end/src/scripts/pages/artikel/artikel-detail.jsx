import { useEffect, useState } from "react";
import { usePoints } from "../../../components/PointsContext.jsx";
import newsApiService from "../../services/newsApiService.js";

const ArticleDetail = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingTime, setReadingTime] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { awardReadingPoints } = usePoints();

  // Get article ID from URL
  const getArticleId = () => {
    const hash = window.location.hash;
    const parts = hash.split("/");
    return parts[2] || null;
  };

  const articleId = getArticleId();

  useEffect(() => {
    if (articleId) {
      fetchArticle(articleId);
    }
  }, [articleId]);

  // Reading timer effect
  useEffect(() => {
    if (!article || pointsAwarded) {
      console.log("Timer not started:", { article: !!article, pointsAwarded });
      return;
    }

    console.log("Starting reading timer for article:", articleId);

    const timer = setInterval(() => {
      setReadingTime((prev) => {
        const newTime = prev + 1;

        // Award points after 1 minute (60 seconds) of reading
        if (newTime >= 60 && !pointsAwarded) {
          console.log("Attempting to award points for article:", articleId);
          awardReadingPoints(articleId, article?.title || "")
            .then((awarded) => {
              console.log("Points awarded result:", awarded);
              if (awarded) {
                setPointsAwarded(true);
                // Show notification
                showPointsNotification();
              }
            })
            .catch((error) => {
              console.error("Error awarding points:", error);
            });
        }

        return newTime;
      });
    }, 1000);

    return () => {
      console.log("Cleaning up timer for article:", articleId);
      clearInterval(timer);
    };
  }, [article, articleId, pointsAwarded, awardReadingPoints]);

  const showPointsNotification = () => {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-lg">🎉</span>
        <span class="font-medium">+10 Poin!</span>
        <span class="text-sm">Terima kasih telah membaca artikel</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const fetchArticle = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      try {
        const data = await newsApiService.fetchSkincareNews(1, 100);
        const foundArticle = data.articles?.find((article) => article.id == id);

        if (foundArticle) {
          // Ensure the article has content for reading
          if (!foundArticle.content) {
            foundArticle.content = `
              <div class="space-y-6">
                <p>${
                  foundArticle.excerpt ||
                  foundArticle.description ||
                  "Artikel ini membahas topik perawatan kulit yang penting untuk kesehatan dan kecantikan kulit Anda."
                }</p>

                <h2>Tentang Artikel Ini</h2>
                <p>Artikel ini memberikan informasi berharga tentang perawatan kulit dan kecantikan. Dengan membaca artikel ini selama 1 menit, Anda akan mendapatkan 10 poin sebagai reward.</p>

                <h2>Tips Perawatan Kulit</h2>
                <p>Perawatan kulit yang baik memerlukan konsistensi dan pemahaman tentang jenis kulit Anda. Berikut adalah beberapa tips dasar:</p>
                <ul>
                  <li>Bersihkan wajah secara teratur dengan pembersih yang sesuai</li>
                  <li>Gunakan pelembab yang cocok untuk jenis kulit Anda</li>
                  <li>Selalu gunakan tabir surya saat beraktivitas di luar ruangan</li>
                  <li>Konsumsi air yang cukup untuk menjaga hidrasi kulit</li>
                  <li>Istirahat yang cukup untuk regenerasi sel kulit</li>
                </ul>

                <h2>Pentingnya Konsistensi</h2>
                <p>Hasil perawatan kulit yang optimal membutuhkan waktu dan konsistensi. Jangan berharap perubahan instan, tetapi lakukan rutinitas perawatan secara teratur untuk mendapatkan hasil terbaik.</p>

                <h2>Konsultasi dengan Ahli</h2>
                <p>Jika Anda memiliki masalah kulit yang serius atau tidak yakin dengan produk yang tepat, sebaiknya konsultasikan dengan dermatologis atau ahli perawatan kulit profesional.</p>
              </div>
            `;
          }

          setArticle(foundArticle);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log("API failed, using fallback data");
      }

      // Fallback to mock data
      const fallbackArticles = [
        {
          id: 1,
          title: "10 Tips Perawatan Wajah untuk Kulit Glowing Alami",
          excerpt:
            "Temukan rahasia perawatan wajah yang direkomendasikan ahli dermatologi untuk mendapatkan kulit sehat dan bercahaya setiap hari.",
          content: `
            <h2>Pentingnya Perawatan Wajah yang Tepat</h2>
            <p>Perawatan wajah yang tepat adalah kunci untuk mendapatkan kulit yang sehat dan bercahaya. Berikut adalah 10 tips yang telah terbukti efektif:</p>
            
            <h3>1. Bersihkan Wajah Secara Teratur</h3>
            <p>Membersihkan wajah dua kali sehari dengan pembersih yang sesuai dengan jenis kulit Anda adalah langkah dasar yang tidak boleh dilewatkan.</p>
            
            <h3>2. Gunakan Toner</h3>
            <p>Toner membantu menyeimbangkan pH kulit dan mempersiapkan kulit untuk menerima produk perawatan selanjutnya.</p>
            
            <h3>3. Aplikasikan Serum</h3>
            <p>Serum mengandung konsentrasi bahan aktif yang tinggi untuk mengatasi masalah kulit spesifik.</p>
            
            <h3>4. Jangan Lupa Moisturizer</h3>
            <p>Pelembab membantu menjaga kelembaban kulit dan mencegah penuaan dini.</p>
            
            <h3>5. Gunakan Sunscreen</h3>
            <p>Perlindungan dari sinar UV adalah langkah terpenting dalam perawatan kulit.</p>
            
            <h3>6. Eksfoliasi Rutin</h3>
            <p>Lakukan eksfoliasi 1-2 kali seminggu untuk mengangkat sel kulit mati.</p>
            
            <h3>7. Minum Air yang Cukup</h3>
            <p>Hidrasi dari dalam sangat penting untuk kesehatan kulit.</p>
            
            <h3>8. Tidur yang Cukup</h3>
            <p>Kulit melakukan regenerasi saat kita tidur, jadi pastikan tidur 7-8 jam setiap malam.</p>
            
            <h3>9. Kelola Stres</h3>
            <p>Stres dapat mempengaruhi kondisi kulit, jadi penting untuk mengelolanya dengan baik.</p>
            
            <h3>10. Konsultasi dengan Ahli</h3>
            <p>Jika memiliki masalah kulit yang serius, jangan ragu untuk berkonsultasi dengan dermatolog.</p>
            
            <h2>Kesimpulan</h2>
            <p>Perawatan kulit yang konsisten dan tepat akan memberikan hasil yang optimal. Ingatlah bahwa setiap kulit unik, jadi temukan rutinitas yang paling cocok untuk Anda.</p>
          `,
          category: "Tips Kecantikan",
          author: "Dr. Sari Dewi",
          publishedAt: "2024-01-15",
          readTime: "5 min",
          image:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=400&fit=crop",
          tags: ["perawatan wajah", "kecantikan", "tips"],
          views: 1250,
          likes: 89,
          source: "Beauty Indonesia",
        },
        {
          id: 2,
          title: "Mengenal Jenis Kulit Wajah: Panduan Lengkap",
          excerpt:
            "Pelajari cara mengidentifikasi jenis kulit Anda dan memilih produk yang tepat untuk kulit berminyak, kering, kombinasi, atau sensitif.",
          content: `
            <h2>Mengapa Penting Mengenal Jenis Kulit?</h2>
            <p>Mengetahui jenis kulit Anda adalah langkah pertama dalam membangun rutinitas perawatan yang efektif. Setiap jenis kulit memiliki karakteristik dan kebutuhan yang berbeda.</p>
            
            <h3>Jenis-Jenis Kulit Wajah</h3>
            
            <h4>1. Kulit Normal</h4>
            <p>Kulit normal memiliki keseimbangan yang baik antara minyak dan kelembaban. Karakteristiknya:</p>
            <ul>
              <li>Pori-pori berukuran sedang</li>
              <li>Tekstur halus dan lembut</li>
              <li>Jarang berjerawat</li>
              <li>Tidak terlalu berminyak atau kering</li>
            </ul>
            
            <h4>2. Kulit Berminyak</h4>
            <p>Kulit berminyak memproduksi sebum berlebihan. Ciri-cirinya:</p>
            <ul>
              <li>Pori-pori besar dan terlihat jelas</li>
              <li>Wajah terlihat mengkilap</li>
              <li>Rentan berjerawat</li>
              <li>Makeup mudah luntur</li>
            </ul>
            
            <h4>3. Kulit Kering</h4>
            <p>Kulit kering kekurangan kelembaban alami. Karakteristiknya:</p>
            <ul>
              <li>Terasa kencang setelah dicuci</li>
              <li>Pori-pori hampir tidak terlihat</li>
              <li>Mudah mengelupas</li>
              <li>Garis halus lebih terlihat</li>
            </ul>
            
            <h4>4. Kulit Kombinasi</h4>
            <p>Kulit kombinasi memiliki area berminyak dan kering. Biasanya:</p>
            <ul>
              <li>T-zone (dahi, hidung, dagu) berminyak</li>
              <li>Pipi cenderung normal atau kering</li>
              <li>Pori-pori bervariasi ukurannya</li>
            </ul>
            
            <h4>5. Kulit Sensitif</h4>
            <p>Kulit sensitif mudah bereaksi terhadap produk atau lingkungan:</p>
            <ul>
              <li>Mudah kemerahan</li>
              <li>Terasa perih atau gatal</li>
              <li>Reaktif terhadap produk tertentu</li>
              <li>Mudah iritasi</li>
            </ul>
            
            <h3>Cara Menentukan Jenis Kulit</h3>
            <p>Lakukan tes sederhana ini:</p>
            <ol>
              <li>Cuci wajah dengan pembersih lembut</li>
              <li>Keringkan dengan handuk bersih</li>
              <li>Tunggu 1 jam tanpa menggunakan produk apapun</li>
              <li>Amati kondisi kulit Anda</li>
            </ol>
            
            <h2>Tips Perawatan Berdasarkan Jenis Kulit</h2>
            <p>Setelah mengetahui jenis kulit, pilih produk dan rutinitas yang sesuai untuk hasil optimal.</p>
          `,
          category: "Perawatan Wajah",
          author: "Dr. Michael Chen",
          publishedAt: "2024-01-12",
          readTime: "7 min",
          image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=400&fit=crop",
          tags: ["jenis kulit", "perawatan wajah", "panduan"],
          views: 980,
          likes: 67,
          source: "Derma Care",
        },
        // Add more fallback articles as needed
      ];

      const foundArticle = fallbackArticles.find((article) => article.id == id);

      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        setError("Artikel tidak ditemukan");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatReadingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `0:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="#/artikel" className="btn-primary">
            Kembali ke Artikel
          </a>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Artikel tidak ditemukan</p>
          <a href="#/artikel" className="btn-primary">
            Kembali ke Artikel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${Math.min((readingTime / 60) * 100, 100)}%` }}
        ></div>
      </div>

      {/* Reading Timer (for development/testing) */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-40">
        <div className="text-sm text-gray-600">
          <div>Waktu baca: {formatReadingTime(readingTime)}</div>
          {!pointsAwarded && readingTime < 60 && (
            <div className="text-xs text-primary-500">
              {60 - readingTime}s lagi untuk mendapat poin
            </div>
          )}
          {pointsAwarded && (
            <div className="text-xs text-green-500 font-medium">
              ✓ Poin sudah didapat!
            </div>
          )}
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <a
            href="#/artikel"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Artikel
          </a>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
              {article.category}
            </span>
            <time className="text-sm text-gray-500">
              {formatDate(article.publishedAt)}
            </time>
            <span className="text-sm text-gray-500">{article.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Oleh <strong>{article.author}</strong>
              </span>
              {article.source && (
                <span className="text-sm text-gray-500">{article.source}</span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          </div>
        </header>

        {/* Article Image */}
        {article.image && (
          <figure className="mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </figure>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Article Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default ArticleDetail;
