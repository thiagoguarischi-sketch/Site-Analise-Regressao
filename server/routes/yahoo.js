'use strict';

const express  = require('express');
const router   = express.Router();
const { requireAuth } = require('../middleware/auth');
const provider = require('../providers/stock');

const PERIOD_DAYS    = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730, '5y': 1825 };
const VALID_INTERVALS = ['1d', '1wk', '1mo'];

function _toUnix(dateStr) {
  return Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / 1000);
}
function _yesterday() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// GET /api/yahoo/search?q=AAPL
router.get('/yahoo/search', requireAuth, async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) return res.json({ quotes: [] });
  try {
    res.json(await provider.search(q.trim()));
  } catch (e) {
    console.error('[stock/search]', e.message);
    res.status(502).json({
      error: e.name === 'AbortError'
        ? 'O provedor de dados demorou demais. Tente novamente.'
        : 'Erro ao buscar ativo. Tente novamente em instantes.',
    });
  }
});

// GET /api/yahoo/chart?symbol=AAPL&from=2024-01-01&to=2024-12-31&interval=1d
router.get('/yahoo/chart', requireAuth, async (req, res) => {
  const { symbol, from, to, period = '1y' } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Parâmetro "symbol" obrigatório.' });

  // interval validado por allowlist — evita injeção de parâmetros na URL do provedor.
  const interval = VALID_INTERVALS.includes(req.query.interval) ? req.query.interval : '1d';

  const maxTo = _yesterday();
  let period1, period2;

  if (from && to) {
    const clampedTo = to > maxTo ? maxTo : to;
    if (from >= clampedTo) return res.status(400).json({ error: 'Data inicial deve ser anterior à data final.' });
    period1 = _toUnix(from);
    period2 = _toUnix(clampedTo) + 86399;
  } else {
    period2 = Math.floor(Date.now() / 1000);
    period1 = period2 - (PERIOD_DAYS[period] || 365) * 86400;
  }

  try {
    const data = await provider.chart(symbol, period1, period2, interval);
    if (!data) return res.status(404).json({ error: 'Ativo não encontrado ou sem dados para o período.' });
    res.json(data);
  } catch (e) {
    console.error('[stock/chart]', e.message);
    res.status(502).json({
      error: e.name === 'AbortError'
        ? 'O provedor de dados demorou demais. Tente novamente.'
        : 'Erro ao buscar dados do ativo. Tente novamente em instantes.',
    });
  }
});

module.exports = router;
