import BasePresenter from '../core/BasePresenter.js';
import { ArticleModel } from '../models/index.js';

/**
 * ArticlePresenter - Mengelola artikel beauty/skincare dan content management
 * Handles: Article fetching, search, categories, reading
 */
class ArticlePresenter extends BasePresenter {
  constructor({ view, articleModel = null }) {
    super({ 
      view, 
      models: { 
        article: articleModel || new ArticleModel()
      } 
    });
    
    this.articleModel = this.getModel('article');
    
    // Initialize state
    this.setState({
      articles: [],
      categories: ['All', 'Tips Kecantikan', 'Skincare Routine', 'Makeup Tutorial', 'K-Beauty', 'Anti-Aging'],
      selectedCategory: 'All',
      searchQuery: '',
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12
      },
      loading: false,
      error: null,
      isUsingFallback: false
    });
    
    this.log('ArticlePresenter initialized');
  }

  /**
   * Initialize presenter
   */
  async onInit() {
    // Validate required view methods
    this.validateView([
      'showLoading', 'hideLoading', 'showError', 'clearError'
    ]);

    // Load initial articles
    await this.loadArticles();
  }

  /**
   * Load articles with current filters
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   */
  async loadArticles(page = 1, pageSize = 12) {
    try {
      this.log('Loading articles', { page, pageSize });
      
      this.showLoading('Loading articles...');
      this.clearError();

      const { selectedCategory, searchQuery } = this.getState();
      
      // Build search query
      let query = searchQuery || 'beauty skincare makeup';
      if (selectedCategory !== 'All') {
        query += ` ${selectedCategory}`;
      }

      // Fetch articles
      const result = await this.articleModel.fetchArticles(query, page, pageSize);

      if (result.success) {
        const articles = result.articles || [];
        
        this.setState({
          articles,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(result.totalResults / pageSize),
            totalItems: result.totalResults,
            itemsPerPage: pageSize
          },
          isUsingFallback: result.isUsingFallback || false
        });

        // Notify view
        if (this._view.showArticles) {
          this._view.showArticles(articles);
        }

        if (this._view.updatePagination) {
          this._view.updatePagination(this.getState().pagination);
        }

        // Show fallback notice if using fallback data
        if (result.isUsingFallback && this._view.showFallbackNotice) {
          this._view.showFallbackNotice('Showing sample articles due to API limitations');
        }

        this.log('Articles loaded', { 
          count: articles.length,
          isUsingFallback: result.isUsingFallback 
        });

      } else {
        throw new Error('Failed to load articles');
      }

    } catch (error) {
      this.log('Error loading articles', error);
      this.handleError(error, {
        fallbackAction: () => this.loadFallbackArticles()
      });
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handle category selection
   * @param {string} category - Selected category
   */
  async handleCategoryChange(category) {
    try {
      this.log('Handling category change', { category });
      
      this.setState({ 
        selectedCategory: category,
        pagination: { ...this.getState().pagination, currentPage: 1 }
      });

      // Notify view
      if (this._view.updateSelectedCategory) {
        this._view.updateSelectedCategory(category);
      }

      // Reload articles with new category
      await this.loadArticles(1);

    } catch (error) {
      this.log('Error handling category change', error);
      this.handleError(error);
    }
  }

  /**
   * Handle search query
   * @param {string} query - Search query
   */
  async handleSearch(query) {
    try {
      this.log('Handling search', { query });
      
      this.setState({ 
        searchQuery: query,
        pagination: { ...this.getState().pagination, currentPage: 1 }
      });

      // Notify view
      if (this._view.updateSearchQuery) {
        this._view.updateSearchQuery(query);
      }

      // Search articles
      await this.searchArticles(query);

    } catch (error) {
      this.log('Error handling search', error);
      this.handleError(error);
    }
  }

  /**
   * Search articles by query
   * @param {string} query - Search query
   * @param {number} page - Page number
   */
  async searchArticles(query, page = 1) {
    try {
      this.log('Searching articles', { query, page });
      
      this.showLoading('Searching articles...');

      const pageSize = this.getState().pagination.itemsPerPage;
      const result = await this.articleModel.searchArticles(query, page, pageSize);

      if (result.success) {
        const articles = result.articles || [];
        
        this.setState({
          articles,
          pagination: {
            ...this.getState().pagination,
            currentPage: page,
            totalPages: Math.ceil(result.totalResults / pageSize),
            totalItems: result.totalResults
          }
        });

        // Notify view
        if (this._view.showArticles) {
          this._view.showArticles(articles);
        }

        this.log('Search completed', { 
          query,
          results: articles.length 
        });

      } else {
        throw new Error('Search failed');
      }

    } catch (error) {
      this.log('Search error', error);
      this.handleError(error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handle pagination
   * @param {number} page - Page number to load
   */
  async handlePageChange(page) {
    try {
      this.log('Handling page change', { page });
      
      const { searchQuery } = this.getState();
      
      if (searchQuery) {
        await this.searchArticles(searchQuery, page);
      } else {
        await this.loadArticles(page);
      }

    } catch (error) {
      this.log('Error handling page change', error);
      this.handleError(error);
    }
  }

  /**
   * Get article by ID
   * @param {string|number} articleId - Article ID
   * @returns {Object|null} Article or null
   */
  getArticleById(articleId) {
    try {
      this.log('Getting article by ID', { articleId });
      
      // First check current articles
      const currentArticles = this.getState().articles;
      let article = currentArticles.find(a => a.id == articleId);
      
      if (!article) {
        // Check model cache/fallback data
        article = this.articleModel.getArticleById(articleId);
      }

      if (article) {
        this.log('Article found', { articleId });
        return article;
      } else {
        this.log('Article not found', { articleId });
        return null;
      }

    } catch (error) {
      this.log('Error getting article', error);
      return null;
    }
  }

  /**
   * Load skincare-specific articles
   */
  async loadSkincareArticles() {
    try {
      this.log('Loading skincare articles');
      
      this.showLoading('Loading skincare articles...');

      const result = await this.articleModel.fetchSkincareNews();

      if (result.success) {
        const articles = result.articles || [];
        
        this.setState({ articles });

        if (this._view.showArticles) {
          this._view.showArticles(articles);
        }

        this.log('Skincare articles loaded', { count: articles.length });
      }

    } catch (error) {
      this.log('Error loading skincare articles', error);
      this.handleError(error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Load fallback articles when APIs fail
   */
  loadFallbackArticles() {
    try {
      this.log('Loading fallback articles');
      
      const fallbackArticles = this.articleModel.getEnhancedFallbackArticles();
      
      this.setState({ 
        articles: fallbackArticles,
        isUsingFallback: true,
        pagination: {
          ...this.getState().pagination,
          totalItems: fallbackArticles.length,
          totalPages: Math.ceil(fallbackArticles.length / this.getState().pagination.itemsPerPage)
        }
      });

      if (this._view.showArticles) {
        this._view.showArticles(fallbackArticles);
      }

      if (this._view.showFallbackNotice) {
        this._view.showFallbackNotice('Showing sample articles due to API limitations');
      }

      this.log('Fallback articles loaded', { count: fallbackArticles.length });

    } catch (error) {
      this.log('Error loading fallback articles', error);
      this.showError('Failed to load articles');
    }
  }

  /**
   * Clear search and filters
   */
  async clearSearch() {
    try {
      this.log('Clearing search');
      
      this.setState({ 
        searchQuery: '',
        selectedCategory: 'All',
        pagination: { ...this.getState().pagination, currentPage: 1 }
      });

      // Notify view
      if (this._view.updateSearchQuery) {
        this._view.updateSearchQuery('');
      }
      if (this._view.updateSelectedCategory) {
        this._view.updateSelectedCategory('All');
      }

      // Reload articles
      await this.loadArticles();

    } catch (error) {
      this.log('Error clearing search', error);
      this.handleError(error);
    }
  }

  /**
   * Refresh articles
   */
  async refreshArticles() {
    try {
      this.log('Refreshing articles');
      
      // Clear cache to force fresh data
      this.articleModel.clearCache();
      
      // Reload articles
      await this.loadArticles(this.getState().pagination.currentPage);

    } catch (error) {
      this.log('Error refreshing articles', error);
      this.handleError(error);
    }
  }

  /**
   * Get current articles
   * @returns {Array} Current articles
   */
  getArticles() {
    return this.getState().articles;
  }

  /**
   * Get available categories
   * @returns {Array} Categories
   */
  getCategories() {
    return this.getState().categories;
  }

  /**
   * Get current pagination info
   * @returns {Object} Pagination info
   */
  getPagination() {
    return this.getState().pagination;
  }

  /**
   * Check if using fallback data
   * @returns {boolean} Is using fallback
   */
  isUsingFallback() {
    return this.getState().isUsingFallback;
  }

  /**
   * Clean up presenter resources
   */
  destroy() {
    this.log('Destroying ArticlePresenter');
    super.destroy();
  }
}

export default ArticlePresenter;
