const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAnalyses, saveAnalysis, deleteAnalysis } = require('../services/analysesService');

const VALID_TIPOS = ['simples', 'multipla', 'logistica', 'polinomial', 'serie','quantilica','regularizada'];

// GET /api/analyses
router.get('/analyses', requireAuth, async (req, res) => {
  try {
    const data = await getAnalyses(req.userId, req.accessToken);
    res.json({ analyses: data });
  } catch (err) {
    console.error('[GET analyses] ERRO COMPLETO:', err);
    res.status(500).json({ error: 'Erro ao buscar análises.' });
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
    }, req.accessToken);
    res.status(201).json({ id: result.id, message: 'Análise salva.' });
  } catch (err) {
    console.error('[POST save-analysis] ERRO COMPLETO:', err);
    res.status(500).json({ error: 'Erro ao salvar.' });
  }
});

// DELETE /api/analysis/:id
router.delete('/analysis/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    await deleteAnalysis(req.userId, id, req.accessToken);
    res.json({ message: 'Análise excluída.' });
  } catch (err) {
    const status = err.status || 500;
    console.error('[DELETE analysis] ERRO COMPLETO:', err);
    // Só expõe a mensagem em erros esperados (4xx); 5xx retorna texto genérico.
    res.status(status).json({ error: status >= 500 ? 'Erro ao excluir análise.' : (err.message || 'Erro ao excluir.') });
  }
});

module.exports = router;