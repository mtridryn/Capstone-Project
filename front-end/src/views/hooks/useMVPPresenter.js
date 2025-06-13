import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * useMVPPresenter - Custom hook untuk mengintegrasikan MVP Presenter dengan React
 * Menyediakan interface yang clean antara React components dan MVP presenters
 */
const useMVPPresenter = (PresenterClass, presenterOptions = {}) => {
  // State untuk UI
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  });

  // View interface methods yang akan diberikan ke presenter
  const viewInterface = useMemo(() => ({
    // Loading methods
    showLoading: (message = 'Loading...') => {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        loadingMessage: message,
        error: null 
      }));
    },

    hideLoading: () => {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        loadingMessage: null 
      }));
    },

    // Error methods
    showError: (error) => {
      const errorMessage = typeof error === 'string' ? error : error.message;
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
    },

    clearError: () => {
      setState(prev => ({ 
        ...prev, 
        error: null 
      }));
    },

    // Data methods
    updateData: (data) => {
      setState(prev => ({ 
        ...prev, 
        data 
      }));
    },

    // State change callback
    onStateChange: (newState, oldState) => {
      console.log('Presenter state changed:', { newState, oldState });
    },

    // Custom view methods dapat ditambahkan melalui presenterOptions.viewMethods
    ...presenterOptions.viewMethods
  }), [presenterOptions.viewMethods]);

  // Create presenter instance
  const presenter = useMemo(() => {
    return new PresenterClass({
      view: viewInterface,
      ...presenterOptions
    });
  }, [PresenterClass, viewInterface, presenterOptions]);

  // Initialize presenter
  useEffect(() => {
    let mounted = true;

    const initPresenter = async () => {
      try {
        if (mounted) {
          await presenter.init();
        }
      } catch (error) {
        console.error('Presenter initialization failed:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            error: error.message,
            loading: false 
          }));
        }
      }
    };

    initPresenter();

    // Cleanup
    return () => {
      mounted = false;
      if (presenter && typeof presenter.destroy === 'function') {
        presenter.destroy();
      }
    };
  }, [presenter]);

  // Helper methods
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const retry = useCallback(async (action) => {
    if (typeof action === 'function') {
      try {
        setState(prev => ({ ...prev, error: null, loading: true }));
        await action();
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          loading: false 
        }));
      }
    }
  }, []);

  // Return presenter instance dan state
  return {
    presenter,
    state,
    loading: state.loading,
    error: state.error,
    data: state.data,
    loadingMessage: state.loadingMessage,
    
    // Helper methods
    clearError,
    retry,
    
    // Direct access to presenter state
    presenterState: presenter.getState ? presenter.getState() : {},
    isInitialized: presenter.isInitialized ? presenter.isInitialized() : false
  };
};

export default useMVPPresenter;
