import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import { useCallback, useEffect, useRef, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute.jsx";
import analysisService from "../../services/analysisService.js";
import productService from "../../services/productService.js";

const Analisis = () => {
  // State management
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [captureMode, setCaptureMode] = useState(false);
  const [statusText, setStatusText] = useState("Siap untuk deteksi wajah");
  const [faceDetected, setFaceDetected] = useState(false);
  const [perfectPosition, setPerfectPosition] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Immediate cleanup flag for fast shutdown
  const isUnmountingRef = useRef(false);
  const activeStreamRef = useRef(null);

  // Global immediate cleanup function - accessible from anywhere
  window.emergencyStopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch {}
      cameraRef.current = null;
    }
    if (faceMeshRef.current) {
      faceMeshRef.current = null;
    }
  };

  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  // Constants for face detection
  const FACE_DETECTION_CONFIG = {
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.7,
    selfieMode: true,
    enableFaceGeometry: false,
  };

  const FRAME_CONFIG = {
    width: 300,
    height: 380,
    cornerLength: 35,
    centerThreshold: 40,
    rotationThreshold: 15, // degrees
    tiltThreshold: 10, // degrees
  };

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  }, []);

  // Camera management
  const startCamera = useCallback(async () => {
    try {
      setCaptureMode(true);
      setStatusText("Memulai kamera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        activeStreamRef.current = stream; // Store stream reference for immediate access
        setStatusText("Kamera aktif - Posisikan wajah Anda");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatusText("Error: Tidak dapat mengakses kamera");
      setCaptureMode(false);

      createNotification(
        "error",
        "Kamera Error",
        "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.",
        "📷",
        5000
      );
    }
  }, []);

  // Fast camera shutdown for immediate cleanup
  // Immediate camera shutdown - no delays, no async operations
  const immediateStopCamera = useCallback(() => {
    isUnmountingRef.current = true;

    // Stop from stored stream reference first (fastest)
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }

    // Stop from video element as backup
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    // Stop MediaPipe immediately
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch {}
      cameraRef.current = null;
    }

    if (faceMeshRef.current) {
      faceMeshRef.current = null;
    }
  }, []);

  const fastStopCamera = useCallback(() => {
    console.log("Fast stopping camera...");
    immediateStopCamera();
    console.log("Camera fast stopped");
  }, [immediateStopCamera]);

  const stopCamera = useCallback(() => {
    console.log("Stopping camera..."); // Debug log

    // Use immediate stop first
    immediateStopCamera();

    // Clear active stream reference
    activeStreamRef.current = null;

    // Reset states
    setCaptureMode(false);
    setFaceDetected(false);
    setPerfectPosition(false);
    setStatusText("Kamera dimatikan");

    console.log("Camera stopped successfully");
  }, [immediateStopCamera]);

  // Photo capture with proper canvas handling
  const capturePhoto = useCallback(() => {
    console.log("Capturing photo...");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error("Video or canvas not available for capture");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image to match what user sees
    context.save();
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, 0, 0);
    context.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log("Photo captured successfully, stopping camera...");
          const file = new File([blob], "captured-photo.jpg", {
            type: "image/jpeg",
          });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL());

          // Immediately stop camera after capture
          stopCamera();
        } else {
          console.error("Failed to create blob from canvas");
        }
      },
      "image/jpeg",
      0.9
    );
  }, [stopCamera]);

  // Function to get skin care tips based on skin type
  const getSkinCareRecommendations = (skinType) => {
    const recommendations = {
      normal: [
        "Gunakan pembersih wajah yang lembut 2x sehari",
        "Aplikasikan pelembab ringan setiap pagi dan malam",
        "Gunakan sunscreen SPF 30+ setiap hari",
        "Lakukan eksfoliasi ringan 1-2x seminggu",
        "Gunakan serum vitamin C di pagi hari",
      ],
      oily: [
        "Gunakan pembersih wajah berbahan salicylic acid 2x sehari",
        "Aplikasikan toner bebas alkohol untuk mengontrol minyak",
        "Gunakan pelembab oil-free atau gel-based",
        "Gunakan sunscreen non-comedogenic SPF 30+",
        "Lakukan clay mask 1-2x seminggu",
        "Hindari over-cleansing yang dapat memicu produksi minyak berlebih",
      ],
      dry: [
        "Gunakan pembersih wajah yang sangat lembut dan bebas sulfat",
        "Aplikasikan pelembab kaya (cream-based) 2x sehari",
        "Gunakan serum hyaluronic acid untuk hidrasi ekstra",
        "Gunakan sunscreen dengan formula moisturizing SPF 30+",
        "Hindari produk yang mengandung alkohol dan fragrance",
        "Gunakan face oil di malam hari untuk nutrisi ekstra",
      ],
    };

    return recommendations[skinType.toLowerCase()] || recommendations.normal;
  };

  // Function to get product recommendations based on skin type
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const getProductRecommendations = async (skinType) => {
    try {
      console.log(
        "🔍 Fetching product recommendations for skin type:",
        skinType
      );
      const products = await productService.getRecommendedProducts(skinType);
      console.log("📦 Received products:", products);
      console.log("📊 Number of products received:", products.length);

      setRecommendedProducts(products);
      return products;
    } catch (error) {
      console.error("❌ Error fetching product recommendations:", error);
      setRecommendedProducts([]);
      return [];
    }
  };

  // Function to navigate to product page with skin type filter
  const navigateToProducts = (skinType) => {
    // Navigate to product page with skin type filter
    window.location.hash = `#/produk?skinType=${skinType}`;
  };

  // Product Card Component - Same as products page but optimized for horizontal scrolling
  const ProductCard = ({ product }) => {
    // Helper function for skin type colors (same as products page)
    const getSkinTypeColor = (skinType) => {
      switch (skinType?.toLowerCase()) {
        case "oily":
          return "bg-blue-100 text-blue-700";
        case "dry":
          return "bg-yellow-100 text-yellow-700";
        case "combination":
          return "bg-green-100 text-green-700";
        case "sensitive":
          return "bg-red-100 text-red-700";
        case "normal":
          return "bg-gray-100 text-gray-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    // Image URL handling (same as products page)
    const imageUrl = product.picture_src || product.picture;

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border min-w-[220px] max-w-[220px] flex-shrink-0">
        <div className="relative">
          <img
            src={
              imageUrl ||
              "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
            }
            alt={product.product_name || "Product"}
            className="w-full h-36 object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop";
            }}
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
              {product.product_type}
            </span>
          </div>
          <div className="absolute top-2 right-2 hidden">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getSkinTypeColor(
                product.skintype
              )}`}
            >
              {product.skintype}
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.brand}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
            {product.product_name}
          </h3>

          <p className="text-xs text-gray-600 mb-2 leading-relaxed line-clamp-2">
            {product.description}
          </p>

          {/* Effects - show max 2 for space efficiency */}
          {product.effects && product.effects.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {product.effects.slice(0, 2).map((effect, index) => (
                  <span
                    key={index}
                    className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full"
                  >
                    {effect}
                  </span>
                ))}
                {product.effects.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{product.effects.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="text-base font-bold text-primary-600">
            Rp {product.price?.toLocaleString("id-ID") || "0"}
          </div>
        </div>
      </div>
    );
  };

  // See More Card Component - Optimized for horizontal scrolling
  const SeeMoreCard = ({ skinType }) => {
    const handleClick = () => {
      // Navigate directly to products page
      console.log("Navigating to products page...");
      window.location.hash = "#/produk";
    };

    return (
      <div
        className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border min-w-[220px] max-w-[220px] flex-shrink-0 cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="h-full flex flex-col items-center justify-center p-6 text-white text-center"
          style={{ minHeight: "240px" }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-base mb-2">Lihat Selengkapnya</h3>
          <p className="text-white/80 text-xs leading-tight">
            Temukan lebih banyak produk yang sesuai dengan jenis kulit Anda
          </p>
        </div>
      </div>
    );
  };

  // Product Recommendations Component
  const ProductRecommendations = ({ skinType }) => {
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Use the state variable instead of calling the function directly
    const currentRecommendedProducts = recommendedProducts;

    console.log("🎨 ProductRecommendations render - skinType:", skinType);
    console.log(
      "🎨 ProductRecommendations render - recommendedProducts:",
      currentRecommendedProducts
    );
    console.log(
      "🎨 ProductRecommendations render - products count:",
      currentRecommendedProducts.length
    );

    // Mouse drag handlers
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
      scrollContainerRef.current.style.cursor = "grabbing";
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Touch handlers for mobile support
    const handleTouchStart = (e) => {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const handleSeeMore = () => {
      navigateToProducts(skinType);
    };

    if (currentRecommendedProducts.length === 0) {
      return null;
    }

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Rekomendasi Produk untuk Kulit {skinType}
          </h3>
          <div className="text-sm text-gray-500">
            Geser untuk melihat lebih banyak produk
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide pb-4 select-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            cursor: "grab",
            minHeight: "240px",
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentRecommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          <SeeMoreCard skinType={skinType} />
        </div>
      </div>
    );
  };

  // Real ML analysis using API
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    // Reset previous recommendations to ensure fresh data
    setRecommendedProducts([]);
    console.log("🔄 Reset recommended products state");

    try {
      console.log("🚀 Starting analysis with image:", selectedImage.name);
      const result = await analysisService.predictSkinType(selectedImage);

      if (result.success) {
        console.log("✅ Analysis successful, result:", result.data);

        // Data sudah ditransformasi di analysisService.predictSkinType()
        // Tidak perlu transformasi lagi
        setAnalysisResult(result.data);

        // Fetch product recommendations for the detected skin type
        console.log(
          "🔄 About to fetch recommendations for:",
          result.data.skinType
        );
        await getProductRecommendations(result.data.skinType);
        console.log("✅ Finished fetching recommendations");
      } else {
        console.error("❌ Analysis failed:", result.message);

        createNotification(
          "error",
          "Analisis Gagal",
          result.message || "Terjadi kesalahan saat analisis",
          "🔍",
          4000
        );
      }
    } catch (error) {
      console.error("💥 Analysis error:", error);

      createNotification(
        "error",
        "Error",
        "Terjadi kesalahan saat analisis. Silakan coba lagi.",
        "⚠️",
        4000
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear image
  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Reset analysis
  const resetAnalysis = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setCaptureMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Utility function to create beautiful notifications
  const createNotification = (type, title, message, icon, duration = 4000) => {
    const notification = document.createElement("div");

    // Define colors based on type
    const colors = {
      success: "from-primary-500 to-primary-600 border-primary-400/20",
      error: "from-red-500 to-red-600 border-red-400/20",
      warning: "from-yellow-500 to-yellow-600 border-yellow-400/20",
      info: "from-blue-500 to-blue-600 border-blue-400/20",
    };

    notification.className = `
      fixed top-6 right-6 z-50 transform translate-x-full opacity-0
      bg-gradient-to-r ${colors[type]}
      text-white px-8 py-4 rounded-2xl shadow-2xl
      transition-all duration-500 ease-out
      backdrop-blur-sm max-w-sm w-full
    `;

    notification.innerHTML = `
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${
                type === "success"
                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
                  : type === "error"
                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                  : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
              }
            </svg>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-lg">${icon}</span>
            <span class="font-bold text-lg">${title}</span>
          </div>
          <p class="text-white/90 text-sm font-medium">
            ${message}
          </p>
        </div>
        ${
          type === "success"
            ? `
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
              <span class="text-xs">💾</span>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;

    // Add to DOM and animate
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 100);

    // Auto-remove with animation
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";

      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, duration);
  };

  // Show beautiful notification
  const showSaveNotification = () => {
    createNotification(
      "success",
      "Berhasil!",
      "Hasil analisis sudah tersimpan",
      "✨",
      4000
    );
  };

  // Save analysis result
  const saveAnalysisResult = useCallback(async () => {
    if (!analysisResult) {
      createNotification(
        "error",
        "Oops!",
        "Tidak ada hasil analisis untuk disimpan",
        "⚠️",
        3000
      );
      return;
    }

    try {
      // Set loading state
      setIsSaving(true);

      // Note: Analysis is already saved automatically when predict is called
      // This is just for user feedback and navigation

      // Show success notification with better UX
      setTimeout(() => {
        setIsSaving(false);
        showSaveNotification();

        // Navigate to history page after a short delay
        setTimeout(() => {
          window.location.hash = "#/riwayat";
        }, 1500);
      }, 1000);
    } catch (error) {
      console.error("Error in save process:", error);
      setIsSaving(false);

      createNotification(
        "error",
        "Error!",
        "Terjadi kesalahan. Silakan coba lagi.",
        "❌",
        3000
      );
    }
  }, [analysisResult]);

  // Drawing utilities
  const drawCornerFrame = useCallback((ctx, centerX, centerY, config) => {
    const { width, height, cornerLength } = config;
    const frameX = centerX - width / 2;
    const frameY = centerY - height / 2;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const drawCorner = (x1, y1, x2, y2, x3, y3) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    };

    // Draw four corners
    drawCorner(
      frameX,
      frameY + cornerLength,
      frameX,
      frameY,
      frameX + cornerLength,
      frameY
    );
    drawCorner(
      frameX + width - cornerLength,
      frameY,
      frameX + width,
      frameY,
      frameX + width,
      frameY + cornerLength
    );
    drawCorner(
      frameX,
      frameY + height - cornerLength,
      frameX,
      frameY + height,
      frameX + cornerLength,
      frameY + height
    );
    drawCorner(
      frameX + width - cornerLength,
      frameY + height,
      frameX + width,
      frameY + height,
      frameX + width,
      frameY + height - cornerLength
    );
  }, []);

  const drawFaceLandmarks = useCallback(
    (ctx, landmarks, videoWidth, videoHeight, isCentered) => {
      const color = isCentered ? "#00ff00" : "#ff4444";
      const landmarkSize = Math.max(
        1.5,
        Math.min(videoWidth, videoHeight) / 400
      );

      // Set drawing style
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 2;

      // Draw all landmarks - MediaPipe Face Mesh provides 468 landmarks
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * videoWidth;
        const y = landmark.y * videoHeight;

        // Draw landmark point
        ctx.beginPath();
        ctx.arc(x, y, landmarkSize, 0, 2 * Math.PI);
        ctx.fill();

        // Highlight key landmarks with larger size
        const isKeyLandmark = [
          1,
          2,
          5,
          4,
          6,
          19,
          20, // Nose
          33,
          7,
          163,
          144,
          145,
          153,
          154,
          155, // Left eye
          362,
          398,
          384,
          385,
          386,
          387,
          388,
          466, // Right eye
          61,
          84,
          17,
          314,
          405,
          320,
          307,
          375, // Mouth
          10,
          151,
          9,
          8,
          168,
          6,
          148,
          176,
          149,
          150, // Face contour
        ].includes(index);

        if (isKeyLandmark) {
          ctx.beginPath();
          ctx.arc(x, y, landmarkSize * 1.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });

      // Reset shadow
      ctx.shadowBlur = 0;
    },
    []
  );

  // Calculate face orientation and tilt
  const calculateFaceOrientation = useCallback((landmarks) => {
    // Get key points for orientation calculation
    const leftEye = landmarks[33]; // Left eye outer corner
    const rightEye = landmarks[362]; // Right eye outer corner
    const noseTip = landmarks[1]; // Nose tip
    const chinCenter = landmarks[18]; // Chin center

    // Calculate eye line angle (roll)
    const eyeLineAngle =
      Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) *
      (180 / Math.PI);

    // Calculate face tilt (pitch) - nose to chin line
    const faceLineAngle =
      Math.atan2(chinCenter.y - noseTip.y, chinCenter.x - noseTip.x) *
      (180 / Math.PI);

    // Calculate face center
    const faceCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y + noseTip.y + chinCenter.y) / 4,
    };

    return {
      roll: Math.abs(eyeLineAngle),
      pitch: Math.abs(faceLineAngle - 90), // Normalize to vertical
      center: faceCenter,
      isUpright: Math.abs(eyeLineAngle) < FRAME_CONFIG.rotationThreshold,
      isStraight: Math.abs(faceLineAngle - 90) < FRAME_CONFIG.tiltThreshold,
    };
  }, []);

  const drawCenterTarget = useCallback((ctx, centerX, centerY, isActive) => {
    const color = isActive ? "#00ff00" : "#ffffff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw crosshair
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY);
    ctx.lineTo(centerX + 12, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();
  }, []);

  // Draw orientation guides
  const drawOrientationGuides = useCallback(
    (ctx, orientation, videoWidth, videoHeight, centerX, centerY) => {
      ctx.save();

      // Draw roll indicator (head tilt left/right)
      if (!orientation.isUpright) {
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        // Draw ideal horizontal line
        ctx.beginPath();
        ctx.moveTo(centerX - 60, centerY - 80);
        ctx.lineTo(centerX + 60, centerY - 80);
        ctx.stroke();

        // Draw text instruction
        ctx.fillStyle = "#ff6b6b";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Luruskan kepala", centerX, centerY - 100);
      }

      // Draw pitch indicator (head tilt up/down)
      if (!orientation.isStraight) {
        ctx.strokeStyle = "#ffa726";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        // Draw ideal vertical line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60);
        ctx.lineTo(centerX, centerY + 60);
        ctx.stroke();

        // Draw text instruction
        ctx.fillStyle = "#ffa726";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Tegakkan wajah", centerX, centerY + 80);
      }

      ctx.setLineDash([]);
      ctx.restore();
    },
    []
  );

  // Face detection processing
  const processFaceDetection = useCallback(
    (results) => {
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;

      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Ensure canvas matches video dimensions
      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Mirror the canvas to match the video
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Always draw frame guide
      drawCornerFrame(ctx, centerX, centerY, FRAME_CONFIG);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        console.log(`Face detected with ${landmarks.length} landmarks`); // Debug log

        // Calculate face orientation
        const orientation = calculateFaceOrientation(landmarks);

        // Calculate face center position using calculated face center
        const faceCenterX = orientation.center.x * videoWidth;
        const faceCenterY = orientation.center.y * videoHeight;
        const dx = faceCenterX - centerX;
        const dy = faceCenterY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isCentered = distance < FRAME_CONFIG.centerThreshold;

        // Check if face is properly oriented
        const isProperlyOriented =
          orientation.isUpright && orientation.isStraight;
        const isPerfectPosition = isCentered && isProperlyOriented;

        // Draw landmarks with color based on orientation
        const landmarkColor = isPerfectPosition
          ? "#00ff00"
          : isCentered
          ? "#ffeb3b"
          : "#ff4444";
        drawFaceLandmarks(
          ctx,
          landmarks,
          videoWidth,
          videoHeight,
          isPerfectPosition
        );

        // Draw orientation guides if needed
        if (!isProperlyOriented) {
          drawOrientationGuides(
            ctx,
            orientation,
            videoWidth,
            videoHeight,
            centerX,
            centerY
          );
        }

        // Draw center target
        drawCenterTarget(ctx, centerX, centerY, isPerfectPosition);

        // Update status with detailed feedback
        setFaceDetected(true);
        setPerfectPosition(isPerfectPosition);

        let statusMessage = "";
        if (isPerfectPosition) {
          statusMessage = "✅ Posisi Sempurna";
        } else if (!isCentered && !isProperlyOriented) {
          statusMessage = "⚠️ Posisikan ke tengah & luruskan wajah";
        } else if (!isCentered) {
          statusMessage = "⚠️ Posisikan wajah ke tengah";
        } else if (!orientation.isUpright) {
          statusMessage = "⚠️ Luruskan kepala (jangan miring)";
        } else if (!orientation.isStraight) {
          statusMessage = "⚠️ Tegakkan wajah (jangan menunduk/mendongak)";
        }
        setStatusText(statusMessage);

        // Log orientation for debugging
        console.log(
          `Orientation - Roll: ${orientation.roll.toFixed(
            1
          )}°, Pitch: ${orientation.pitch.toFixed(
            1
          )}°, Centered: ${isCentered}, Perfect: ${isPerfectPosition}`
        );
      } else {
        setFaceDetected(false);
        setPerfectPosition(false);
        drawCenterTarget(ctx, centerX, centerY, false);
        setStatusText("❌ Wajah tidak terdeteksi");
      }

      ctx.restore();
    },
    [
      drawCornerFrame,
      drawFaceLandmarks,
      drawCenterTarget,
      calculateFaceOrientation,
      drawOrientationGuides,
    ]
  );

  // MediaPipe Face Mesh setup
  useEffect(() => {
    if (!captureMode || !videoRef.current) return;

    const video = videoRef.current;
    console.log("Setting up MediaPipe Face Mesh..."); // Debug log

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      ...FACE_DETECTION_CONFIG,
      selfieMode: true, // Important for front-facing camera
    });

    faceMesh.onResults((results) => {
      console.log("Face mesh results:", {
        multiFaceLandmarks: results.multiFaceLandmarks?.length || 0,
        landmarks: results.multiFaceLandmarks?.[0]?.length || 0,
      }); // Debug log
      processFaceDetection(results);
    });

    faceMeshRef.current = faceMesh;

    // Wait for video to be ready
    const setupCamera = () => {
      if (video.readyState >= 2) {
        // HAVE_CURRENT_DATA
        const camera = new Camera(video, {
          onFrame: async () => {
            if (faceMeshRef.current && video.readyState >= 2) {
              try {
                await faceMeshRef.current.send({ image: video });
              } catch (error) {
                console.error("Error sending frame to face mesh:", error);
              }
            }
          },
          width: 640,
          height: 480,
        });

        camera.start();
        cameraRef.current = camera;
        console.log("Camera started successfully"); // Debug log
      } else {
        // Wait for video to be ready
        setTimeout(setupCamera, 100);
      }
    };

    setupCamera();

    return () => {
      console.log("Cleaning up MediaPipe..."); // Debug log
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current = null;
      }
    };
  }, [captureMode, processFaceDetection]);

  // Cleanup effect for component unmount and page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      immediateStopCamera();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && captureMode) {
        immediateStopCamera();
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function for component unmount
    return () => {
      // Remove event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Immediate stop camera if still active
      if (captureMode) {
        immediateStopCamera();
      }
    };
  }, [captureMode, immediateStopCamera]);

  // Additional cleanup for route changes (if using React Router)
  useEffect(() => {
    return () => {
      // This runs when component unmounts (route change)
      immediateStopCamera();
      activeStreamRef.current = null;
    };
  }, [immediateStopCamera]);

  // Immediate cleanup on window unload (fastest possible)
  useEffect(() => {
    const handleUnload = () => {
      // Synchronous immediate cleanup using stored reference
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };

    window.addEventListener("unload", handleUnload);
    window.addEventListener("pagehide", handleUnload); // Additional for mobile
    return () => {
      window.removeEventListener("unload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dashboard Analisis Kulit Wajah
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ambil foto atau Upload foto langsung untuk mendapatkan analisis
              kulit wajah yang akurat menggunakan teknologi AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Image Upload/Capture */}
            <div className="space-y-6">
              {/* Upload/Capture Controls */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ambil atau Upload Foto
                </h2>

                {!captureMode ? (
                  <div className="space-y-6">
                    {/* Camera Button - Larger and more prominent */}
                    <button onClick={startCamera} className="w-full btn-camera">
                      <svg
                        className="w-6 h-6 mr-3"
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
                      Ambil Foto dengan Kamera
                    </button>

                    {/* Divider */}
                    <div className="text-center">
                      <span className="text-gray-500 text-sm">atau</span>
                    </div>

                    {/* Upload Button - Smaller and less prominent */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200 text-sm"
                      >
                        <svg
                          className="w-6 h-6 text-gray-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-gray-600">
                          Klik untuk upload foto
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Camera View */
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                      />
                      <canvas
                        ref={overlayCanvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      />

                      {/* Status indicator */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div
                          className={`px-4 py-2 rounded-lg text-white font-medium text-sm ${
                            perfectPosition
                              ? "bg-green-600"
                              : faceDetected
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                        >
                          {statusText}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={capturePhoto}
                        disabled={!perfectPosition}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                          perfectPosition
                            ? "bg-primary-500 text-white hover:bg-primary-600"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                        title={
                          perfectPosition
                            ? "Ambil foto"
                            : "Posisikan wajah dengan sempurna terlebih dahulu"
                        }
                      >
                        📸 Ambil Foto
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      >
                        ❌ Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Preview Foto
                  </h3>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-80 object-contain mx-auto block"
                      style={{ minHeight: "200px" }}
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 shadow-lg"
                      title="Hapus gambar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {!isAnalyzing && !analysisResult && (
                    <button
                      onClick={analyzeImage}
                      className="w-full mt-4 bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Menganalisis...</span>
                        </span>
                      ) : (
                        "🔍 Mulai Analisis"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel - Analysis Results */}
            <div className="space-y-6">
              {isAnalyzing && (
                <div className="card text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Menganalisis Kulit Wajah...
                  </h3>
                  <p className="text-gray-600">
                    AI sedang memproses foto Anda. Mohon tunggu sebentar.
                  </p>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-6">
                  {/* Overall Results */}
                  <div className="card">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Hasil Analisis Kulit
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-6 bg-derma-cream rounded-lg flex items-center justify-center">
                        <div className="text-4xl font-bold text-primary-600">
                          {analysisResult.skinType}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-derma-peach rounded-lg flex items-center justify-center">
                        <div className="text-4xl font-bold text-primary-700">
                          {analysisResult.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tips Perawatan
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={resetAnalysis}
                      className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Analisis Ulang
                    </button>
                    <button
                      onClick={saveAnalysisResult}
                      disabled={isSaving}
                      className="flex-1 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Menyimpan...</span>
                        </span>
                      ) : (
                        "Simpan Hasil"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!imagePreview && !isAnalyzing && !analysisResult && (
                <div className="card text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Foto
                  </h3>
                  <p className="text-gray-600">
                    Ambil atau Upload foto untuk memulai analisis kulit wajah
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Recommendations - Full Width Section */}
          {analysisResult && (
            <div className="mt-8">
              <ProductRecommendations skinType={analysisResult.skinType} />
            </div>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ProtectedRoute>
  );
};

export default Analisis;
