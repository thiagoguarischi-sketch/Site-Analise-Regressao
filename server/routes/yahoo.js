const express = require('express');
const router = express.Router();

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const PERIOD_DAYS = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730, '5y': 1825 };

// GET /api/yahoo/search?q=AAPL
router.get('/yahoo/search', async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) return res.json({ quotes: [] });

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
    const r = await fetch(url, { headers: YF_HEADERS });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const quotes = (data.finance?.result?.[0]?.quotes || []).filter(
      q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'INDEX' || q.quoteType === 'CURRENCY' || q.quoteType === 'FUTURE'
    );
    res.json({ quotes });
  } catch (e) {
    console.error('[Yahoo search]', e.message);
    res.status(502).json({ error: 'Erro ao buscar no Yahoo Finance.' });
  }
});

// GET /api/yahoo/chart?symbol=AAPL&period=1y&interval=1d
router.get('/yahoo/chart', async (req, res) => {
  const { symbol, period = '1y', interval = '1d' } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Parâmetro "symbol" obrigatório.' });

  const now = Math.floor(Date.now() / 1000);
  const days = PERIOD_DAYS[period] || 365;
  const from = now - days * 86400;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${from}&period2=${now}&interval=${interval}&events=history&includeAdjustedClose=true`;
    const r = await fetch(url, { headers: YF_HEADERS });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    const result = data.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: 'Ativo não encontrado ou sem dados para o período.' });

    const timestamps = result.timestamp || [];
    const q = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose;

    const rows = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        index: i + 1,
        open:  q.open?.[i]  != null ? +q.open[i].toFixed(4)  : null,
        high:  q.high?.[i]  != null ? +q.high[i].toFixed(4)  : null,
        low:   q.low?.[i]   != null ? +q.low[i].toFixed(4)   : null,
        close: q.close?.[i] != null ? +q.close[i].toFixed(4) : null,
        adjclose: adjClose?.[i] != null ? +adjClose[i].toFixed(4) : null,
        volume: q.volume?.[i] ?? null,
      }))
      .filter(r => r.close != null);

    res.json({
      symbol: result.meta?.symbol || symbol,
      name: result.meta?.longName || result.meta?.shortName || symbol,
      currency: result.meta?.currency || '',
      rows,
    });
  } catch (e) {
    console.error('[Yahoo chart]', e.message);
    res.status(502).json({ error: 'Erro ao buscar dados do Yahoo Finance.' });
  }
});

module.exports = router;
