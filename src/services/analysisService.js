// Camada HTTP-fina para o BFF — listar, salvar e excluir análises.

import { apiRequest } from './supabaseService.js';

export async function saveAnalysisRequest(payload) {
  return apiRequest('/save-analysis', 'POST', payload);
}

export async function fetchAnalyses() {
  const { analyses } = await apiRequest('/analyses');
  return analyses || [];
}

export async function deleteAnalysisRequest(id) {
  return apiRequest(`/analysis/${id}`, 'DELETE');
}

export async function deleteAccountRequest() {
  return apiRequest('/account', 'DELETE');
}
