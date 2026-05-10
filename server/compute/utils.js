'use strict';

const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
const sum = arr => arr.reduce((s, v) => s + v, 0);

function rmse(resid) {
  return Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / resid.length);
}

function mae(resid) {
  return resid.reduce((s, r) => s + Math.abs(r), 0) / resid.length;
}

function mape(ys, yhat) {
  const v = ys
    .map((y, i) => y !== 0 ? Math.abs((y - yhat[i]) / y) : null)
    .filter(x => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length * 100 : null;
}

function pinball(u, tau) {
  return u >= 0 ? tau * u : (tau - 1) * u;
}

function pinballGrad(u, tau) {
  return u >= 0 ? tau : (tau - 1);
}

function durbinWatson(resid) {
  let num = 0, den = 0;
  for (let i = 1; i < resid.length; i++) num += (resid[i] - resid[i - 1]) ** 2;
  resid.forEach(r => den += r * r);
  return num / den;
}

module.exports = { mean, sum, rmse, mae, mape, pinball, pinballGrad, durbinWatson };
