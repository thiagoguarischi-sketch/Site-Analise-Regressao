require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const analysesRoutes = require('./routes/analyses');
const accountRoutes  = require('./routes/account');
const computeRoutes  = require('./routes/compute');
const yahooRoutes    = require('./routes/yahoo');
const bcbRoutes      = require('./routes/bcb');
const socialRoutes   = require('./routes/social');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// Cabeçalhos de segurança (HSTS, noSniff, frameguard, etc.).
// CORP cross-origin para a API poder ser consumida pelo frontend.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allowlist explícita (NUNCA '*' numa API autenticada).
// Produção: defina ALLOWED_ORIGIN no .env (lista separada por vírgula).
// Sem ALLOWED_ORIGIN (desenvolvimento): aceita apenas localhost/127.0.0.1.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const _isLocalhost = o => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
app.use(cors({
  origin(origin, cb) {
    // Sem header Origin (curl, same-origin, apps nativas) é permitido.
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    if (ALLOWED_ORIGINS.length === 0 && _isLocalhost(origin)) return cb(null, true);
    cb(new Error('Origem não permitida pelo CORS.'));
  },
}));

app.use(express.json({ limit: '1mb' }));

// Rate limit global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente.' },
});
app.use('/api/', limiter);

// Rate limit dedicado e mais estrito para os proxies externos (Yahoo/BCB).
// As rotas exigem autenticação (requireAuth); o limite extra protege contra
// abuso da cota das APIs externas mesmo por usuários autenticados.
const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Muitas requisições a serviços externos. Tente novamente em instantes.' },
});
app.use('/api/yahoo', proxyLimiter);
app.use('/api/bcb', proxyLimiter);

// Routes
app.use('/api', analysesRoutes);
app.use('/api', accountRoutes);
app.use('/api', computeRoutes);
app.use('/api', yahooRoutes);
app.use('/api', bcbRoutes);
app.use('/api', socialRoutes);

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

// 404
app.use((_, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));