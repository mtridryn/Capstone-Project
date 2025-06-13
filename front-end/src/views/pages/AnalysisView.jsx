import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnalysisPresenter } from '../../presenters/index.js';
import useMVPPresenter from '../hooks/useMVPPresenter.js';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import ErrorMessage from '../shared/ErrorMessage.jsx';
import EmptyState from '../shared/EmptyState.jsx';

/**
 * AnalysisView - Skin analysis page menggunakan MVP pattern
 * Pure UI component yang delegate semua logic ke AnalysisPresenter
 */
const AnalysisView = () => {
  // Local UI state
  const [imagePreview, setImagePreview] = useState(null);
  const [captureMode, setCaptureMode] = useState(false);
  const [statusText, setStatusText] = useState("Siap untuk analisis kulit");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // MVP Presenter integration
  const { 
    presenter, 
    loading, 
    error, 
    clearError,
    presenterState 
  } = useMVPPresenter(AnalysisPresenter, {
    viewMethods: {
      // Image selection callback
      onImageSelected: (imageFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(imageFile);
        setStatusText("Gambar dipilih, siap untuk analisis");
      },

      // Analysis callbacks
      onAnalysisComplete: (result) => {
        setStatusText(`Analisis selesai: ${result.skinType} (${result.confidence}%)`);
        setUploadProgress(100);
      },

      onAnalysisRestart: () => {
        setImagePreview(null);
        setUploadProgress(0);
        setStatusText("Siap untuk analisis kulit");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },

      // Progress callback
      updateProgress: (progress) => {
        setUploadProgress(progress);
      },

      // Recommendations callback
      showRecommendations: (products) => {
        console.log('Product recommendations updated:', products.length);
      }
    }
  });

  // Get data from presenter state
  const selectedImage = presenterState.selectedImage;
  const analysisResult = presenterState.analysisResult;
  const recommendedProducts = presenterState.recommendedProducts || [];
  const currentStep = presenterState.currentStep || 'upload';
  const isAnalyzing = presenterState.isAnalyzing || false;

  // Event handlers
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      presenter?.handleImageSelection(file);
    }
  }, [presenter]);

  const handleStartAnalysis = useCallback(() => {
    if (presenter && selectedImage) {
      presenter.startAnalysis();
    }
  }, [presenter, selectedImage]);

  const handleRestartAnalysis = useCallback(() => {
    if (presenter) {
      presenter.restartAnalysis();
    }
  }, [presenter]);

  const handleCameraCapture = useCallback(async () => {
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
        setStatusText("Kamera aktif - Posisikan wajah Anda");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatusText("Error: Tidak dapat mengakses kamera");
      setCaptureMode(false);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  }, []);

  const handleCapturePhoto = useCallback(() => {
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
          const file = new File([blob], "captured-photo.jpg", {
            type: "image/jpeg",
          });
          
          // Stop camera
          if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
          }
          setCaptureMode(false);
          
          // Handle captured image
          presenter?.handleImageSelection(file);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [presenter]);

  const handleStopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCaptureMode(false);
    setStatusText("Kamera dimatikan");
  }, []);

  // Navigate to products with skin type filter
  const navigateToProducts = useCallback((skinType) => {
    window.location.hash = `#/produk?skinType=${skinType}`;
  }, []);

  // Render upload section
  const renderUploadSection = () => (
    <div className="card text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Analisis Jenis Kulit
      </h2>
      <p className="text-gray-600 mb-8">
        Upload foto wajah Anda atau gunakan kamera untuk analisis jenis kulit yang akurat
      </p>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50"
          >
            <div className="text-4xl mb-2">📁</div>
            <div className="font-medium text-gray-900">Upload Foto</div>
            <div className="text-sm text-gray-500">JPG, PNG, atau WebP</div>
          </button>
        </div>

        {/* Camera Capture */}
        <div>
          <button
            onClick={handleCameraCapture}
            disabled={loading || captureMode}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50"
          >
            <div className="text-4xl mb-2">📷</div>
            <div className="font-medium text-gray-900">Gunakan Kamera</div>
            <div className="text-sm text-gray-500">Ambil foto langsung</div>
          </button>
        </div>
      </div>

      {/* Status Text */}
      <p className="text-sm text-gray-600">{statusText}</p>
    </div>
  );

  // Render camera section
  const renderCameraSection = () => (
    <div className="card">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ambil Foto Wajah
        </h3>
        <p className="text-gray-600">{statusText}</p>
      </div>

      {/* Camera View */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover transform scale-x-[-1]"
        />
        
        {/* Camera Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-80 border-2 border-white rounded-lg opacity-50"></div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleCapturePhoto}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          📸 Ambil Foto
        </button>
        <button
          onClick={handleStopCamera}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ❌ Batal
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  // Render image preview section
  const renderImagePreview = () => (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
        Preview Gambar
      </h3>
      
      <div className="text-center mb-6">
        <img
          src={imagePreview}
          alt="Preview"
          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
        />
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Menganalisis...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {!isAnalyzing && currentStep === 'upload' && (
          <button
            onClick={handleStartAnalysis}
            disabled={!selectedImage || loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            🔍 Mulai Analisis
          </button>
        )}
        
        <button
          onClick={handleRestartAnalysis}
          disabled={loading}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🔄 Pilih Ulang
        </button>
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">{statusText}</p>
    </div>
  );

  // Render analysis result
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Result Card */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Hasil Analisis Kulit
          </h3>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
              <span className="text-3xl">
                {analysisResult.skinType === 'Oily' ? '💧' : 
                 analysisResult.skinType === 'Dry' ? '🏜️' : 
                 analysisResult.skinType === 'Sensitive' ? '🌸' : 
                 analysisResult.skinType === 'Combination' ? '🌗' : '✨'}
              </span>
            </div>
            
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Jenis Kulit: {analysisResult.skinType}
            </h4>
            
            <div className="text-lg text-gray-600 mb-4">
              Akurasi: {analysisResult.confidence}%
            </div>

            {/* Confidence Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${analysisResult.confidence}%` }}
              ></div>
            </div>
          </div>

          {/* Recommendations */}
          {analysisResult.recommendations && (
            <div className="mb-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-3">
                Rekomendasi Perawatan:
              </h5>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigateToProducts(analysisResult.skinType)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🛍️ Lihat Produk Rekomendasi
            </button>
            
            <button
              onClick={handleRestartAnalysis}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Analisis Ulang
            </button>
          </div>
        </div>

        {/* Product Recommendations */}
        {recommendedProducts.length > 0 && (
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Produk Rekomendasi untuk Kulit {analysisResult.skinType}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedProducts.slice(0, 6).map((product, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img
                    src={product.picture_src || product.picture || 
                      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop"}
                    alt={product.product_name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h5 className="font-medium text-gray-900 mb-1 text-sm">
                    {product.product_name}
                  </h5>
                  <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                  <p className="text-sm font-semibold text-orange-600">
                    Rp {product.price?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>
              ))}
            </div>

            {recommendedProducts.length > 6 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigateToProducts(analysisResult.skinType)}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Lihat {recommendedProducts.length - 6} produk lainnya →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analisis Jenis Kulit
          </h1>
          <p className="text-gray-600">
            Dapatkan rekomendasi produk skincare yang tepat untuk jenis kulit Anda
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage 
            message={error} 
            type="error"
            onDismiss={clearError}
            onRetry={() => presenter?.startAnalysis()}
            className="mb-6"
          />
        )}

        {/* Loading Overlay */}
        {loading && currentStep === 'analyzing' && (
          <LoadingSpinner 
            overlay={true}
            size="large"
            message="Menganalisis jenis kulit Anda..."
          />
        )}

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {captureMode ? renderCameraSection() :
           currentStep === 'result' ? renderAnalysisResult() :
           imagePreview ? renderImagePreview() :
           renderUploadSection()}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
