'use strict';

const { mean, sum } = require('./utils');
const { matMul, matT, matInv, matLogDet } = require('./matrix');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

function olsVec(X, Y) {
  if (!X.length || !X[0].length) return [];
  const Xt = matT(X);
  const XtX = matMul(Xt, X);
  const XtY = matMul(Xt, Y.map(v => [v]));
  const inv = matInv(XtX);
  if (!inv) return new Array(X[0].length).fill(0);
  return matMul(inv, XtY).map(r => r[0]);
}

function polyMul(a, b) {
  const res = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) res[i + j] += a[i] * b[j];
  return res;
}

// Nelder-Mead minimization (used by GARCH)
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

// Chi-squared p-value approximation (used by VAR Granger causality)
function chi2pval(x, df) {
  if (x <= 0 || df <= 0) return 1;
  const mu = 1 - 2 / (9 * df);
  const sigma = Math.sqrt(2 / (9 * df));
  const z = (Math.cbrt(x / df) - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const p = 0.3989422820 * Math.exp(-0.5 * z * z) *
    t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z >= 0 ? p : 1 - p;
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

  const { w, lastVals } = difference(values, d);
  const nw = w.length;

  // Hannan-Rissanen: high-order auxiliary AR for proxy residuals
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

  const ll = nEff > 0 && sigma2 > 0
    ? -nEff / 2 * (Math.log(2 * Math.PI) + Math.log(sigma2) + 1)
    : 0;
  const kParams = p + q + (d > 0 ? 1 : 0);
  const aic = -2 * ll + 2 * kParams;
  const bic = -2 * ll + kParams * Math.log(Math.max(nEff, 1));

  let phi_poly = [1];
  for (let i = 0; i < d; i++) phi_poly = polyMul(phi_poly, [1, -1]);
  phi_poly = polyMul(phi_poly, [1, ...phi.map(v => -v)]);
  const bigPhi = phi_poly.slice(1).map(v => -v);

  const psi = [1];
  for (let j = 1; j <= futureN; j++) {
    let psij = j <= q ? (theta[j - 1] || 0) : 0;
    for (let i = 1; i <= Math.min(j, bigPhi.length); i++) psij += bigPhi[i - 1] * (psi[j - i] || 0);
    psi.push(psij);
  }
  const cumPsi2 = [];
  let csum = 0;
  for (let h = 0; h < futureN; h++) { csum += psi[h] ** 2; cumPsi2.push(csum); }

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

  const forecastY = undifference(forecastW, lastVals, d);
  const ciHalf = cumPsi2.map(v => 1.96 * sigma * Math.sqrt(v));
  const ciLower = forecastY.map((v, h) => v - ciHalf[h]);
  const ciUpper = forecastY.map((v, h) => v + ciHalf[h]);

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

  function hSeries(om, al, be) {
    const h = new Array(n);
    h[0] = varEps;
    for (let t = 1; t < n; t++) {
      h[t] = om + al * eps2[t - 1] + be * h[t - 1];
      if (!isFinite(h[t]) || h[t] <= 0) h[t] = varEps;
    }
    return h;
  }

  function negLogLik(params) {
    const [om, al, be] = params;
    if (om <= 1e-10 || al < 0 || be < 0 || al + be >= 0.9999) return 1e10;
    const h = hSeries(om, al, be);
    let ll = 0;
    for (let t = 0; t < n; t++) ll += Math.log(h[t]) + eps2[t] / h[t];
    return isFinite(ll) ? ll / 2 : 1e10;
  }

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
  const aic = -2 * ll + 2 * 3;
  const bic = -2 * ll + 3 * Math.log(n);

  const zStd = eps.map((e, t) => sigma[t] > 1e-10 ? e / sigma[t] : 0);

  const hT = h[n - 1];
  const hForecast = Array.from({ length: futureN }, (_, k) =>
    persistence < 1
      ? uncondVar + persistence ** (k + 1) * (hT - uncondVar)
      : hT
  );
  const sigmaForecast = hForecast.map(v => Math.sqrt(Math.max(0, v)));
  const ciLower = sigmaForecast.map(s => mu - 1.96 * s);
  const ciUpper = sigmaForecast.map(s => mu + 1.96 * s);

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

// ─── MODEL: VAR(p) ───────────────────────────────────────────────────────────

function varCompute(matrix, labelsList, p, futureN, varNamesParam) {
  const T = matrix.length;
  const k = matrix[0].length;
  const m = k * p + 1;
  const nObs = T - p;

  if (nObs < m + 1) return null;

  const Z = [], Y_mat = [];
  for (let t = p; t < T; t++) {
    const zt = [];
    for (let l = 1; l <= p; l++) for (let j = 0; j < k; j++) zt.push(matrix[t - l][j]);
    zt.push(1);
    Z.push(zt);
    Y_mat.push([...matrix[t]]);
  }

  const ZT = matT(Z);
  const ZTZ_inv = matInv(matMul(ZT, Z));
  if (!ZTZ_inv) return null;
  const B = matMul(ZTZ_inv, matMul(ZT, Y_mat));

  const A = Array.from({ length: p }, (_, l) =>
    Array.from({ length: k }, (_, i) =>
      Array.from({ length: k }, (_, j) => B[l * k + j][i])
    )
  );
  const cVec = Array.from({ length: k }, (_, i) => B[m - 1][i]);

  const Yhat = matMul(Z, B);
  const E = Y_mat.map((row, t) => row.map((v, j) => v - Yhat[t][j]));

  const dof = nObs - m;
  const ETE = matMul(matT(E), E);
  const Sigma = ETE.map(row => row.map(v => v / dof));

  const logDetSigma = matLogDet(Sigma);
  const nParams = k * k * p + k;
  const aic = logDetSigma + 2 * nParams / nObs;
  const bic = logDetSigma + Math.log(nObs) * nParams / nObs;

  const H = futureN + 10;
  const Ik = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => +(i === j)));
  const Phi = [Ik];
  for (let h = 1; h <= H; h++) {
    const Ph = Array.from({ length: k }, () => new Array(k).fill(0));
    for (let l = 1; l <= Math.min(h, p); l++) {
      const Al = A[l - 1], Phhl = Phi[h - l];
      for (let i = 0; i < k; i++)
        for (let j = 0; j < k; j++)
          for (let r = 0; r < k; r++) Ph[i][j] += Al[i][r] * Phhl[r][j];
    }
    Phi.push(Ph);
  }

  const history = matrix.slice(T - p).map(r => [...r]);
  const forecast = [];
  for (let h = 0; h < futureN; h++) {
    const yhat = [...cVec];
    for (let l = 0; l < p; l++) {
      const Yl = history[history.length - 1 - l];
      for (let i = 0; i < k; i++)
        for (let j = 0; j < k; j++) yhat[i] += A[l][i][j] * Yl[j];
    }
    forecast.push(yhat);
    history.push([...yhat]);
  }

  const granger = [];
  for (let i = 0; i < k; i++) {
    const RSS_U = E.reduce((s, row) => s + row[i] ** 2, 0);
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const keepCols = [];
      for (let c = 0; c < m - 1; c++) if (c % k !== j) keepCols.push(c);
      keepCols.push(m - 1);
      const ZR = Z.map(row => keepCols.map(c => row[c]));
      const ZRT = matT(ZR);
      const ZRTZRinv = matInv(matMul(ZRT, ZR));
      let fStat = NaN, pval = NaN, sig = '';
      if (ZRTZRinv) {
        const yi = Y_mat.map(row => [row[i]]);
        const BR = matMul(ZRTZRinv, matMul(ZRT, yi));
        const YRhat = matMul(ZR, BR);
        const RSS_R = yi.reduce((s, [v], t) => s + (v - YRhat[t][0]) ** 2, 0);
        fStat = ((RSS_R - RSS_U) / p) / (RSS_U / dof);
        const W = p * fStat;
        pval = chi2pval(W, p);
        sig = pval < 0.01 ? '***' : pval < 0.05 ? '**' : pval < 0.10 ? '*' : '';
      }
      granger.push({ from: j, to: i, fStat, pval, sig });
    }
  }

  const ymArr = Array.from({ length: k }, (_, j) => mean(matrix.map(r => r[j])));
  const sdArr = Array.from({ length: k }, (_, j) => {
    const mj = ymArr[j];
    return Math.sqrt(sum(matrix.map(r => (r[j] - mj) ** 2)) / T);
  });

  const varNames = (varNamesParam && varNamesParam.length >= k)
    ? varNamesParam.slice(0, k)
    : Array.from({ length: k }, (_, i) => `V${i + 1}`);

  return {
    model: 'var', k, p, T, nObs, dof, labelsList, futureN,
    matrix, forecast, Phi, A, cVec, Sigma,
    aic, bic, granger, E, Yhat,
    ymArr, sdArr, varNames,
  };
}

module.exports = {
  stCompute, arimaCompute, garchCompute, varCompute,
  computeACF, computePACF,
};
