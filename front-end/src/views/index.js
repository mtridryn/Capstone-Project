/**
 * Views Index - Export semua view components dan utilities untuk MVP pattern
 */

// Pages
export * from './pages/index.js';

// Shared Components
export * from './shared/index.js';

// Hooks
export { default as useMVPPresenter } from './hooks/useMVPPresenter.js';

// Default exports
import * as Pages from './pages/index.js';
import * as Shared from './shared/index.js';
import useMVPPresenter from './hooks/useMVPPresenter.js';

export default {
  Pages,
  Shared,
  Hooks: {
    useMVPPresenter
  }
};
