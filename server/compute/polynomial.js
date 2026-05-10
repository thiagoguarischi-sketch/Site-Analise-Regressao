'use strict';

const { mean, sum } = require('./utils');
const { tCDF, tQ, fCDF } = require('./statistics');
const { matMul, matT, matInv } = require('./matrix');

function vandermonde(xs, degree) {
  return xs.map(x => Array.from({ length: degree + 1 }, (_, j) => Math.pow(x, j)));
}

function computePolynomial(xs, ys, degree) {
  const n = xs.length;
  const Xmat = vandermonde(xs, degree);
  const Xt = matT(Xmat);
  const XtX = matMul(Xt, Xmat);
  const XtXinv = matInv(XtX);
  if (!XtXinv) return null;

  const XtY = matMul(Xt, ys.map(y => [y]));
  const beta = matMul(XtXinv, XtY).map(r => r[0]);

  const yhat = Xmat.map(row => row.reduce((s, v, j) => s + v * beta[j], 0));
  const resid = ys.map((y, i) => y - yhat[i]);
  const ym = mean(ys);

  const SSE = sum(resid.map(r => r ** 2));
  const SST = sum(ys.map(y => (y - ym) ** 2));
  const SSR = SST - SSE;
  const r2 = Math.max(0, Math.min(1, SSR / SST));
  const df_resid = n - degree - 1;
  const df_reg = degree;
  const r2adj = 1 - (1 - r2) * (n - 1) / Math.max(1, df_resid);
  const MSE = SSE / Math.max(1, df_resid);
  const MSR = SSR / df_reg;
  const Fstat = MSR / Math.max(1e-15, MSE);
  const pF = 1 - fCDF(Fstat, df_reg, df_resid);
  const se = Math.sqrt(MSE);

  const se_beta = beta.map((_, j) => se * Math.sqrt(Math.max(0, XtXinv[j][j])));
  const t_beta  = beta.map((b, j) => b / Math.max(1e-15, se_beta[j]));
  const p_beta  = t_beta.map(t => 2 * (1 - tCDF(Math.abs(t), df_resid)));
  const t_crit  = tQ(0.975, df_resid);
  const ci_lo   = beta.map((b, j) => b - t_crit * se_beta[j]);
  const ci_hi   = beta.map((b, j) => b + t_crit * se_beta[j]);

  const hi = Xmat.map(row => {
    const rv = [row];
    const M  = matMul(matMul(rv, XtXinv), matT(rv));
    return Math.min(M[0][0], 0.9999);
  });
  const resid_std = resid.map((r, i) => r / (se * Math.sqrt(Math.max(1e-10, 1 - hi[i]))));

  return {
    n, degree, beta, se_beta, t_beta, p_beta, ci_lo, ci_hi,
    r2, r2adj, se, SSR, SSE, SST, MSR, MSE, Fstat, pF,
    yhat, resid, resid_std, hi, df_resid, df_reg, t_crit, ym,
  };
}

module.exports = { computePolynomial };
