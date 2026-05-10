// Thin client: delegates all statistical computation to the backend.
// Keeps proprietary algorithms server-side and out of browser DevTools.

import { apiRequest } from './supabaseService.js';

/**
 * Run a statistical analysis on the server.
 * @param {string} tipo   - Analysis type ('linear', 'multiple', 'logistic', 'polynomial',
 *                          'quantile', 'ridge', 'lasso', 'regularized',
 *                          'serie', 'arima', 'garch', 'var')
 * @param {object} params - Model hyperparameters (degree, lambda, p, d, q, etc.)
 * @param {object} dados  - Input data arrays (xs, ys, Xs, Y, values, matrix, etc.)
 * @returns {Promise<object>} The result object (same shape as the former local compute functions)
 */
export async function analyze(tipo, params, dados) {
  const json = await apiRequest('/analyze', 'POST', { tipo, params, dados });
  return json.result;
}
