const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAnalyses, saveAnalysis, deleteAnalysis } = require('../services/analysesService');

const VALID_TIPOS = ['simples', 'multipla', 'logistica', 'polinomial', 'serie'];

// GET /api/analyses
router.get('/analyses', requireAuth, async (req, res) => {
  try {
    const data = await getAnalyses(req.userId);
    res.json({ analyses: data });
  } catch (err) {
    console.error('[GET analyses] ERRO COMPLETO:', err);
    res.status(500).json({ error: 'Erro ao buscar análises.', detail: err.message });
  }
});

// POST /api/save-analysis
router.post('/save-analysis', requireAuth, async (req, res) => {
  const { nome, tipo, label_x, label_y, dados } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().length < 1) {
    return res.status(400).json({ error: 'Campo "nome" obrigatório.' });
  }
  if (!tipo || !VALID_TIPOS.includes(tipo)) {
    return res.status(400).json({ error: `"tipo" deve ser um de: ${VALID_TIPOS.join(', ')}` });
  }
  if (!dados || typeof dados !== 'object') {
    return res.status(400).json({ error: 'Campo "dados" obrigatório (objeto).' });
  }

  try {
    const result = await saveAnalysis(req.userId, {
      nome: nome.trim().slice(0, 120),
      tipo,
      label_x: label_x?.toString().slice(0, 60) || null,
      label_y: label_y?.toString().slice(0, 60) || null,
      dados,
    });
    res.status(201).json({ id: result.id, message: 'Análise salva.' });
  } catch (err) {
    console.error('[POST save-analysis] ERRO COMPLETO:', err);
    res.status(500).json({ error: 'Erro ao salvar.', detail: err.message });
  }
});

// DELETE /api/analysis/:id
router.delete('/analysis/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    await deleteAnalysis(req.userId, id);
    res.json({ message: 'Análise excluída.' });
  } catch (err) {
    const status = err.status || 500;
    console.error('[DELETE analysis] ERRO COMPLETO:', err);
    res.status(status).json({ error: err.message || 'Erro ao excluir.', detail: err.message });
  }
});

// GET /api/debug — diagnostico sem auth (remover em producao)
router.get('/debug', async (req, res) => {
  const { supabase } = require('../middleware/auth');
  const info = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'NAO DEFINIDA',
    SERVICE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVICE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20) + '...'
      : 'vazia',
  };

  try {
    const { error } = await supabase.from('analises').select('id').limit(1);
    info.supabase_connect = error ? ('ERRO: ' + error.message) : 'OK';
  } catch (e) {
    info.supabase_connect = 'EXCECAO: ' + e.message;
  }

  res.json(info);
});

module.exports = router;