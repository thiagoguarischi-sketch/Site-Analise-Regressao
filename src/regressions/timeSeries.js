// Séries temporais — Decomposição Clássica, ARIMA(p,d,q) e GARCH(1,1)

import { mean, sum, esc } from '../core/utils.js';
import { matMul, matT, matInv } from '../core/matrix.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  S, cell, zebra, buildWS, autoFilter, mergeRange, downloadCSV,
  buildKPISheet, buildCompSheet, buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { switchTab } from '../ui/dashboard.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import {
  createTimeSeriesMain, createTrendChart, createSeasonChart,
  createTSResidChart, createVolatilityChart,
  createACFChart, createARIMAMainChart, createGARCHMainChart, createGARCHVarChart,
} from '../charts/forecastChart.js';

let stLastResult = null;
let stCurrentModel = 'classic';
const STC = {};

function stDestroyChart(id) { if (STC[id]) { STC[id].destroy(); delete STC[id]; } }

// ─── UI ─────────────────────────────────────────────────────────────────────

export function stInitRows(n = 12) {
  document.getElementById('st-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) stAddRow();
  stUpdateCount();
}

export function stAddRow() {
  const container = document.getElementById('st-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">${i}</span>
    <input class="data-input" type="text" placeholder="Ex: Jan/24" oninput="stUpdateCount()" style="font-size:12px">
    <input class="data-input" type="number" placeholder="valor" oninput="stUpdateCount()" step="any">`;
  container.appendChild(row);
}

export function stClearRows() {
  document.getElementById('st-data-rows').innerHTML = '';
  stInitRows();
  document.getElementById('st-results').style.display = 'none';
  document.getElementById('st-btn-save').style.display = 'none';
  stLastResult = null;
}

function stGetData() {
  const rows = document.getElementById('st-data-rows').children;
  const labels = [], values = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const lbl = inputs[0].value.trim();
    const val = parseFloat(inputs[1].value);
    if (lbl && !isNaN(val)) { labels.push(lbl); values.push(val); }
  }
  return { labels, values };
}

export function stUpdateCount() {
  const { values } = stGetData();
  document.getElementById('st-data-count').textContent = `${values.length} período${values.length !== 1 ? 's' : ''}`;
  const elX = document.getElementById('st-dh-x');
  const elY = document.getElementById('st-dh-y');
  if (elX) elX.textContent = document.getElementById('st-label-x').value || 'Período';
  if (elY) elY.textContent = document.getElementById('st-label-y').value || 'Valor';
}

export function stSetModel(model) {
  stCurrentModel = model;
  document.querySelectorAll('.st-model-btn').forEach(b => {
    const active = b.dataset.model === model;
    b.style.background = active ? 'var(--acc2)' : '';
    b.style.color = active ? '#fff' : '';
    b.style.borderColor = active ? 'var(--acc2)' : '';
  });
  document.getElementById('st-classic-params').style.display = model === 'classic' ? 'grid' : 'none';
  document.getElementById('st-arima-params').style.display = model === 'arima' ? 'grid' : 'none';
}

export function stLoadExample() {
  const examples = [
    { name: 'Vendas Mensais', ly: 'Vendas (R$k)', lx: 'Mês',
      labels: ['Jan/23','Fev/23','Mar/23','Abr/23','Mai/23','Jun/23','Jul/23','Ago/23','Set/23','Out/23','Nov/23','Dez/23','Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24'],
      values: [42,38,45,50,55,60,58,63,67,72,80,95,48,44,52,58,64,70] },
    { name: 'Temperatura Média', ly: 'Temp (°C)', lx: 'Mês',
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr'],
      values: [28,29,27,25,22,20,19,20,22,24,26,28,27,28,26,24] },
    { name: 'Retornos Financeiros', ly: 'Retorno (%)', lx: 'Semana',
      labels: Array.from({ length: 24 }, (_, i) => `S${i + 1}`),
      values: [1.2,-0.8,2.1,-1.5,0.3,3.2,-2.1,1.8,-0.5,2.9,-1.2,0.7,1.5,-3.1,2.4,0.8,-1.9,3.5,-0.6,1.1,-2.3,2.8,-0.4,1.6] },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('st-analysis-name').value = ex.name;
  document.getElementById('st-label-y').value = ex.ly;
  document.getElementById('st-label-x').value = ex.lx;
  document.getElementById('st-data-rows').innerHTML = '';
  ex.labels.forEach((lbl, i) => {
    stAddRow();
    const rows = document.getElementById('st-data-rows').children;
    const last = rows[rows.length - 1];
    last.querySelectorAll('input')[0].value = lbl;
    last.querySelectorAll('input')[1].value = ex.values[i];
  });
  for (let i = ex.labels.length; i < 12; i++) stAddRow();
  stUpdateCount();
}

// ─── MATH HELPERS ────────────────────────────────────────────────────────────

// Nelder-Mead minimization for GARCH parameter optimization
function nelderMead(f, x0, maxIter = 2000, tol = 1e-10) {
  const n = x0.length;
  const α = 1, γ = 2, ρ = 0.5, σ = 0.5;
  let pts = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const p = x0.slice();
    p[i] = p[i] !== 0 ? p[i] * 1.05 : 0.00025;
    pts.push(p);
  }
  let vals = pts.map(p => f(p));
  for (let iter = 0; iter < maxIter; iter++) {
    const ord = [...Array(n + 1).keys()].sort((a, b) => vals[a] - vals[b]);
    pts = ord.map(i => pts[i]); vals = ord.map(i => vals[i]);
    if (Math.abs(vals[n] - vals[0]) < tol) break;
    const c = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += pts[i][j] / n;
    const xr = c.map((v, j) => v + α * (v - pts[n][j]));
    const fr = f(xr);
    if (fr < vals[0]) {
      const xe = c.map((v, j) => v + γ * (xr[j] - v));
      const fe = f(xe);
      pts[n] = fe < fr ? xe : xr; vals[n] = fe < fr ? fe : fr;
    } else if (fr < vals[n - 1]) {
      pts[n] = xr; vals[n] = fr;
    } else {
      const xc = c.map((v, j) => v + ρ * (pts[n][j] - v));
      const fc = f(xc);
      if (fc < vals[n]) { pts[n] = xc; vals[n] = fc; }
      else {
        for (let i = 1; i <= n; i++) {
          pts[i] = pts[0].map((v, j) => v + σ * (pts[i][j] - v));
          vals[i] = f(pts[i]);
        }
      }
    }
  }
  return pts[0];
}

function computeACF(series, maxLag) {
  const n = series.length;
  const m = mean(series);
  const c0 = sum(series.map(v => (v - m) ** 2)) / n;
  if (c0 < 1e-12) return new Array(maxLag).fill(0);
  return Array.from({ length: maxLag }, (_, k) => {
    let ck = 0;
    for (let t = k + 1; t < n; t++) ck += (series[t] - m) * (series[t - k - 1] - m);
    return ck / (n * c0);
  });
}

function computePACF(series, maxLag) {
  const acfVals = [1, ...computeACF(series, maxLag)];
  return Array.from({ length: maxLag }, (_, k) => {
    const size = k + 1;
    const R = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => acfVals[Math.abs(i - j)])
    );
    const r = Array.from({ length: size }, (_, i) => [acfVals[i + 1]]);
    try {
      const inv = matInv(R);
      if (!inv) return 0;
      return matMul(inv, r)[k][0];
    } catch { return 0; }
  });
}

// Apply d-order differencing, storing last values at each level for undifferencing
function difference(series, d) {
  let s = [...series];
  const lastVals = [];
  for (let i = 0; i < d; i++) {
    lastVals.push(s[s.length - 1]);
    const ds = [];
    for (let j = 1; j < s.length; j++) ds.push(s[j] - s[j - 1]);
    s = ds;
  }
  return { w: s, lastVals };
}

// Reverse d-order differencing on forecast values using stored last values
function undifference(forecastW, lastVals, d) {
  let fc = [...forecastW];
  for (let i = d - 1; i >= 0; i--) {
    const out = [];
    let prev = lastVals[i];
    for (const w of fc) { prev += w; out.push(prev); }
    fc = out;
  }
  return fc;
}

// OLS via normal equations: β = (X'X)⁻¹ X'Y
function olsVec(X, Y) {
  if (!X.length || !X[0].length) return [];
  const Xt = matT(X);
  const XtX = matMul(Xt, X);
  const XtY = matMul(Xt, Y.map(v => [v]));
  const inv = matInv(XtX);
  if (!inv) return new Array(X[0].length).fill(0);
  return matMul(inv, XtY).map(r => r[0]);
}

// Polynomial multiplication (coefficient arrays)
function polyMul(a, b) {
  const res = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) res[i + j] += a[i] * b[j];
  return res;
}

// ─── MODEL: DECOMPOSIÇÃO CLÁSSICA ────────────────────────────────────────────

function stCompute(values, windowSize, futureN) {
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const xm = mean(xs), ym = mean(values);
  const Sxx = sum(xs.map(x => (x - xm) ** 2));
  const Sxy = sum(xs.map((x, i) => (x - xm) * (values[i] - ym)));
  const b1 = Sxx ? Sxy / Sxx : 0, b0 = ym - b1 * xm;
  const trend = xs.map(x => b0 + b1 * x);

  const ma = Array.from({ length: n }, (_, i) => {
    if (i < windowSize - 1) return null;
    return sum(values.slice(i - windowSize + 1, i + 1)) / windowSize;
  });

  const detrended = values.map((v, i) => v - trend[i]);
  const period = Math.max(2, windowSize);
  const seasonIdx = Array.from({ length: period }, (_, p) => {
    const vals = detrended.filter((_, i) => i % period === p);
    return vals.length ? mean(vals) : 0;
  });
  const seasonMean = mean(seasonIdx);
  const seasonAdj = seasonIdx.map(s => s - seasonMean);
  const seasonal = values.map((_, i) => seasonAdj[i % period]);
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  const volWindow = Math.max(3, windowSize);
  const volatility = Array.from({ length: n }, (_, i) => {
    if (i < volWindow - 1) return null;
    const slice = values.slice(i - volWindow + 1, i + 1);
    const m = mean(slice);
    return Math.sqrt(sum(slice.map(v => (v - m) ** 2)) / volWindow);
  });

  const growthRates = [];
  for (let i = 1; i < n; i++) {
    if (values[i - 1] !== 0) growthRates.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]) * 100);
  }
  const avgGrowth = growthRates.length ? mean(growthRates) : 0;

  const projValues = [], projTrend = [];
  for (let i = 1; i <= futureN; i++) {
    const t = n + i;
    projTrend.push(b0 + b1 * t);
    projValues.push(b0 + b1 * t + seasonAdj[(n + i - 1) % period]);
  }

  const stdev = Math.sqrt(sum(values.map(v => (v - ym) ** 2)) / n);
  const cv = ym !== 0 ? (stdev / Math.abs(ym)) * 100 : 0;

  return {
    model: 'classic',
    n, b0, b1, trend, ma, seasonal, residual, volatility,
    projValues, projTrend, avgGrowth, growthRates,
    maxVal: Math.max(...values), minVal: Math.min(...values),
    maxIdx: values.indexOf(Math.max(...values)), minIdx: values.indexOf(Math.min(...values)),
    ym, stdev, cv, windowSize, futureN, period,
  };
}

// ─── MODEL: ARIMA(p,d,q) ─────────────────────────────────────────────────────

function arimaCompute(values, p, d, q, futureN) {
  const n = values.length;
  const ym = mean(values);
  const stdev = Math.sqrt(sum(values.map(v => (v - ym) ** 2)) / n);
  const cv = ym !== 0 ? stdev / Math.abs(ym) * 100 : 0;

  // 1. Differencing
  const { w, lastVals } = difference(values, d);
  const nw = w.length;

  // 2. Hannan-Rissanen: high-order auxiliary AR for proxy residuals
  const P_aux = Math.min(nw - 2, Math.max(p + q + 3, 8));
  const arResid = new Array(nw).fill(0);
  if (P_aux > 0 && nw > P_aux + 3) {
    const Yaux = w.slice(P_aux);
    const Xaux = Array.from({ length: nw - P_aux }, (_, t) =>
      Array.from({ length: P_aux }, (_, i) => w[t + P_aux - 1 - i])
    );
    const phiAux = olsVec(Xaux, Yaux);
    for (let t = P_aux; t < nw; t++) {
      let yhat = 0;
      for (let i = 0; i < P_aux; i++) yhat += phiAux[i] * w[t - 1 - i];
      arResid[t] = w[t] - yhat;
    }
  }

  // 3. Joint ARMA estimation using proxy residuals for MA terms
  let phi = new Array(p).fill(0);
  let theta = new Array(q).fill(0);
  const minT = Math.max(p, q);
  if (p + q > 0 && nw > minT + 2) {
    const Yfull = w.slice(minT);
    const Xfull = Array.from({ length: nw - minT }, (_, idx) => {
      const t = idx + minT;
      const row = [];
      for (let i = 1; i <= p; i++) row.push(w[t - i]);
      for (let j = 1; j <= q; j++) row.push(arResid[t - j] || 0);
      return row;
    });
    if (Xfull.length > 0 && Xfull[0].length > 0) {
      const coeffs = olsVec(Xfull, Yfull);
      phi = coeffs.slice(0, p);
      theta = coeffs.slice(p);
    }
  }

  // 4. Compute final residuals with estimated params
  const fittedW = new Array(nw).fill(NaN);
  const eps = new Array(nw).fill(0);
  for (let t = minT; t < nw; t++) {
    let yhat = 0;
    for (let i = 0; i < p; i++) yhat += phi[i] * w[t - 1 - i];
    for (let j = 0; j < q; j++) yhat += theta[j] * eps[t - 1 - j];
    fittedW[t] = yhat;
    eps[t] = w[t] - yhat;
  }

  const validEps = eps.slice(minT);
  const nEff = validEps.length;
  const dof = Math.max(1, nEff - p - q);
  const sigma2 = sum(validEps.map(r => r ** 2)) / dof;
  const sigma = Math.sqrt(Math.max(0, sigma2));

  // 5. Reconstruct fitted values on original scale
  const fittedOrig = new Array(n).fill(NaN);
  for (let t = minT; t < nw; t++) {
    if (isNaN(fittedW[t])) continue;
    if (d === 0) {
      fittedOrig[t] = fittedW[t];
    } else if (d === 1) {
      const oi = t + 1;
      if (oi < n) fittedOrig[oi] = values[oi - 1] + fittedW[t];
    } else if (d === 2) {
      const oi = t + 2;
      if (oi < n) {
        const deltaYPrev = oi >= 2 ? values[oi - 1] - values[oi - 2] : 0;
        fittedOrig[oi] = values[oi - 1] + deltaYPrev + fittedW[t];
      }
    }
  }

  // 6. AIC / BIC (Gaussian log-likelihood)
  const ll = nEff > 0 && sigma2 > 0
    ? -nEff / 2 * (Math.log(2 * Math.PI) + Math.log(sigma2) + 1)
    : 0;
  const kParams = p + q + (d > 0 ? 1 : 0);
  const aic = -2 * ll + 2 * kParams;
  const bic = -2 * ll + kParams * Math.log(Math.max(nEff, 1));

  // 7. ψ-weights via the combined AR polynomial Φ(B) = φ(B)·(1-B)^d
  let phi_poly = [1];
  for (let i = 0; i < d; i++) phi_poly = polyMul(phi_poly, [1, -1]);
  phi_poly = polyMul(phi_poly, [1, ...phi.map(v => -v)]);
  const bigPhi = phi_poly.slice(1).map(v => -v); // Φ₁, Φ₂, ...

  const psi = [1];
  for (let j = 1; j <= futureN; j++) {
    let psij = j <= q ? (theta[j - 1] || 0) : 0;
    for (let i = 1; i <= Math.min(j, bigPhi.length); i++) psij += bigPhi[i - 1] * (psi[j - i] || 0);
    psi.push(psij);
  }
  // Cumulative ψ² for h-step forecast variance: Var(ŷ_{T+h}) = σ² · Σ_{j=0}^{h-1} ψ_j²
  const cumPsi2 = [];
  let csum = 0;
  for (let h = 0; h < futureN; h++) { csum += psi[h] ** 2; cumPsi2.push(csum); }

  // 8. Multi-step forecast on differenced scale
  const extW = [...w];
  const extEps = [...eps];
  const forecastW = [];
  for (let h = 0; h < futureN; h++) {
    let fval = 0;
    for (let i = 0; i < p; i++) fval += phi[i] * extW[extW.length - 1 - i];
    for (let j = 0; j < q; j++) fval += theta[j] * (extEps[extEps.length - 1 - j] || 0);
    forecastW.push(fval);
    extW.push(fval);
    extEps.push(0);
  }

  // 9. Undifference to original scale + CI
  const forecastY = undifference(forecastW, lastVals, d);
  const ciHalf = cumPsi2.map(v => 1.96 * sigma * Math.sqrt(v));
  const ciLower = forecastY.map((v, h) => v - ciHalf[h]);
  const ciUpper = forecastY.map((v, h) => v + ciHalf[h]);

  // 10. Residual diagnostics — ACF/PACF + Ljung-Box
  const acfLags = Math.min(15, Math.floor(nEff / 3));
  const acfResid = acfLags > 0 ? computeACF(validEps, acfLags) : [];
  const pacfResid = acfLags > 0 ? computePACF(validEps, acfLags) : [];
  const lbLags = Math.min(10, acfLags);
  const ljungBoxQ = lbLags > 0
    ? nEff * (nEff + 2) * sum(acfResid.slice(0, lbLags).map((r, k) => r ** 2 / (nEff - k - 1)))
    : 0;

  return {
    model: 'arima', p, d, q,
    phi, theta, sigma, sigma2, aic, bic, ll,
    w, nw, fittedW, fittedOrig, resid: validEps,
    forecastW, forecastY, ciLower, ciUpper,
    acfResid, pacfResid, ljungBoxQ, lbLags,
    futureN, n, ym, stdev, cv,
    maxVal: Math.max(...values), minVal: Math.min(...values),
    maxIdx: values.indexOf(Math.max(...values)),
    minIdx: values.indexOf(Math.min(...values)),
  };
}

// ─── MODEL: GARCH(1,1) ───────────────────────────────────────────────────────

function garchCompute(values, futureN) {
  const n = values.length;
  const mu = mean(values);
  const eps = values.map(v => v - mu);
  const eps2 = eps.map(e => e ** 2);
  const varEps = sum(eps2) / n || 1;

  // Conditional variance recursion: h_t = ω + α·ε²_{t-1} + β·h_{t-1}
  function hSeries(om, al, be) {
    const h = new Array(n);
    h[0] = varEps;
    for (let t = 1; t < n; t++) {
      h[t] = om + al * eps2[t - 1] + be * h[t - 1];
      if (!isFinite(h[t]) || h[t] <= 0) h[t] = varEps;
    }
    return h;
  }

  // Gaussian log-likelihood (negated for minimization)
  function negLogLik(params) {
    const [om, al, be] = params;
    if (om <= 1e-10 || al < 0 || be < 0 || al + be >= 0.9999) return 1e10;
    const h = hSeries(om, al, be);
    let ll = 0;
    for (let t = 0; t < n; t++) ll += Math.log(h[t]) + eps2[t] / h[t];
    return isFinite(ll) ? ll / 2 : 1e10;
  }

  // Initialize with method-of-moments values and optimize via Nelder-Mead
  const a0 = 0.1, b0 = 0.85;
  const w0 = Math.max(1e-8, varEps * (1 - a0 - b0));
  const raw = nelderMead(negLogLik, [w0, a0, b0]);

  let omega = Math.max(1e-10, raw[0]);
  let alpha = Math.max(0.001, Math.min(0.498, raw[1]));
  let beta  = Math.max(0.001, Math.min(0.998 - alpha, raw[2]));

  const h = hSeries(omega, alpha, beta);
  const sigma = h.map(v => Math.sqrt(Math.max(0, v)));

  const persistence = alpha + beta;
  const uncondVar = persistence < 1 ? omega / (1 - persistence) : varEps;
  const halfLife = persistence > 0 && persistence < 1
    ? Math.abs(Math.log(0.5) / Math.log(persistence))
    : Infinity;

  const ll = -negLogLik([omega, alpha, beta]);
  const aic = -2 * ll + 2 * 3; // 3 params: ω, α, β
  const bic = -2 * ll + 3 * Math.log(n);

  // Standardized residuals z_t = ε_t / σ_t
  const zStd = eps.map((e, t) => sigma[t] > 1e-10 ? e / sigma[t] : 0);

  // Multi-step variance forecast: σ²_{T+h} = σ²_unc + (α+β)^h · (σ²_T - σ²_unc)
  const hT = h[n - 1];
  const hForecast = Array.from({ length: futureN }, (_, k) =>
    persistence < 1
      ? uncondVar + persistence ** (k + 1) * (hT - uncondVar)
      : hT
  );
  const sigmaForecast = hForecast.map(v => Math.sqrt(Math.max(0, v)));
  const ciLower = sigmaForecast.map(s => mu - 1.96 * s);
  const ciUpper = sigmaForecast.map(s => mu + 1.96 * s);

  // ACF of z²_t to diagnose remaining ARCH effects
  const acfZ2Lags = Math.min(12, Math.floor(n / 3));
  const acfZ2 = acfZ2Lags > 0 ? computeACF(zStd.map(z => z ** 2), acfZ2Lags) : [];

  const ym = mu;
  const stdev = Math.sqrt(varEps);
  const cv = mu !== 0 ? stdev / Math.abs(mu) * 100 : 0;

  return {
    model: 'garch', omega, alpha, beta, persistence, halfLife,
    h, sigma, zStd, eps, eps2, mu, varEps, uncondVar,
    hForecast, sigmaForecast, ciLower, ciUpper,
    acfZ2, ll, aic, bic, futureN, n, ym, stdev, cv,
    maxVal: Math.max(...values), minVal: Math.min(...values),
    maxIdx: values.indexOf(Math.max(...values)),
    minIdx: values.indexOf(Math.min(...values)),
  };
}

// ─── RUN ─────────────────────────────────────────────────────────────────────

export function runSerie() {
  const { labels, values } = stGetData();
  const futureN = parseInt(document.getElementById('st-future').value) || 6;
  if (values.length < 6) { showToast('Insira pelo menos 6 períodos.', 'err'); return; }

  const labelY = document.getElementById('st-label-y').value || 'Valor';
  const labelX = document.getElementById('st-label-x').value || 'Período';

  let res;
  if (stCurrentModel === 'arima') {
    const p = Math.max(0, parseInt(document.getElementById('st-arima-p').value) || 1);
    const d = Math.max(0, Math.min(2, parseInt(document.getElementById('st-arima-d').value) || 1));
    const q = Math.max(0, parseInt(document.getElementById('st-arima-q').value) || 1);
    if (values.length < p + d + q + 5) {
      showToast(`Dados insuficientes para ARIMA(${p},${d},${q}). Necessário: ${p+d+q+5} períodos.`, 'err'); return;
    }
    res = arimaCompute(values, p, d, q, futureN);
  } else if (stCurrentModel === 'garch') {
    if (values.length < 10) { showToast('GARCH requer pelo menos 10 períodos.', 'err'); return; }
    res = garchCompute(values, futureN);
  } else {
    const windowSize = parseInt(document.getElementById('st-window').value) || 3;
    res = stCompute(values, windowSize, futureN);
  }

  res.labels = labels;
  res.values = values;
  res.labelY = labelY;
  res.labelX = labelX;
  stLastResult = res;

  // Show/hide model-specific result sections
  document.getElementById('st-classic-section').style.display = res.model === 'classic' ? 'block' : 'none';
  document.getElementById('st-arima-section').style.display = res.model === 'arima' ? 'block' : 'none';
  document.getElementById('st-garch-section').style.display = res.model === 'garch' ? 'block' : 'none';

  if (res.model === 'classic') stRenderResults(res);
  else if (res.model === 'arima') arimaRenderResults(res);
  else garchRenderResults(res);

  document.getElementById('st-results').style.display = 'block';
  document.getElementById('st-btn-save').style.display = 'inline-flex';
  stGenerateAI(res);
  showToast('Análise concluída!', 'ok');
}

// ─── RENDER: DECOMPOSIÇÃO CLÁSSICA ───────────────────────────────────────────

function stRenderResults(res) {
  const { n, ym, stdev, cv, maxVal, minVal, maxIdx, minIdx, avgGrowth, b1,
    labels, values, projValues, projTrend, futureN } = res;

  document.getElementById('st-main-chart-title').textContent = '📈 Série + Tendência + Média Móvel + Projeção';
  document.getElementById('st-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${ym.toFixed(2)}</div><div class="metric-lab">Média</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--x)">${stdev.toFixed(2)}</div><div class="metric-lab">Desvio padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${cv.toFixed(1)}%</div><div class="metric-lab">CV (%)</div></div>
    <div class="metric"><div class="metric-val" style="color:${b1 >= 0 ? 'var(--y)' : 'var(--acc)'}">${b1 >= 0 ? '↑' : '↓'} ${Math.abs(b1).toFixed(3)}</div><div class="metric-lab">Tendência/período</div></div>
    <div class="metric"><div class="metric-val" style="color:${avgGrowth >= 0 ? 'var(--y)' : 'var(--acc)'}">${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%</div><div class="metric-lab">Crescimento médio</div></div>
    <div class="metric"><div class="metric-val metric-y">${maxVal.toFixed(2)}</div><div class="metric-lab">Melhor: ${esc(labels[maxIdx] || String(maxIdx + 1))}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc)">${minVal.toFixed(2)}</div><div class="metric-lab">Pior: ${esc(labels[minIdx] || String(minIdx + 1))}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${n}</div><div class="metric-lab">n</div></div>
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  const allLabels = [...labels, ...projLabels];

  stDestroyChart('main');
  STC.main = createTimeSeriesMain('st-chart-main', res, allLabels);
  stDestroyChart('trend');
  STC.trend = createTrendChart('st-chart-trend', labels, res.trend);
  stDestroyChart('season');
  STC.season = createSeasonChart('st-chart-season', labels, res.seasonal);
  stDestroyChart('resid');
  STC.resid = createTSResidChart('st-chart-resid', labels, res.residual);
  stDestroyChart('vol');
  STC.vol = createVolatilityChart('st-chart-vol', labels, res.volatility);

  const projRows = projValues.map((v, i) => `<tr>
    <td>${projLabels[i]}</td>
    <td style="color:var(--acc2);font-weight:600">${v.toFixed(4)}</td>
    <td style="color:var(--txt3)">${projTrend[i].toFixed(4)}</td>
    <td style="color:${v >= ym ? 'var(--y)' : 'var(--acc)'}">${v >= ym ? '↑' : '↓'} ${((v - ym) / Math.abs(ym) * 100).toFixed(1)}%</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Período</th><th>Projeção</th><th>Só tendência</th><th>vs. Média</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

// ─── RENDER: ARIMA ────────────────────────────────────────────────────────────

function arimaRenderResults(res) {
  const { p, d, q, phi, theta, sigma, aic, bic, n, ym, stdev, cv,
    labels, forecastY, ciLower, ciUpper, futureN, resid,
    maxVal, minVal, maxIdx, minIdx, acfResid, pacfResid, ljungBoxQ, lbLags } = res;

  document.getElementById('st-main-chart-title').textContent =
    `📈 ARIMA(${p},${d},${q}) — Série, Valores Ajustados e Previsão com IC 95%`;

  const badge = (v, lbl, col = 'var(--acc2)') =>
    `<div class="metric"><div class="metric-val" style="color:${col}">${v}</div><div class="metric-lab">${lbl}</div></div>`;
  const phiStr = phi.map((v, i) => `φ${i + 1}=${v.toFixed(3)}`).join(', ') || '—';
  const thetaStr = theta.map((v, i) => `θ${i + 1}=${v.toFixed(3)}`).join(', ') || '—';
  const qTest = ljungBoxQ > 0 ? (ljungBoxQ > 18.3 ? '⚠️ Autocorrelação residual' : '✅ Resíduos OK') : '—';

  document.getElementById('st-metrics').innerHTML = `
    ${badge(`ARIMA(${p},${d},${q})`, 'Modelo')}
    ${badge(sigma.toFixed(4), 'σ (erro padrão)')}
    ${badge(aic.toFixed(2), 'AIC')}
    ${badge(bic.toFixed(2), 'BIC')}
    ${badge(cv.toFixed(1) + '%', 'CV (série)', cv >= 30 ? 'var(--acc)' : cv >= 15 ? 'var(--y)' : 'var(--acc2)')}
    ${badge(ljungBoxQ.toFixed(2), `Q(${lbLags}) Ljung-Box`, ljungBoxQ > 18.3 ? 'var(--acc)' : 'var(--acc2)')}
    <div class="metric" style="grid-column:1/-1">
      <span style="font-size:11px;color:var(--txt3)">AR: ${esc(phiStr)} &nbsp;|&nbsp; MA: ${esc(thetaStr)} &nbsp;|&nbsp; ${qTest}</span>
    </div>
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  stDestroyChart('main');
  STC.main = createARIMAMainChart('st-chart-main', res, [...labels, ...projLabels]);

  const confBand = resid.length > 0 ? 1.96 / Math.sqrt(resid.length) : 0.3;
  stDestroyChart('arima-acf');
  STC['arima-acf'] = createACFChart('st-chart-arima-acf', acfResid, confBand);
  stDestroyChart('arima-pacf');
  STC['arima-pacf'] = createACFChart('st-chart-arima-pacf', pacfResid, confBand);

  const projRows = forecastY.map((v, i) => `<tr>
    <td>${projLabels[i]}</td>
    <td style="color:var(--acc2);font-weight:600">${v.toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciLower[i].toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciUpper[i].toFixed(4)}</td>
    <td style="color:var(--y)">${(ciUpper[i] - ciLower[i]).toFixed(4)}</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Período</th><th>Previsão</th><th>IC 95% Inf</th><th>IC 95% Sup</th><th>Amplitude IC</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

// ─── RENDER: GARCH ────────────────────────────────────────────────────────────

function garchRenderResults(res) {
  const { omega, alpha, beta, persistence, halfLife, h, sigma,
    labels, values, futureN, ciLower, ciUpper, n, mu,
    aic, bic, acfZ2, sigmaForecast, uncondVar } = res;

  document.getElementById('st-main-chart-title').textContent =
    '📈 GARCH(1,1) — Série com Bandas de Volatilidade Condicional e Previsão';

  const fmt = (v, dp = 4) => isFinite(v) ? Number(v).toFixed(dp) : '∞';
  const badge = (v, lbl, col = 'var(--acc2)') =>
    `<div class="metric"><div class="metric-val" style="color:${col}">${v}</div><div class="metric-lab">${lbl}</div></div>`;
  const persColor = persistence > 0.95 ? 'var(--acc)' : persistence > 0.85 ? 'var(--y)' : 'var(--acc2)';

  document.getElementById('st-metrics').innerHTML = `
    ${badge('GARCH(1,1)', 'Modelo')}
    ${badge(fmt(omega, 6), 'ω (constante)')}
    ${badge(fmt(alpha), 'α (efeito ARCH)', alpha > 0.3 ? 'var(--acc)' : 'var(--acc2)')}
    ${badge(fmt(beta), 'β (efeito GARCH)', beta > 0.9 ? 'var(--y)' : 'var(--acc2)')}
    ${badge(fmt(persistence), 'α+β (persistência)', persColor)}
    ${badge(fmt(halfLife, 1) + ' per.', 'Meia-vida do choque')}
    ${badge(fmt(Math.sqrt(uncondVar)), 'σ incondicional')}
    ${badge(aic.toFixed(2), 'AIC')}
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  stDestroyChart('main');
  STC.main = createGARCHMainChart('st-chart-main', res, [...labels, ...projLabels]);

  stDestroyChart('garch-var');
  STC['garch-var'] = createGARCHVarChart('st-chart-garch-var', labels, h);

  const confBand = n > 0 ? 1.96 / Math.sqrt(n) : 0.3;
  stDestroyChart('garch-acf');
  STC['garch-acf'] = createACFChart('st-chart-garch-acf', acfZ2, confBand);

  const projRows = sigmaForecast.map((s, i) => `<tr>
    <td>${projLabels[i]}</td>
    <td style="color:var(--acc2);font-weight:600">${mu.toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciLower[i].toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciUpper[i].toFixed(4)}</td>
    <td style="color:var(--y)">${s.toFixed(4)}</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Período</th><th>Nível esperado</th><th>IC 95% Inf</th><th>IC 95% Sup</th><th>σ_t previsto</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

async function stGenerateAI(res) {
  const box = document.getElementById('st-ai-box');
  box.innerHTML = aiLoadingHTML();

  let prompt, fallback;
  if (res.model === 'arima') {
    const phiStr = res.phi.map((v, i) => `φ${i + 1}=${v.toFixed(3)}`).join(', ') || 'nenhum';
    const thetaStr = res.theta.map((v, i) => `θ${i + 1}=${v.toFixed(3)}`).join(', ') || 'nenhum';
    prompt = `Você é especialista em econometria e séries temporais. Analise em português (3-4 parágrafos curtos):

Série: ${esc(res.labelY)} | Período: ${esc(res.labelX)}
Modelo ajustado: ARIMA(${res.p},${res.d},${res.q}) | n = ${res.n}
Parâmetros AR: ${esc(phiStr)}
Parâmetros MA: ${esc(thetaStr)}
σ = ${res.sigma.toFixed(4)} | AIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}
Ljung-Box Q(${res.lbLags}) = ${res.ljungBoxQ.toFixed(2)} (crítico ~18.3 para α=5%)
Previsão próx. ${res.futureN} períodos: ${res.forecastY.map(v => v.toFixed(2)).join(', ')}
IC 95% 1° período: [${res.ciLower[0].toFixed(2)}, ${res.ciUpper[0].toFixed(2)}]

Inclua: 1) qualidade do ajuste e diagnóstico dos resíduos 2) interpretação dos parâmetros AR e MA 3) avaliação das previsões e incerteza 4) quando usar ARIMA vs outros modelos.`;
    fallback = `ARIMA(${res.p},${res.d},${res.q}): σ=${res.sigma.toFixed(3)}, AIC=${res.aic.toFixed(1)}, Q(${res.lbLags})=${res.ljungBoxQ.toFixed(2)}.`;
  } else if (res.model === 'garch') {
    const hl = isFinite(res.halfLife) ? res.halfLife.toFixed(1) : '> 100';
    prompt = `Você é especialista em finanças quantitativas e modelos de volatilidade. Analise em português (3-4 parágrafos curtos):

Série: ${esc(res.labelY)} | Período: ${esc(res.labelX)}
Modelo ajustado: GARCH(1,1) | n = ${res.n}
ω = ${res.omega.toFixed(6)}, α = ${res.alpha.toFixed(4)}, β = ${res.beta.toFixed(4)}
Persistência (α+β) = ${res.persistence.toFixed(4)} | Meia-vida = ${hl} períodos
σ incondicional (longo prazo) = ${Math.sqrt(res.uncondVar).toFixed(4)}
AIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}
Volatilidade prevista (próx. 3 per.): ${res.sigmaForecast.slice(0, 3).map(v => v.toFixed(4)).join(', ')}

Inclua: 1) clustering de volatilidade e o que a persistência implica 2) interpretação de α (impacto de choques) e β (memória da variância) 3) perspectiva de volatilidade futura 4) quando usar GARCH vs ARIMA.`;
    fallback = `GARCH(1,1): α=${res.alpha.toFixed(3)}, β=${res.beta.toFixed(3)}, persistência=${res.persistence.toFixed(3)}, meia-vida=${hl} períodos.`;
  } else {
    prompt = `Você é especialista em séries temporais. Analise em português (3-4 parágrafos curtos):

Série: ${esc(res.labelY)} | Período: ${esc(res.labelX)}
n = ${res.n} períodos
Tendência: b₀=${res.b0.toFixed(4)}, b₁=${res.b1.toFixed(4)} por período
Média=${res.ym.toFixed(4)}, DP=${res.stdev.toFixed(4)}, CV=${res.cv.toFixed(1)}%
Crescimento médio=${res.avgGrowth.toFixed(2)}% por período
Melhor: ${esc(res.labels[res.maxIdx] || String(res.maxIdx + 1))} (${res.maxVal.toFixed(2)})
Pior: ${esc(res.labels[res.minIdx] || String(res.minIdx + 1))} (${res.minVal.toFixed(2)})
Projeção próximos ${res.futureN} períodos: ${res.projValues.map(v => v.toFixed(2)).join(', ')}

Inclua: 1) direção e força da tendência 2) padrão sazonal 3) perspectivas futuras 4) limitações do modelo.`;
    fallback = `Tendência: ${res.b1 >= 0 ? 'crescente' : 'decrescente'} (${res.b1.toFixed(3)}/período). Cresc. médio: ${res.avgGrowth.toFixed(1)}%. Próx. projeção: ${res.projValues[0]?.toFixed(2) ?? '—'}.`;
  }

  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    box.innerHTML = aiFallbackHTML(fallback);
  }
}

// ─── SAVE / LOAD ──────────────────────────────────────────────────────────────

export async function stSaveAnalysis() {
  if (!stLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  document.getElementById('st-cloud-saving').style.display = 'flex';
  try {
    const res = stLastResult;
    const base = {
      modelo: res.model, labelX: res.labelX, labelY: res.labelY,
      n: res.n, ym: res.ym, stdev: res.stdev, cv: res.cv,
      labels: res.labels, values: res.values, futureN: res.futureN,
    };
    if (res.model === 'classic') {
      Object.assign(base, { b0: res.b0, b1: res.b1, avgGrowth: res.avgGrowth,
        maxVal: res.maxVal, minVal: res.minVal, maxIdx: res.maxIdx, minIdx: res.minIdx,
        windowSize: res.windowSize, projValues: res.projValues });
    } else if (res.model === 'arima') {
      Object.assign(base, { p: res.p, d: res.d, q: res.q,
        phi: res.phi, theta: res.theta, sigma: res.sigma,
        aic: res.aic, bic: res.bic,
        forecastY: res.forecastY, ciLower: res.ciLower, ciUpper: res.ciUpper });
    } else if (res.model === 'garch') {
      Object.assign(base, { omega: res.omega, alpha: res.alpha, beta: res.beta,
        persistence: res.persistence, halfLife: res.halfLife,
        aic: res.aic, bic: res.bic,
        ciLower: res.ciLower, ciUpper: res.ciUpper });
    }
    await saveAnalysisRequest({
      nome: document.getElementById('st-analysis-name').value || 'Série Temporal',
      tipo: 'serie',
      dados: base,
    });
    showToast('Série temporal salva 🚀', 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    showToast('Erro ao salvar: ' + (err.message || err), 'err');
  } finally {
    document.getElementById('st-cloud-saving').style.display = 'none';
  }
}

export async function loadSerieAnalysis(a) {
  const d = a.dados || {};
  switchTab('serie', document.querySelector('.tab-btn[onclick*="serie"]'));
  await new Promise(r => setTimeout(r, 100));
  document.getElementById('st-analysis-name').value = a.nome || '';
  document.getElementById('st-label-y').value = d.labelY || 'Valor';
  document.getElementById('st-label-x').value = d.labelX || 'Período';
  if (d.modelo) stSetModel(d.modelo);
  if (d.windowSize) document.getElementById('st-window').value = d.windowSize;
  if (d.futureN) document.getElementById('st-future').value = d.futureN;
  if (d.p !== undefined) document.getElementById('st-arima-p').value = d.p;
  if (d.d !== undefined) document.getElementById('st-arima-d').value = d.d;
  if (d.q !== undefined) document.getElementById('st-arima-q').value = d.q;
  if (d.labels?.length) {
    document.getElementById('st-data-rows').innerHTML = '';
    d.labels.forEach((lbl, i) => {
      stAddRow();
      const rows = document.getElementById('st-data-rows').children;
      const last = rows[rows.length - 1];
      last.querySelectorAll('input')[0].value = lbl;
      last.querySelectorAll('input')[1].value = d.values[i];
    });
    for (let i = d.labels.length; i < 12; i++) stAddRow();
    stUpdateCount();
  }
  showToast('Série temporal carregada ✏️', 'info');
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export function stExportExcel() {
  if (!stLastResult) return;
  const res = stLastResult;
  const name = document.getElementById('st-analysis-name').value || 'Serie Temporal';
  const wb = XLSX.utils.book_new();

  // ── RAW DATA sheet (model-aware) ──
  let rawHeaders, rawRows;
  if (res.model === 'arima') {
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue), cell('Real', S.hGreen),
      cell('Ajustado', S.hTeal), cell('Resíduo', S.hOrange), cell('Modelo', S.hGray)];
    rawRows = res.values.map((v, i) => {
      const fit = res.fittedOrig[i];
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL),
        cell(v, z ? S.num4 : S.num4Odd), cell(isNaN(fit) ? '' : fit, z ? S.num4 : S.num4Odd),
        cell(isNaN(fit) ? '' : v - fit, z ? S.num4 : S.num4Odd), cell(`ARIMA(${res.p},${res.d},${res.q})`, z ? S.evenL : S.oddL)];
    });
  } else if (res.model === 'garch') {
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue), cell('Real', S.hGreen),
      cell('σ_t', S.hTeal), cell('ε²_t', S.hOrange), cell('z_t', S.hGray)];
    rawRows = res.values.map((v, i) => {
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL),
        cell(v, z ? S.num4 : S.num4Odd), cell(res.sigma[i], z ? S.num4 : S.num4Odd),
        cell(res.eps2[i], z ? S.num4 : S.num4Odd), cell(res.zStd[i], z ? S.num4 : S.num4Odd)];
    });
  } else {
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue), cell('Real', S.hGreen),
      cell('Tendência', S.hTeal), cell('Sazonalidade', S.hOrange), cell('Resíduo', S.hGray)];
    rawRows = res.values.map((v, i) => {
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL),
        cell(v, z ? S.num4 : S.num4Odd), cell(res.trend[i], z ? S.num4 : S.num4Odd),
        cell(res.seasonal[i], z ? S.num4 : S.num4Odd),
        cell(res.residual[i], Math.abs(res.residual[i]) > 2 * res.stdev ? S.warn : (z ? S.num4 : S.num4Odd))];
    });
  }
  const rawWS = buildWS([
    [cell(`📊 RAW DATA — ${name} [${res.model.toUpperCase()}]`, S.title)],
    rawHeaders,
    ...rawRows,
  ], [6, 16, 12, 12, 14, 12]);
  mergeRange(rawWS, 0, 0, 0, 5);
  autoFilter(rawWS, 5, res.values.length + 1);
  XLSX.utils.book_append_sheet(wb, rawWS, 'RAW_DATA');

  // ── FORECAST sheet ──
  const isForecast = res.model !== 'classic';
  const fcValues = res.model === 'classic' ? res.projValues : res.model === 'arima' ? res.forecastY : Array.from({ length: res.futureN }, () => res.mu);
  const ciL = res.ciLower;
  const ciU = res.ciUpper;
  const projLabels = Array.from({ length: res.futureN }, (_, i) => `+${i + 1}`);
  const hasCI = isForecast;

  const fcHeaders = hasCI
    ? [cell('Período', S.hBlue), cell('Previsão', S.hGreen), cell('IC 95% Inf', S.hTeal), cell('IC 95% Sup', S.hOrange), cell('Amplitude IC', S.hGray)]
    : [cell('Período', S.hBlue), cell('Projeção', S.hGreen), cell('Só tendência', S.hTeal), cell('vs Média %', S.hOrange)];

  const fcRows = fcValues.map((v, i) => {
    const z = zebra(i);
    if (hasCI) {
      return [cell(projLabels[i], z ? S.even : S.odd), cell(v, z ? S.num4 : S.num4Odd),
        cell(ciL[i], z ? S.num4 : S.num4Odd), cell(ciU[i], z ? S.num4 : S.num4Odd),
        cell(ciU[i] - ciL[i], z ? S.num4 : S.num4Odd)];
    } else {
      const varPct = res.ym !== 0 ? (v - res.ym) / Math.abs(res.ym) * 100 : '';
      return [cell(projLabels[i], z ? S.even : S.odd), cell(v, z ? S.num4 : S.num4Odd),
        cell(res.projTrend[i], z ? S.num4 : S.num4Odd),
        cell(varPct, { ...(varPct >= 0 ? S.good : S.warn), numFmt: '0.00' })];
    }
  });
  const fcWS = buildWS([[cell(`🔮 FORECAST — ${name}`, S.title)], fcHeaders, ...fcRows], [16, 14, 14, 14, 14]);
  mergeRange(fcWS, 0, 0, 0, 4);
  XLSX.utils.book_append_sheet(wb, fcWS, 'FORECAST');

  // ── KPI sheet ──
  const kpiRows = [{ section: `📌 ${res.model.toUpperCase()}` }, { label: '🏷️ Nome', value: name }];
  if (res.model === 'arima') {
    kpiRows.push(
      { label: '📐 Ordem', value: `ARIMA(${res.p},${res.d},${res.q})` },
      { section: '📊 PARÂMETROS' },
      ...res.phi.map((v, i) => ({ label: `φ${i + 1}`, value: v.toFixed(4) })),
      ...res.theta.map((v, i) => ({ label: `θ${i + 1}`, value: v.toFixed(4) })),
      { section: '📈 QUALIDADE' },
      { label: 'σ', value: res.sigma.toFixed(4) },
      { label: 'AIC', value: res.aic.toFixed(2) },
      { label: 'BIC', value: res.bic.toFixed(2) },
      { label: `Q(${res.lbLags}) Ljung-Box`, value: res.ljungBoxQ.toFixed(2), note: res.ljungBoxQ > 18.3 ? '⚠️ Autocorrelação' : '✅ OK', good: res.ljungBoxQ <= 18.3 },
    );
  } else if (res.model === 'garch') {
    const hl = isFinite(res.halfLife) ? res.halfLife.toFixed(1) : '∞';
    kpiRows.push(
      { section: '📊 PARÂMETROS GARCH(1,1)' },
      { label: 'ω (constante)', value: res.omega.toFixed(6) },
      { label: 'α (ARCH)', value: res.alpha.toFixed(4) },
      { label: 'β (GARCH)', value: res.beta.toFixed(4) },
      { section: '📈 DINÂMICA' },
      { label: 'Persistência (α+β)', value: res.persistence.toFixed(4), note: res.persistence > 0.95 ? '🔴 Alta' : res.persistence > 0.85 ? '🟡 Moderada' : '🟢 Baixa', good: res.persistence <= 0.95 },
      { label: 'Meia-vida do choque', value: hl + ' períodos' },
      { label: 'σ incondicional', value: Math.sqrt(res.uncondVar).toFixed(4) },
      { label: 'AIC', value: res.aic.toFixed(2) },
    );
  } else {
    kpiRows.push(
      { label: '🔢 n', value: res.n }, { label: '🔮 Períodos projetados', value: res.futureN },
      { section: '📊 ESTATÍSTICAS' },
      { label: '📈 Média', value: res.ym.toFixed(4) },
      { label: '📉 Desvio Padrão', value: res.stdev.toFixed(4) },
      { label: '📊 CV (%)', value: res.cv.toFixed(1) + '%', note: res.cv >= 30 ? '🔴 Alta volatilidade' : res.cv >= 15 ? '🟡 Moderada' : '🟢 Baixa', good: res.cv < 15 },
      { label: '📈 Tendência β₁', value: res.b1.toFixed(4), note: res.b1 >= 0 ? '↑ Crescente' : '↓ Decrescente' },
      { label: '📊 Cresc. médio (%)', value: res.avgGrowth.toFixed(2) + '%' },
    );
  }
  XLSX.utils.book_append_sheet(wb, buildKPISheet(kpiRows, name), 'MODEL_KPIs');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + `_${res.model.toUpperCase()}_BI.xlsx`);
}

export function stExportCSV() {
  if (!stLastResult) return;
  const res = stLastResult;
  let header, rows;
  if (res.model === 'arima') {
    header = [res.labelX, res.labelY, 'Ajustado', 'Residuo'];
    rows = res.values.map((v, i) => [res.labels[i], v, isNaN(res.fittedOrig[i]) ? '' : res.fittedOrig[i], isNaN(res.fittedOrig[i]) ? '' : v - res.fittedOrig[i]]);
  } else if (res.model === 'garch') {
    header = [res.labelX, res.labelY, 'sigma_t', 'eps2_t', 'z_t'];
    rows = res.values.map((v, i) => [res.labels[i], v, res.sigma[i], res.eps2[i], res.zStd[i]]);
  } else {
    header = [res.labelX, res.labelY, 'Tendencia', 'Sazonalidade', 'Residuo'];
    rows = res.values.map((v, i) => [res.labels[i], v, res.trend[i], res.seasonal[i], res.residual[i]]);
  }
  downloadCSV((document.getElementById('st-analysis-name').value || 'serie') + '.csv', header, rows);
}
