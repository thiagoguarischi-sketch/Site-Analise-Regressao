'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const { compute, computeMultiple } = require('../compute/linear');
const { computeLogistic } = require('../compute/logistic');
const { computePolynomial } = require('../compute/polynomial');
const { computeQuantileCoefs, computeAllQuantiles } = require('../compute/quantile');
const { computeRidge, computeLasso, computeOLS_rr, rrLambdaSweep } = require('../compute/regularized');
const { stCompute, arimaCompute, garchCompute, varCompute } = require('../compute/timeSeries');

/**
 * POST /api/analyze
 * Body: { tipo, params, dados }
 * Response: { result }
 *
 * tipo values and expected params/dados shapes:
 *   'linear'       — dados: { xs, ys }
 *   'multiple'     — dados: { Xs, Y }
 *   'logistic'     — dados: { Xs, Y }
 *   'polynomial'   — dados: { xs, ys }, params: { degree }
 *   'quantile'     — dados: { xs, ys }, params: { taus, lr, maxIter, tol }
 *   'ridge'        — dados: { xs, ys }, params: { lambda }
 *   'lasso'        — dados: { xs, ys }, params: { lambda, lr, maxIter, tol }
 *   'regularized'  — dados: { xs, ys }, params: { lambda, lr, iters, tol, type }
 *   'serie'        — dados: { values, labels? }, params: { modelo, windowSize, futureN }
 *   'arima'        — dados: { values, labels? }, params: { p, d, q, futureN }
 *   'garch'        — dados: { values, labels? }, params: { futureN }
 *   'var'          — dados: { matrix, labelsList }, params: { p, futureN, varNames? }
 */
router.post('/analyze', requireAuth, (req, res) => {
  try {
    const { tipo, params = {}, dados = {} } = req.body;

    if (!tipo) return res.status(400).json({ error: 'Campo "tipo" obrigatório.' });

    let result;

    switch (tipo) {
      case 'linear': {
        const { xs, ys } = dados;
        if (!xs || !ys || xs.length < 3) return res.status(400).json({ error: 'Dados insuficientes para regressão linear.' });
        result = compute(xs, ys);
        break;
      }

      case 'multiple': {
        const { Xs, Y } = dados;
        if (!Xs || !Y) return res.status(400).json({ error: 'Dados inválidos para regressão múltipla.' });
        result = computeMultiple(Xs, Y);
        if (!result) return res.status(422).json({ error: 'Matriz singular. Verifique multicolinearidade.' });
        break;
      }

      case 'logistic': {
        const { Xs, Y } = dados;
        if (!Xs || !Y) return res.status(400).json({ error: 'Dados inválidos para regressão logística.' });
        result = computeLogistic(Xs, Y);
        break;
      }

      case 'polynomial': {
        const { xs, ys } = dados;
        const degree = params.degree || 2;
        if (!xs || !ys || xs.length < degree + 2) return res.status(400).json({ error: 'Dados insuficientes para regressão polinomial.' });
        result = computePolynomial(xs, ys, degree);
        if (!result) return res.status(422).json({ error: 'Não foi possível ajustar o polinômio.' });
        break;
      }

      case 'quantile': {
        const { xs, ys } = dados;
        const { taus, lr = 0.01, maxIter = 5000, tol = 1e-7 } = params;
        if (!xs || !ys) return res.status(400).json({ error: 'Dados inválidos para regressão quantílica.' });
        result = computeAllQuantiles(xs, ys, taus || [0.1, 0.25, 0.5, 0.75, 0.9], lr, maxIter, tol);
        break;
      }

      case 'ridge': {
        const { xs, ys } = dados;
        const lambda = params.lambda || 0.1;
        if (!xs || !ys || xs.length < 3) return res.status(400).json({ error: 'Dados insuficientes.' });
        result = computeRidge(xs, ys, lambda);
        break;
      }

      case 'lasso': {
        const { xs, ys } = dados;
        const { lambda = 0.1, lr = 0.001, maxIter = 5000, tol = 1e-7 } = params;
        if (!xs || !ys || xs.length < 3) return res.status(400).json({ error: 'Dados insuficientes.' });
        result = computeLasso(xs, ys, lambda, lr, maxIter, tol);
        break;
      }

      case 'regularized': {
        const { xs, ys } = dados;
        const { lambda = 0.1, lr = 0.001, iters = 5000, tol = 1e-7, type = 'ridge' } = params;
        if (!xs || !ys || xs.length < 3) return res.status(400).json({ error: 'Dados insuficientes.' });
        const ridge = computeRidge(xs, ys, lambda);
        const lasso = computeLasso(xs, ys, lambda, lr, iters, tol);
        const ols = computeOLS_rr(xs, ys);
        const sweep = rrLambdaSweep(xs, ys, type, lr, iters, tol);
        result = { ridge, lasso, ols, sweep };
        break;
      }

      case 'serie': {
        const { values, labels } = dados;
        const { windowSize = 3, futureN = 6 } = params;
        if (!values || values.length < 6) return res.status(400).json({ error: 'Mínimo 6 períodos para série temporal.' });
        result = stCompute(values, windowSize, futureN);
        if (labels) result.labels = labels;
        break;
      }

      case 'arima': {
        const { values, labels } = dados;
        const { p = 1, d = 1, q = 1, futureN = 6 } = params;
        if (!values || values.length < p + d + q + 5) return res.status(400).json({ error: 'Dados insuficientes para ARIMA.' });
        result = arimaCompute(values, p, d, q, futureN);
        if (labels) result.labels = labels;
        break;
      }

      case 'garch': {
        const { values, labels } = dados;
        const { futureN = 6 } = params;
        if (!values || values.length < 10) return res.status(400).json({ error: 'GARCH requer pelo menos 10 períodos.' });
        result = garchCompute(values, futureN);
        if (labels) result.labels = labels;
        break;
      }

      case 'var': {
        const { matrix, labelsList } = dados;
        const { p = 1, futureN = 6, varNames } = params;
        if (!matrix || !matrix.length) return res.status(400).json({ error: 'Dados inválidos para VAR.' });
        result = varCompute(matrix, labelsList || [], p, futureN, varNames);
        if (!result) return res.status(422).json({ error: 'Matriz singular — reduza p ou adicione mais dados.' });
        break;
      }

      default:
        return res.status(400).json({ error: `Tipo de análise desconhecido: ${tipo}` });
    }

    res.json({ result });
  } catch (err) {
    console.error('[compute]', err.message);
    res.status(500).json({ error: 'Erro interno ao executar análise.' });
  }
});

module.exports = router;
