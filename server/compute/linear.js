'use strict';

const { mean, sum } = require('./utils');
const { tCDF, tQ, fCDF } = require('./statistics');
const { matMul, matT, matInv } = require('./matrix');

function compute(xs, ys) {
  const n = xs.length;
  const xm = mean(xs), ym = mean(ys);
  const Sxx = sum(xs.map(x => (x - xm) ** 2));
  const Sxy = sum(xs.map((x, i) => (x - xm) * (ys[i] - ym)));
  const b1 = Sxy / Sxx, b0 = ym - b1 * xm;
  const yhat = xs.map(x => b0 + b1 * x);
  const resid = ys.map((y, i) => y - yhat[i]);
  const SSR = sum(yhat.map(yh => (yh - ym) ** 2));
  const SSE = sum(resid.map(r => r ** 2));
  const SST = SSR + SSE;
  const r2 = SSR / SST;
  const r2adj = 1 - (1 - r2) * (n - 1) / (n - 2);
  const r = Math.sign(b1) * Math.sqrt(r2);
  const se = Math.sqrt(SSE / (n - 2));
  const MSR = SSR, MSE = SSE / (n - 2);
  const Fstat = MSR / MSE;
  const pF = 1 - fCDF(Fstat, 1, n - 2);

  const se_b1 = se / Math.sqrt(Sxx);
  const se_b0 = se * Math.sqrt(sum(xs.map(x => x ** 2)) / (n * Sxx));
  const t_b1 = b1 / se_b1, t_b0 = b0 / se_b0;
  const p_b1 = 2 * (1 - tCDF(Math.abs(t_b1), n - 2));
  const p_b0 = 2 * (1 - tCDF(Math.abs(t_b0), n - 2));
  const t95 = tQ(0.975, n - 2);

  const hi = xs.map(x => 1 / n + (x - xm) ** 2 / Sxx);
  const resid_std = resid.map((r, i) => r / (se * Math.sqrt(1 - hi[i])));
  const cooks_d = resid.map((r, i) => (r ** 2 * hi[i]) / (2 * MSE * (1 - hi[i]) ** 2));

  return {
    xs, ys, n, b0, b1, r, r2, r2adj, se, SSR, SSE, SST,
    MSR, MSE, Fstat, pF, se_b1, se_b0, t_b1, t_b0, p_b1, p_b0,
    t95, yhat, resid, resid_std, hi, cooks_d, Sxx, xm, ym,
  };
}

function computeVIF_R2(xi, others, n) {
  const Xmat = xi.map((_, i) => [1, ...others.map(o => o[i])]);
  const Xt = matT(Xmat);
  const inv = matInv(matMul(Xt, Xmat));
  if (!inv) return 0;
  const beta = matMul(inv, matMul(Xt, xi.map(v => [v]))).map(r => r[0]);
  const yhat = Xmat.map(row => row.reduce((s, v, j) => s + v * beta[j], 0));
  const ym = mean(xi);
  const SSR = sum(yhat.map(yh => (yh - ym) ** 2));
  const SST = sum(xi.map(v => (v - ym) ** 2));
  return SST > 0 ? SSR / SST : 0;
}

function computeMultiple(Xs, Y) {
  const n = Y.length;
  const k = Xs.length;
  const Xmat = Y.map((_, i) => [1, ...Xs.map(x => x[i])]);
  const Xt = matT(Xmat);
  const XtX = matMul(Xt, Xmat);
  const XtXinv = matInv(XtX);
  if (!XtXinv) return null;

  const XtY = matMul(Xt, Y.map(y => [y]));
  const beta = matMul(XtXinv, XtY).map(r => r[0]);

  const yhat = Xmat.map(row => row.reduce((s, v, j) => s + v * beta[j], 0));
  const resid = Y.map((y, i) => y - yhat[i]);
  const ym = mean(Y);

  const SSE = sum(resid.map(r => r ** 2));
  const SST = sum(Y.map(y => (y - ym) ** 2));
  const SSR = SST - SSE;
  const r2 = SSR / SST;
  const r2adj = 1 - (1 - r2) * (n - 1) / (n - k - 1);
  const MSE = SSE / (n - k - 1);
  const MSR = SSR / k;
  const Fstat = MSR / MSE;
  const pF = 1 - fCDF(Fstat, k, n - k - 1);
  const se = Math.sqrt(MSE);

  const se_beta = beta.map((_, j) => se * Math.sqrt(XtXinv[j][j]));
  const t_beta = beta.map((b, j) => b / se_beta[j]);
  const df_resid = n - k - 1;
  const p_beta = t_beta.map(t => 2 * (1 - tCDF(Math.abs(t), df_resid)));
  const t_crit = tQ(0.975, df_resid);
  const ci_lo = beta.map((b, j) => b - t_crit * se_beta[j]);
  const ci_hi = beta.map((b, j) => b + t_crit * se_beta[j]);

  const hi = Xmat.map(row => {
    const rv = [row];
    const rvt = matT(rv);
    const M = matMul(matMul(rv, XtXinv), rvt);
    return Math.min(M[0][0], 0.9999);
  });
  const resid_std = resid.map((r, i) => r / (se * Math.sqrt(Math.max(1e-10, 1 - hi[i]))));

  const vif = Xs.map((xi, idx) => {
    const others = Xs.filter((_, j) => j !== idx);
    if (others.length === 0) return 1;
    const r2i = computeVIF_R2(xi, others, n);
    return r2i >= 0.9999 ? 9999 : 1 / (1 - r2i);
  });

  return {
    n, k, beta, se_beta, t_beta, p_beta, ci_lo, ci_hi,
    r2, r2adj, se, SSR, SSE, SST, MSR, MSE, Fstat, pF,
    yhat, resid, resid_std, hi, vif, df_resid, t_crit, ym,
  };
}

module.exports = { compute, computeMultiple, computeVIF_R2 };
