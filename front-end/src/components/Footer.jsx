import { useScrollAnimation } from "../hooks/useScrollAnimation.js";

const Footer = () => {
  const [footerRef, footerVisible] = useScrollAnimation({ threshold: 0.2 });

  const socialLinks = [
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: "#",
    },
    {
      name: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.928-.875 2.079-1.365 3.323-1.365s2.395.49 3.323 1.365c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.928.875-2.079 1.365-3.323 1.365zm7.598 0c-1.297 0-2.448-.49-3.323-1.297-.875-.807-1.365-1.958-1.365-3.255s.49-2.448 1.365-3.323c.875-.875 2.026-1.365 3.323-1.365s2.448.49 3.323 1.365c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.875-2.026 1.365-3.323 1.365z" />
        </svg>
      ),
      href: "#",
    },
    {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      href: "#",
    },
  ];

  return (
    <footer
      className="bg-gradient-to-br from-primary-500 to-primary-700 text-white"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <section
            className="col-span-1 md:col-span-2"
            aria-labelledby="brand-heading"
          >
            <h3
              id="brand-heading"
              className="text-2xl font-black mb-4 text-white drop-shadow-sm"
            >
              Dermalyze
            </h3>
            <p className="text-white/90 mb-6 max-w-md font-medium drop-shadow-sm">
              Platform analisis kulit wajah dengan teknologi AI untuk memberikan
              rekomendasi perawatan yang tepat sesuai dengan kondisi kulit Anda.
            </p>
            <div
              className="flex space-x-4"
              role="list"
              aria-label="Media sosial"
            >
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:rotate-12 animate-bounce"
                  style={{ animationDelay: `${index * 0.2}s` }}
                  aria-label={`Ikuti kami di ${social.name}`}
                  role="listitem"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Partner Logos */}
            <div className="mt-6">
              <p className="text-white/70 text-sm mb-3 font-medium drop-shadow-sm">
                Partner by
              </p>
              <div className="flex items-center space-x-6">
                <img
                  src="/images/gunadarma.png"
                  alt="Universitas Gunadarma"
                  className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 animate-float"
                />
                <img
                  src="/images/dicoding.png"
                  alt="Dicoding"
                  className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 animate-float"
                  style={{ animationDelay: "1s" }}
                />
                <img
                  src="/images/dbs.webp"
                  alt="DBS Foundation"
                  className="h-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 animate-float"
                  style={{ animationDelay: "2s" }}
                />
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section aria-labelledby="quick-links-heading">
            <h4
              id="quick-links-heading"
              className="text-lg font-bold mb-4 text-white drop-shadow-sm"
            >
              Quick Links
            </h4>
            <nav aria-label="Link navigasi cepat">
              <ul className="space-y-2">
                <li>
                  <a
                    href="#/"
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 drop-shadow-sm"
                  >
                    Beranda
                  </a>
                </li>
                <li>
                  <a
                    href="#/analisis"
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 drop-shadow-sm"
                  >
                    Analisis
                  </a>
                </li>
                <li>
                  <a
                    href="#/riwayat"
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 drop-shadow-sm"
                  >
                    Riwayat
                  </a>
                </li>
                <li>
                  <a
                    href="#/produk"
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 drop-shadow-sm"
                  >
                    Produk
                  </a>
                </li>
                <li>
                  <a
                    href="#/artikel"
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 drop-shadow-sm"
                  >
                    Artikel
                  </a>
                </li>
                <li>
                  <a
                    href="#/about"
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 drop-shadow-sm"
                  >
                    About
                  </a>
                </li>
              </ul>
            </nav>
          </section>

          {/* Support */}
          <section aria-labelledby="support-heading">
            <h4
              id="support-heading"
              className="text-lg font-bold mb-4 text-white drop-shadow-sm"
            >
              Support
            </h4>
            <nav aria-label="Link bantuan dan dukungan">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("FAQ clicked - halaman belum tersedia");
                    }}
                    className="footer-link-button"
                    aria-label="FAQ - Halaman belum tersedia"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Kontak clicked - halaman belum tersedia");
                    }}
                    className="footer-link-button"
                    aria-label="Kontak - Halaman belum tersedia"
                  >
                    Kontak
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(
                        "Privacy Policy clicked - halaman belum tersedia"
                      );
                    }}
                    className="footer-link-button"
                    aria-label="Privacy Policy - Halaman belum tersedia"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(
                        "Terms of Service clicked - halaman belum tersedia"
                      );
                    }}
                    className="footer-link-button"
                    aria-label="Terms of Service - Halaman belum tersedia"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </nav>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/70 font-medium drop-shadow-sm">
            © <time dateTime="2024">2024</time> Dermalyze. All rights reserved.
            Made with ❤️ for healthy skin.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
