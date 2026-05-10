'use strict';

const { mean, sum, pinball, pinballGrad } = require('./utils');

function qrOLSInit(xs, ys) {
  const xm = mean(xs), ym = mean(ys);
  const Sxx = sum(xs.map(x => (x - xm) ** 2));
  const Sxy = sum(xs.map((x, i) => (x - xm) * (ys[i] - ym)));
  const b1 = Sxy / (Sxx || 1);
  const b0 = ym - b1 * xm;
  return [b0, b1];
}

function qrStandardize(arr) {
  const m = mean(arr);
  const s = Math.sqrt(sum(arr.map(v => (v - m) ** 2)) / arr.length) || 1;
  return { normalized: arr.map(v => (v - m) / s), m, s };
}

function computeQuantileCoefs(xs, ys, tau, lr, maxIter, tol) {
  const { normalized: xsN, m: xm, s: xs_std } = qrStandardize(xs);
  const { normalized: ysN, m: ym, s: ys_std } = qrStandardize(ys);

  let [b0, b1] = qrOLSInit(xsN, ysN);
  let prevLoss = Infinity;
  let currentLr = lr;
  let noImprovCount = 0;
  const n = xs.length;

  for (let iter = 0; iter < maxIter; iter++) {
    let g0 = 0, g1 = 0, totalLoss = 0;
    for (let i = 0; i < n; i++) {
      const u = ysN[i] - (b0 + b1 * xsN[i]);
      const g = pinballGrad(u, tau);
      g0 -= g;
      g1 -= g * xsN[i];
      totalLoss += pinball(u, tau);
    }
    totalLoss /= n; g0 /= n; g1 /= n;
    b0 -= currentLr * g0;
    b1 -= currentLr * g1;

    if (totalLoss < prevLoss - tol) {
      noImprovCount = 0;
    } else {
      noImprovCount++;
      if (noImprovCount >= 50) {
        currentLr *= 0.5;
        noImprovCount = 0;
        if (currentLr < 1e-12) break;
      }
    }
    if (Math.abs(prevLoss - totalLoss) < tol && iter > 100) break;
    prevLoss = totalLoss;
  }

  const b1_orig = b1 * ys_std / xs_std;
  const b0_orig = ym + ys_std * b0 - b1_orig * xm;
  return { b0: b0_orig, b1: b1_orig, finalLoss: prevLoss };
}

function computeAllQuantiles(xs, ys, taus, lr, maxIter, tol) {
  const n = xs.length;
  const results = {};
  for (const tau of taus) {
    const { b0, b1 } = computeQuantileCoefs(xs, ys, tau, lr, maxIter, tol);
    const yhat = xs.map(x => b0 + b1 * x);
    const resid = ys.map((y, i) => y - yhat[i]);
    const maeVal = sum(resid.map(r => Math.abs(r))) / n;
    const pl = sum(resid.map(r => pinball(r, tau))) / n;
    const coverage = resid.filter(r => r <= 0).length / n;
    results[tau] = { tau, b0, b1, yhat, resid, mae: maeVal, pinballLoss: pl, coverage };
  }
  return results;
}

module.exports = { computeQuantileCoefs, computeAllQuantiles, qrOLSInit, qrStandardize };
