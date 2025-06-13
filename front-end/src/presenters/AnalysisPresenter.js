import BasePresenter from '../core/BasePresenter.js';
import { AnalysisModel, UserModel, ProductModel } from '../models/index.js';

/**
 * AnalysisPresenter - Mengelola skin analysis workflow dan ML predictions
 * Handles: Image upload, analysis, history, recommendations
 */
class AnalysisPresenter extends BasePresenter {
  constructor({ view, analysisModel = null, userModel = null, productModel = null }) {
    super({ 
      view, 
      models: { 
        analysis: analysisModel || new AnalysisModel(),
        user: userModel || new UserModel(),
        product: productModel || new ProductModel()
      } 
    });
    
    this.analysisModel = this.getModel('analysis');
    this.userModel = this.getModel('user');
    this.productModel = this.getModel('product');
    
    // Initialize state
    this.setState({
      selectedImage: null,
      analysisResult: null,
      recommendedProducts: [],
      history: [],
      isAnalyzing: false,
      uploadProgress: 0,
      currentStep: 'upload', // upload, analyzing, result
      error: null
    });
    
    this.log('AnalysisPresenter initialized');
  }

  /**
   * Initialize presenter
   */
  async onInit() {
    // Validate required view methods
    this.validateView([
      'showLoading', 'hideLoading', 'showError', 'clearError'
    ]);

    // Check authentication
    if (!this.userModel.isAuthenticated()) {
      this.showError('Authentication required for skin analysis');
      return;
    }

    // Load analysis history
    await this.loadHistory();
  }

  /**
   * Handle image selection for analysis
   * @param {File} imageFile - Selected image file
   * @returns {Promise<boolean>} Success status
   */
  async handleImageSelection(imageFile) {
    try {
      this.log('Handling image selection', { 
        fileName: imageFile.name, 
        fileSize: imageFile.size 
      });
      
      this.clearError();

      // Validate image file
      const validation = this.analysisModel.validateImageFile(imageFile);
      if (!validation.isValid) {
        this.showError(validation.error);
        return false;
      }

      // Update state
      this.setState({ 
        selectedImage: imageFile,
        currentStep: 'upload',
        analysisResult: null,
        recommendedProducts: []
      });

      // Notify view
      if (this._view.onImageSelected) {
        this._view.onImageSelected(imageFile);
      }

      this.log('Image selected successfully');
      return true;

    } catch (error) {
      this.log('Error handling image selection', error);
      this.showError(error.message);
      return false;
    }
  }

  /**
   * Start skin analysis process
   * @returns {Promise<Object>} Analysis result
   */
  async startAnalysis() {
    try {
      const selectedImage = this.getState().selectedImage;
      
      if (!selectedImage) {
        throw new Error('Please select an image first');
      }

      this.log('Starting skin analysis');
      
      this.setState({ 
        isAnalyzing: true, 
        currentStep: 'analyzing',
        uploadProgress: 0
      });

      this.showLoading('Analyzing your skin...');
      this.clearError();

      // Simulate upload progress
      this.simulateUploadProgress();

      // Call analysis model
      const result = await this.analysisModel.predictSkinType(selectedImage);

      if (result.success) {
        this.log('Analysis successful', result.data);
        
        // Update state with result
        this.setState({ 
          analysisResult: result.data,
          currentStep: 'result',
          isAnalyzing: false
        });

        // Get product recommendations
        await this.getProductRecommendations(result.data.skinType);

        // Notify view
        if (this._view.onAnalysisComplete) {
          this._view.onAnalysisComplete(result.data);
        }

        // Emit analysis complete event
        this.emit('analysis:complete', result.data);

        return result;
      } else {
        throw new Error(result.message || 'Analysis failed');
      }

    } catch (error) {
      this.log('Analysis error', error);
      
      this.setState({ 
        isAnalyzing: false,
        currentStep: 'upload'
      });

      this.handleError(error, {
        fallbackAction: () => this.loadCachedAnalyses()
      });

      return {
        success: false,
        message: error.message
      };
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Get product recommendations based on skin type
   * @param {string} skinType - Detected skin type
   */
  async getProductRecommendations(skinType) {
    try {
      this.log('Getting product recommendations', { skinType });
      
      // Reset previous recommendations
      this.setState({ recommendedProducts: [] });

      const products = await this.productModel.getRecommendedProducts(skinType);
      
      this.setState({ recommendedProducts: products });

      // Notify view
      if (this._view.showRecommendations) {
        this._view.showRecommendations(products);
      }

      this.log('Product recommendations loaded', { 
        count: products.length,
        skinType 
      });

    } catch (error) {
      this.log('Error getting product recommendations', error);
      // Don't show error to user for recommendations failure
      this.setState({ recommendedProducts: [] });
    }
  }

  /**
   * Load analysis history
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  async loadHistory(page = 1, limit = 10) {
    try {
      this.log('Loading analysis history', { page, limit });
      
      const result = await this.analysisModel.getHistory(page, limit);

      if (result.success) {
        const history = result.data.history || [];
        
        this.setState({ history });

        // Notify view
        if (this._view.showHistory) {
          this._view.showHistory(history);
        }

        this.log('History loaded', { count: history.length });
      } else {
        this.log('Failed to load history', result.message);
      }

    } catch (error) {
      this.log('Error loading history', error);
      this.handleError(error, {
        showToUser: false,
        fallbackAction: () => this.loadCachedAnalyses()
      });
    }
  }

  /**
   * Delete analysis from history
   * @param {string} analysisId - Analysis ID to delete
   */
  async deleteAnalysis(analysisId) {
    try {
      this.log('Deleting analysis', { analysisId });
      
      this.showLoading('Deleting analysis...');

      const result = await this.analysisModel.deleteAnalysis(analysisId);

      if (result.success) {
        // Remove from local state
        const currentHistory = this.getState().history;
        const updatedHistory = currentHistory.filter(item => item.id !== analysisId);
        
        this.setState({ history: updatedHistory });

        // Notify view
        if (this._view.onAnalysisDeleted) {
          this._view.onAnalysisDeleted(analysisId);
        }

        this.log('Analysis deleted successfully');
        
        // Reload history to ensure consistency
        await this.loadHistory();

      } else {
        this.showError(result.message);
      }

    } catch (error) {
      this.log('Error deleting analysis', error);
      this.handleError(error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Get analysis details by ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<Object|null>} Analysis details
   */
  async getAnalysisDetails(analysisId) {
    try {
      this.log('Getting analysis details', { analysisId });
      
      const result = await this.analysisModel.getAnalysisById(analysisId);

      if (result.success) {
        this.log('Analysis details retrieved');
        return result.data;
      } else {
        this.log('Failed to get analysis details', result.message);
        return null;
      }

    } catch (error) {
      this.log('Error getting analysis details', error);
      return null;
    }
  }

  /**
   * Restart analysis process
   */
  restartAnalysis() {
    this.log('Restarting analysis');
    
    this.setState({
      selectedImage: null,
      analysisResult: null,
      recommendedProducts: [],
      currentStep: 'upload',
      isAnalyzing: false,
      uploadProgress: 0
    });

    this.clearError();

    // Notify view
    if (this._view.onAnalysisRestart) {
      this._view.onAnalysisRestart();
    }
  }

  /**
   * Simulate upload progress for better UX
   */
  simulateUploadProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        progress = 90;
        clearInterval(interval);
      }
      
      this.setState({ uploadProgress: Math.round(progress) });
      
      if (this._view.updateProgress) {
        this._view.updateProgress(Math.round(progress));
      }
    }, 200);

    // Complete progress when analysis is done
    setTimeout(() => {
      clearInterval(interval);
      this.setState({ uploadProgress: 100 });
      if (this._view.updateProgress) {
        this._view.updateProgress(100);
      }
    }, 3000);
  }

  /**
   * Load cached analyses as fallback
   */
  loadCachedAnalyses() {
    try {
      this.log('Loading cached analyses');
      
      const cached = this.analysisModel.getCachedAnalyses();
      
      if (cached.length > 0) {
        this.setState({ history: cached });
        
        if (this._view.showHistory) {
          this._view.showHistory(cached);
        }
        
        this.log('Cached analyses loaded', { count: cached.length });
        return true;
      }
      
      return false;

    } catch (error) {
      this.log('Error loading cached analyses', error);
      return false;
    }
  }

  /**
   * Get current analysis result
   * @returns {Object|null} Current analysis result
   */
  getCurrentResult() {
    return this.getState().analysisResult;
  }

  /**
   * Get recommended products
   * @returns {Array} Recommended products
   */
  getRecommendedProducts() {
    return this.getState().recommendedProducts;
  }

  /**
   * Get analysis history
   * @returns {Array} Analysis history
   */
  getHistory() {
    return this.getState().history;
  }

  /**
   * Check if analysis is in progress
   * @returns {boolean} Is analyzing
   */
  isAnalyzing() {
    return this.getState().isAnalyzing;
  }

  /**
   * Get current step in analysis process
   * @returns {string} Current step
   */
  getCurrentStep() {
    return this.getState().currentStep;
  }

  /**
   * Clean up presenter resources
   */
  destroy() {
    this.log('Destroying AnalysisPresenter');
    super.destroy();
  }
}

export default AnalysisPresenter;
