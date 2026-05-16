const express = require('express');
const router = express.Router();

const BCB_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

function _fmtDate(dateStr) {
  const parts = (dateStr || '').split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function _parseVal(valStr) {
  if (valStr == null || valStr === '') return null;
  const n = parseFloat(String(valStr).replace(',', '.'));
  return isNaN(n) ? null : +n.toFixed(6);
}

function _parseBcbDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// GET /api/bcb/search?q=selic
router.get('/bcb/search', async (req, res) => {
  const { q = '' } = req.query;
  const query = q.trim();
  if (!query) return res.json({ series: [] });

  try {
    // Código numérico direto: verifica se a série existe
    if (/^\d+$/.test(query)) {
      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${query}/dados/ultimos/1?formato=json`;
      const r = await fetch(url, { headers: BCB_HEADERS });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length) {
          return res.json({ series: [{ codigo: query, nome: `Série BCB nº ${query}`, periodicidade: '', unidade: '' }] });
        }
      }
      return res.json({ series: [] });
    }

    // Busca textual via portal de dados abertos do BCB (CKAN)
    const url = `https://dadosabertos.bcb.gov.br/api/3/action/package_search?q=${encodeURIComponent(query)}&rows=10`;
    const r = await fetch(url, { headers: BCB_HEADERS });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    const results = data.result?.results || [];
    const seen = new Set();
    const series = [];

    for (const pkg of results) {
      for (const resource of (pkg.resources || [])) {
        const match = (resource.url || '').match(/bcdata\.sgs\.(\d+)/);
        if (match && !seen.has(match[1])) {
          seen.add(match[1]);
          series.push({
            codigo: match[1],
            nome: pkg.title || `Série ${match[1]}`,
            periodicidade: '',
            unidade: '',
          });
          break;
        }
      }
    }

    res.json({ series: series.slice(0, 8) });
  } catch (e) {
    console.error('[BCB search]', e.message);
    res.status(502).json({ error: 'Erro ao buscar no Banco Central.' });
  }
});

// GET /api/bcb/serie?codigo=432&from=2024-01-01&to=2024-12-31
router.get('/bcb/serie', async (req, res) => {
  const { codigo, from, to } = req.query;
  if (!codigo || !/^\d+$/.test(codigo)) {
    return res.status(400).json({ error: 'Parâmetro "codigo" inválido.' });
  }

  try {
    let url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?formato=json`;
    const dtFrom = from ? _fmtDate(from) : '';
    const dtTo   = to   ? _fmtDate(to)   : '';
    if (dtFrom) url += `&dataInicial=${dtFrom}`;
    if (dtTo)   url += `&dataFinal=${dtTo}`;

    const r = await fetch(url, { headers: BCB_HEADERS });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const raw = await r.json();

    if (!Array.isArray(raw)) return res.status(404).json({ error: 'Série não encontrada.' });

    const rows = raw
      .map((item, i) => ({
        date:  _parseBcbDate(item.data),
        index: i + 1,
        valor: _parseVal(item.valor),
      }))
      .filter(row => row.valor != null);

    res.json({ codigo, rows });
  } catch (e) {
    console.error('[BCB serie]', e.message);
    res.status(502).json({ error: 'Erro ao buscar dados do Banco Central.' });
  }
});

module.exports = router;
