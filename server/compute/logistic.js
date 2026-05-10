'use strict';

const { mean, sum } = require('./utils');
const { sigmoid, erf, chiCDF } = require('./statistics');
const { matInv } = require('./matrix');

function confMatrix(Y, predY) {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  Y.forEach((y, i) => {
    if (y === 1 && predY[i] === 1) tp++;
    else if (y === 0 && predY[i] === 0) tn++;
    else if (y === 0 && predY[i] === 1) fp++;
    else fn++;
  });
  const acc = (tp + tn) / (tp + tn + fp + fn);
  const prec = tp / (tp + fp) || 0;
  const rec = tp / (tp + fn) || 0;
  const f1 = prec + rec > 0 ? 2 * prec * rec / (prec + rec) : 0;
  const spec = tn / (tn + fp) || 0;
  return { tp, tn, fp, fn, acc, prec, rec, f1, spec };
}

function computeAUC(Y, probs) {
  const sorted = probs.map((p, i) => ({ p, y: Y[i] })).sort((a, b) => b.p - a.p);
  const nPos = sum(Y), nNeg = Y.length - nPos;
  if (!nPos || !nNeg) return 0.5;
  let tpCount = 0, fpCount = 0, auc = 0, prevFp = 0, prevTp = 0;
  sorted.forEach(({ y }) => {
    if (y === 1) tpCount++;
    else { fpCount++; auc += (tpCount + prevTp) / 2 * (fpCount - prevFp); prevFp = fpCount; prevTp = tpCount; }
  });
  return auc / (nPos * nNeg);
}

function computeLogistic(Xs, Y) {
  const n = Y.length;
  const k = Xs.length;
  const Xmat = Y.map((_, i) => [1, ...Xs.map(x => x[i])]);
  const p = k + 1;

  const means = Xs.map(xi => mean(xi));
  const stds  = Xs.map(xi => { const m = mean(xi); return Math.sqrt(sum(xi.map(v => (v - m) ** 2)) / (xi.length - 1)) || 1; });
  const Xstd  = Y.map((_, i) => [1, ...Xs.map((xi, j) => (xi[i] - means[j]) / stds[j])]);

  let beta = new Array(p).fill(0);
  const lr = 0.1, maxIter = 2000, tol = 1e-7;

  for (let iter = 0; iter < maxIter; iter++) {
    const grad = new Array(p).fill(0);
    let loss = 0;
    for (let i = 0; i < n; i++) {
      const z = Xstd[i].reduce((s, v, j) => s + v * beta[j], 0);
      const phat = sigmoid(z);
      const err = phat - Y[i];
      loss -= Y[i] * Math.log(phat + 1e-15) + (1 - Y[i]) * Math.log(1 - phat + 1e-15);
      for (let j = 0; j < p; j++) grad[j] += err * Xstd[i][j];
    }
    const maxGrad = Math.max(...grad.map(Math.abs));
    if (maxGrad < tol) break;
    for (let j = 0; j < p; j++) beta[j] -= lr * grad[j] / n;
  }

  const betaOrig = new Array(p).fill(0);
  betaOrig[0] = beta[0];
  for (let j = 1; j < p; j++) {
    betaOrig[j] = beta[j] / stds[j - 1];
    betaOrig[0] -= beta[j] * means[j - 1] / stds[j - 1];
  }

  const probs = Xmat.map(row => sigmoid(row.reduce((s, v, j) => s + v * betaOrig[j], 0)));
  const predY = probs.map(p => p >= 0.5 ? 1 : 0);

  const devResid = Y.map((y, i) => {
    const pp = probs[i];
    const sign = y === 1 ? 1 : -1;
    const d = y === 1 ? -2 * Math.log(pp + 1e-15) : -2 * Math.log(1 - pp + 1e-15);
    return sign * Math.sqrt(Math.max(0, d));
  });

  const llFull = -sum(Y.map((y, i) => y * Math.log(probs[i] + 1e-15) + (1 - y) * Math.log(1 - probs[i] + 1e-15)));
  const pNull = mean(Y);
  const llNull = -n * (pNull * Math.log(pNull + 1e-15) + (1 - pNull) * Math.log(1 - pNull + 1e-15));
  const deviance = 2 * llFull;
  const nullDeviance = 2 * llNull;
  const mcFaddenR2 = 1 - llFull / llNull;
  const chiStat = 2 * (llNull - llFull);
  const pChi = 1 - chiCDF(chiStat, k);

  const W = probs.map(p => p * (1 - p));
  const XtWX = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) =>
    sum(Xmat.map((row, r) => row[i] * W[r] * row[j]))));
  const invXtWX = matInv(XtWX);
  const seBeta = invXtWX
    ? betaOrig.map((_, j) => Math.sqrt(Math.max(0, invXtWX[j][j])))
    : new Array(p).fill(NaN);
  const zStat = betaOrig.map((b, j) => b / (seBeta[j] || 1));
  const pZ = zStat.map(z => 2 * (1 - 0.5 * (1 + erf(Math.abs(z) / Math.sqrt(2)))));
  const z95 = 1.959964;
  const ciLo = betaOrig.map((b, j) => b - z95 * seBeta[j]);
  const ciHi = betaOrig.map((b, j) => b + z95 * seBeta[j]);
  const or = betaOrig.map(b => Math.exp(b));
  const orLo = ciLo.map(b => Math.exp(b));
  const orHi = ciHi.map(b => Math.exp(b));

  const cm = confMatrix(Y, predY);
  const auc = computeAUC(Y, probs);

  const aic = 2 * p + 2 * llFull;
  const bic = Math.log(n) * p + 2 * llFull;

  return {
    n, k, beta: betaOrig, seBeta, zStat, pZ, ciLo, ciHi,
    or, orLo, orHi, probs, predY, devResid,
    llFull, llNull, deviance, nullDeviance,
    mcFaddenR2, chiStat, pChi, aic, bic,
    cm, auc,
  };
}

module.exports = { computeLogistic, confMatrix, computeAUC };
