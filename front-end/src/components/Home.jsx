import {
  getAnimationClasses,
  useScrollAnimation,
} from "../hooks/useScrollAnimation.js";
import PointsDisplay from "./PointsDisplay.jsx";

const Hero = () => {
  const [titleRef, titleVisible] = useScrollAnimation({ delay: 200 });
  const [subtitleRef, subtitleVisible] = useScrollAnimation({ delay: 400 });
  const [pointsRef, pointsVisible] = useScrollAnimation({ delay: 100 });
  const [buttonsRef, buttonsVisible] = useScrollAnimation({ delay: 600 });
  const [imageRef, imageVisible] = useScrollAnimation({ delay: 300 });

  return (
    <div>
      {/* Hero Section */}
      <section
        className="bg-gradient-to-br from-derma-cream to-derma-rose py-20 relative overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Floating Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200/30 rounded-full animate-float"></div>
        <div
          className="absolute top-32 right-20 w-16 h-16 bg-primary-300/20 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary-400/25 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Points Display Box */}
              <aside
                ref={pointsRef}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-primary-100 inline-block w-fit transition-all duration-500 hover:shadow-xl hover:scale-105 ${getAnimationClasses(
                  pointsVisible,
                  "scaleIn"
                )}`}
              >
                <PointsDisplay size="large" showLabel={true} />
              </aside>

              {/* Main Title */}
              <header>
                <h1
                  ref={titleRef}
                  className={`text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 ${getAnimationClasses(
                    titleVisible,
                    "fadeInUp"
                  )}`}
                >
                  Temukan Skincare yang Tepat untuk{" "}
                  <span className="text-primary-500 animate-glow">Kulitmu</span>
                </h1>
                <p
                  ref={subtitleRef}
                  className={`text-lg text-gray-600 leading-relaxed mb-8 ${getAnimationClasses(
                    subtitleVisible,
                    "fadeInUp"
                  )}`}
                >
                  Analisa wajah dengan teknologi machine learning untuk
                  rekomendasi perawatan kulit.
                </p>
              </header>

              {/* Action Buttons */}
              <div
                ref={buttonsRef}
                className={`flex flex-col sm:flex-row gap-4 ${getAnimationClasses(
                  buttonsVisible,
                  "fadeInUp"
                )}`}
              >
                <a
                  href="#/analisis"
                  className="btn-primary inline-flex items-center justify-center group relative overflow-hidden"
                >
                  <svg
                    className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110"
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
                  <span className="relative z-10">Mulai Analisis Kulit</span>
                </a>
              </div>

              {/* Features List */}
              <ul
                className={`text-sm text-gray-600 space-y-2 list-none p-0 m-0 ${getAnimationClasses(
                  buttonsVisible,
                  "fadeInUp",
                  200
                )}`}
              >
                <li className="flex items-center space-x-2 transition-all duration-300 hover:text-primary-600 hover:scale-105">
                  <span className="animate-bounce">✨</span>
                  <span>Analisis AI yang akurat dalam hitungan detik</span>
                </li>
                <li className="flex items-center space-x-2 transition-all duration-300 hover:text-primary-600 hover:scale-105">
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  >
                    📱
                  </span>
                  <span>Upload foto atau ambil foto langsung</span>
                </li>
                <li className="flex items-center space-x-2 transition-all duration-300 hover:text-primary-600 hover:scale-105">
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  >
                    💡
                  </span>
                  <span>Rekomendasi perawatan yang personal</span>
                </li>
              </ul>
            </div>

            {/* Right Content - Image */}
            <div
              ref={imageRef}
              className={`relative ${getAnimationClasses(
                imageVisible,
                "fadeInRight"
              )}`}
            >
              <figure className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Wanita sedang melakukan rutinitas perawatan kulit dengan produk skincare"
                  className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-110"
                />

                {/* Floating elements - decorative only */}
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg animate-float hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 bg-derma-salmon rounded-full flex items-center justify-center animate-pulse-custom">
                    <div className="w-4 h-4 bg-primary-600 rounded-full animate-glow"></div>
                  </div>
                </div>

                <div
                  className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg animate-float hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: "1s" }}
                >
                  <div
                    className="w-8 h-8 bg-derma-peach rounded-full flex items-center justify-center animate-pulse-custom"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <div
                      className="w-4 h-4 bg-primary-500 rounded-full animate-glow"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                  </div>
                </div>

                <div
                  className="absolute top-1/2 left-8 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg animate-float hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: "2s" }}
                >
                  <div
                    className="w-8 h-8 bg-derma-rose rounded-full flex items-center justify-center animate-pulse-custom"
                    style={{ animationDelay: "1s" }}
                  >
                    <div
                      className="w-4 h-4 bg-secondary-300 rounded-full animate-glow"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
