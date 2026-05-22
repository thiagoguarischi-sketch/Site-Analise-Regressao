// Distribuições e funções matemáticas usadas no frontend.
// O cálculo estatístico pesado das regressões roda no backend (BFF /analyze);
// aqui ficam apenas as funções ainda necessárias na renderização do cliente:
// tQ/tCDF (intervalos de confiança), normalQ (Q-Q plot) e sigmoid (predição
// logística).

export function tCDF(t, df) {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

export function tQ(p, df) {
  let t = 2;
  for (let i = 0; i < 100; i++) {
    const f = tCDF(t, df) - p;
    const fp = Math.exp(-0.5 * (Math.log(df) + Math.log(1 + t * t / df) * (df + 1)) - logBeta(0.5, df / 2)) / Math.sqrt(df);
    t -= f / fp;
  }
  return t;
}

export function logBeta(a, b) {
  return lgamma(a) + lgamma(b) - lgamma(a + b);
}

export function lgamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -5.395239384953e-6];
  let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t);
  let s = 1.000000000190015;
  for (let j = 0; j < 6; j++) s += c[j] / ++y;
  return -t + Math.log(2.5066282746310005 * s / x);
}

export function incompleteBeta(x, a, b) {
  if (x < 0 || x > 1) return 0;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = logBeta(a, b);
  const bt = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta);
  if (x < (a + 1) / (a + b + 2)) return bt * betaCF(x, a, b) / a;
  return 1 - bt * betaCF(1 - x, b, a) / b;
}

export function betaCF(x, a, b) {
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

export function normalQ(p) {
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

export function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t * 0.254829592 * Math.exp(-x * x);
  return Math.sign(x) * y;
}

export function sigmoid(z) {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
}
