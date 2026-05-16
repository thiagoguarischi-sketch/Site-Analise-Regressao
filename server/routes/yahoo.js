const express = require('express');
const router = express.Router();

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const PERIOD_DAYS = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730, '5y': 1825 };

function _toUnix(dateStr) {
  return Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / 1000);
}

function _yesterday() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// fetch com timeout + 1 retry automático em caso de rate-limit (429) ou erro de rede
async function _fetchYF(url, timeoutMs = 10000, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { headers: YF_HEADERS, signal: ctrl.signal });
      clearTimeout(timer);
      if (r.status === 429 && attempt < retries) {
        await new Promise(res => setTimeout(res, 1500));
        continue;
      }
      return r;
    } catch (e) {
      clearTimeout(timer);
      if (attempt < retries && (e.name === 'AbortError' || e.code === 'UND_ERR_CONNECT_TIMEOUT')) {
        await new Promise(res => setTimeout(res, 800));
        continue;
      }
      throw e;
    }
  }
}

// GET /api/yahoo/search?q=AAPL
router.get('/yahoo/search', async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) return res.json({ quotes: [] });

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
    const r = await _fetchYF(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const quotes = (data.quotes || []).filter(
      q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'INDEX' || q.quoteType === 'CURRENCY' || q.quoteType === 'FUTURE'
    );
    res.json({ quotes });
  } catch (e) {
    console.error('[Yahoo search]', e.message);
    const msg = e.name === 'AbortError'
      ? 'Yahoo Finance demorou demais. Tente novamente.'
      : 'Erro ao buscar no Yahoo Finance. Tente novamente em instantes.';
    res.status(502).json({ error: msg });
  }
});

// GET /api/yahoo/chart?symbol=AAPL&from=2024-01-01&to=2024-12-31&interval=1d
router.get('/yahoo/chart', async (req, res) => {
  const { symbol, from, to, period = '1y', interval = '1d' } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Parâmetro "symbol" obrigatório.' });

  const maxTo = _yesterday();
  let period1, period2;

  if (from && to) {
    const clampedTo = to > maxTo ? maxTo : to;
    if (from >= clampedTo) return res.status(400).json({ error: 'Data inicial deve ser anterior à data final.' });
    period1 = _toUnix(from);
    period2 = _toUnix(clampedTo) + 86399;
  } else {
    period2 = Math.floor(Date.now() / 1000);
    const days = PERIOD_DAYS[period] || 365;
    period1 = period2 - days * 86400;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=history&includeAdjustedClose=true`;
    const r = await _fetchYF(url, 15000);
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
        open:     q.open?.[i]  != null ? +q.open[i].toFixed(4)  : null,
        high:     q.high?.[i]  != null ? +q.high[i].toFixed(4)  : null,
        low:      q.low?.[i]   != null ? +q.low[i].toFixed(4)   : null,
        close:    q.close?.[i] != null ? +q.close[i].toFixed(4) : null,
        adjclose: adjClose?.[i] != null ? +adjClose[i].toFixed(4) : null,
        volume:   q.volume?.[i] ?? null,
      }))
      .filter(r => r.close != null);

    res.json({
      symbol:   result.meta?.symbol   || symbol,
      name:     result.meta?.longName || result.meta?.shortName || symbol,
      currency: result.meta?.currency || '',
      rows,
    });
  } catch (e) {
    console.error('[Yahoo chart]', e.message);
    const msg = e.name === 'AbortError'
      ? 'Yahoo Finance demorou demais. Tente novamente.'
      : 'Erro ao buscar dados do Yahoo Finance. Tente novamente em instantes.';
    res.status(502).json({ error: msg });
  }
});

module.exports = router;
