'use strict';

const { mean, sum } = require('./utils');

function lgamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -5.395239384953e-6];
  let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t);
  let s = 1.000000000190015;
  for (let j = 0; j < 6; j++) s += c[j] / ++y;
  return -t + Math.log(2.5066282746310005 * s / x);
}

function logBeta(a, b) {
  return lgamma(a) + lgamma(b) - lgamma(a + b);
}

function betaCF(x, a, b) {
  const MAXIT = 200, EPS = 3e-7;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d; let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    let m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; let del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function incompleteBeta(x, a, b) {
  if (x < 0 || x > 1) return 0;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = logBeta(a, b);
  const bt = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta);
  if (x < (a + 1) / (a + b + 2)) return bt * betaCF(x, a, b) / a;
  return 1 - bt * betaCF(1 - x, b, a) / b;
}

function tCDF(t, df) {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

function tQ(p, df) {
  let t = 2;
  for (let i = 0; i < 100; i++) {
    const f = tCDF(t, df) - p;
    const fp = Math.exp(-0.5 * (Math.log(df) + Math.log(1 + t * t / df) * (df + 1)) - logBeta(0.5, df / 2)) / Math.sqrt(df);
    t -= f / fp;
  }
  return t;
}

function fCDF(f, d1, d2) {
  const x = d2 / (d2 + d1 * f);
  return incompleteBeta(x, d2 / 2, d1 / 2);
}

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t * 0.254829592 * Math.exp(-x * x);
  return Math.sign(x) * y;
}

function normalQ(p) {
  if (p <= 0) return -5;
  if (p >= 1) return 5;
  let x = 0;
  for (let i = 0; i < 50; i++) {
    const fx = 0.5 * (1 + erf(x / Math.sqrt(2))) - p;
    const fpx = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    x -= fx / fpx;
  }
  return x;
}

function regularizedGamma(a, x) {
  let s = 1 / a, t = s;
  for (let n = 1; n < 200; n++) { t *= x / (a + n); s += t; if (Math.abs(t) < 1e-10) break; }
  return s * Math.exp(-x + a * Math.log(x) - lgamma(a));
}

function chiCDF(x, k) {
  return regularizedGamma(k / 2, x / 2);
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
}

function shapiroWilk(x) {
  const n = x.length;
  if (n < 3) return { W: 1, p: 1 };
  const xs = [...x].sort((a, b) => a - b);
  const xm = mean(xs);
  const SS = sum(xs.map(v => (v - xm) ** 2));
  const m = xs.map((_, i) => normalQ((i + 1 - 0.375) / (n + 0.25)));
  const c = Math.sqrt(sum(m.map(v => v ** 2)));
  const mn = m.map(v => v / c);
  let num = 0;
  for (let i = 0; i < Math.floor(n / 2); i++) num += mn[n - 1 - i] * (xs[n - 1 - i] - xs[i]);
  const W = num ** 2 / SS;
  const mu = -1.2725 + 1.0521 * Math.log(n);
  const sigma = 1.0308 - 0.26763 * Math.log(n);
  const z = (Math.log(1 - Math.min(W, 0.9999)) - mu) / sigma;
  const p = 1 - 0.5 * (1 + erf(z / Math.sqrt(2)));
  return { W: Math.max(0, Math.min(1, W)), p: Math.max(0, Math.min(1, p)) };
}

function breuschPagan(xs, resids) {
  const n = xs.length;
  const e2 = resids.map(r => r ** 2);
  const e2m = mean(e2);
  const xm = mean(xs);
  const Sxx = sum(xs.map(x => (x - xm) ** 2));
  const Sxy = sum(xs.map((x, i) => (x - xm) * (e2[i] - e2m)));
  const b1 = Sxy / Sxx, b0 = e2m - b1 * xm;
  const fitted = xs.map(x => b0 + b1 * x);
  const SSR = sum(fitted.map(f => (f - e2m) ** 2));
  const SSE = sum(e2.map((e, i) => (e - fitted[i]) ** 2));
  const R2 = SSR / (SSR + SSE);
  const LM = n * R2;
  const p = 1 - chiCDF(LM, 1);
  return { stat: LM, p };
}

module.exports = {
  tCDF, tQ, fCDF, erf, normalQ, lgamma, logBeta, incompleteBeta, betaCF,
  regularizedGamma, chiCDF, sigmoid, shapiroWilk, breuschPagan,
};
