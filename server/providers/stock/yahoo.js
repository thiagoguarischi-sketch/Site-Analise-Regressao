'use strict';

// Provedor: Yahoo Finance (endpoints não oficiais — sem custo, sem SLA).
// Troca de provedor: implemente o mesmo contrato em outro arquivo e altere
// STOCK_PROVIDER no .env. Nenhuma outra linha do projeto precisa mudar.
//
// Contrato exportado:
//   search(q)                              → Promise<{ quotes: Quote[] }>
//   chart(symbol, period1, period2, interval) → Promise<ChartData | null>
//
// Quote:    { symbol, shortname, longname, exchDisp, exchange, quoteType }
// ChartData: { symbol, name, currency, rows: Row[] }
// Row:       { date, index, open, high, low, close, adjclose, volume }

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept':          'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const VALID_QUOTE_TYPES = new Set(['EQUITY', 'ETF', 'INDEX', 'CURRENCY', 'FUTURE']);

async function _fetch(url, timeoutMs = 10000, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
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

async function search(q) {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
  const r = await _fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data  = await r.json();
  const quotes = (data.quotes || []).filter(q => VALID_QUOTE_TYPES.has(q.quoteType));
  return { quotes };
}

async function chart(symbol, period1, period2, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=history&includeAdjustedClose=true`;
  const r = await _fetch(url, 15000);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data   = await r.json();
  const result = data.chart?.result?.[0];
  if (!result) return null;

  const timestamps = result.timestamp || [];
  const q          = result.indicators?.quote?.[0] || {};
  const adjClose   = result.indicators?.adjclose?.[0]?.adjclose;

  const rows = timestamps
    .map((ts, i) => ({
      date:     new Date(ts * 1000).toISOString().slice(0, 10),
      index:    i + 1,
      open:     q.open?.[i]     != null ? +q.open[i].toFixed(4)     : null,
      high:     q.high?.[i]     != null ? +q.high[i].toFixed(4)     : null,
      low:      q.low?.[i]      != null ? +q.low[i].toFixed(4)      : null,
      close:    q.close?.[i]    != null ? +q.close[i].toFixed(4)    : null,
      adjclose: adjClose?.[i]   != null ? +adjClose[i].toFixed(4)   : null,
      volume:   q.volume?.[i]   ?? null,
    }))
    .filter(row => row.close != null);

  return {
    symbol:   result.meta?.symbol   || symbol,
    name:     result.meta?.longName || result.meta?.shortName || symbol,
    currency: result.meta?.currency || '',
    rows,
  };
}

module.exports = { search, chart };
