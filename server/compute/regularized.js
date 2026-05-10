'use strict';

function rrStd(arr) {
  const m = arr.reduce((s, v) => s + v, 0) / arr.length;
  const s = Math.sqrt(arr.reduce((ss, v) => ss + (v - m) ** 2, 0) / arr.length) || 1;
  return { norm: arr.map(v => (v - m) / s), mean: m, std: s };
}

function computeRidge(xs, ys, lambda) {
  const { norm: xN, mean: xm, std: xs_std } = rrStd(xs);
  const { norm: yN, mean: ym, std: ys_std } = rrStd(ys);

  const sxy = xN.reduce((s, x, i) => s + x * yN[i], 0);
  const sxx = xN.reduce((s, x) => s + x * x, 0);
  const b1N = sxy / (sxx + lambda);

  const b1 = b1N * ys_std / xs_std;
  const b0 = ym - b1 * xm;

  const yhat = xs.map(x => b0 + b1 * x);
  const resid = ys.map((y, i) => y - yhat[i]);
  const sse = resid.reduce((s, r) => s + r ** 2, 0);
  const sst = ys.reduce((s, y) => s + (y - ym) ** 2, 0);
  const r2 = Math.max(0, 1 - sse / sst);

  return { b0, b1, yhat, resid, r2, sse, lambda, method: 'Ridge' };
}

function computeLasso(xs, ys, lambda, lr, maxIter, tol) {
  const n = xs.length;
  const { norm: xN, mean: xm, std: xs_std } = rrStd(xs);
  const { norm: yN, mean: ym, std: ys_std } = rrStd(ys);

  let b0 = 0, b1 = 0;
  let prevLoss = Infinity;

  for (let iter = 0; iter < maxIter; iter++) {
    let g0 = 0, g1 = 0, loss = 0;
    for (let i = 0; i < n; i++) {
      const r = yN[i] - (b0 + b1 * xN[i]);
      g0 -= r;
      g1 -= r * xN[i];
      loss += r * r;
    }
    g0 = (2 * g0) / n;
    g1 = (2 * g1) / n + lambda * (b1 > 0 ? 1 : b1 < 0 ? -1 : 0);

    b0 -= lr * g0;
    b1 -= lr * g1;

    const sxy2 = xN.reduce((s, x, i) => s + x * (yN[i] - b0), 0);
    const sxx2 = xN.reduce((s, x) => s + x * x, 0);
    const rawB1 = sxy2 / sxx2;
    const thresh = lambda / (2 * sxx2 / n);
    if (Math.abs(rawB1) <= thresh) b1 = 0;
    else b1 = rawB1 - Math.sign(rawB1) * thresh;

    if (Math.abs(prevLoss - loss) < tol && iter > 100) break;
    prevLoss = loss;
  }

  const b1_orig = b1 * ys_std / xs_std;
  const b0_orig = ym - b1_orig * xm;

  const yhat = xs.map(x => b0_orig + b1_orig * x);
  const resid = ys.map((y, i) => y - yhat[i]);
  const sse = resid.reduce((s, r) => s + r ** 2, 0);
  const ym2 = ys.reduce((s, v) => s + v, 0) / n;
  const r2 = Math.max(0, 1 - sse / (ys.reduce((s, y) => s + (y - ym2) ** 2, 0)));

  return { b0: b0_orig, b1: b1_orig, yhat, resid, r2, sse, lambda, method: 'Lasso' };
}

function computeOLS_rr(xs, ys) {
  const n = xs.length;
  const xm = xs.reduce((s, v) => s + v, 0) / n;
  const ym = ys.reduce((s, v) => s + v, 0) / n;
  const Sxx = xs.reduce((s, x) => s + (x - xm) ** 2, 0);
  const Sxy = xs.reduce((s, x, i) => s + (x - xm) * (ys[i] - ym), 0);
  const b1 = Sxy / Sxx, b0 = ym - b1 * xm;
  const yhat = xs.map(x => b0 + b1 * x);
  const sse = ys.reduce((s, y, i) => s + (y - yhat[i]) ** 2, 0);
  const sst = ys.reduce((s, y) => s + (y - ym) ** 2, 0);
  return { b0, b1, yhat, r2: 1 - sse / sst, method: 'OLS (baseline)' };
}

function rrLambdaSweep(xs, ys, type, lr, iters, tol) {
  const lambdas = [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 20, 50, 100];
  return lambdas.map(lam => {
    const res = type === 'lasso'
      ? computeLasso(xs, ys, lam, lr, iters, tol)
      : computeRidge(xs, ys, lam);
    return { lambda: lam, b1: res.b1, r2: res.r2 };
  });
}

module.exports = { rrStd, computeRidge, computeLasso, computeOLS_rr, rrLambdaSweep };
