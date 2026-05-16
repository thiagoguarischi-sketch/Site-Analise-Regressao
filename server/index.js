require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const analysesRoutes = require('./routes/analyses');
const accountRoutes  = require('./routes/account');
const computeRoutes  = require('./routes/compute');
const yahooRoutes    = require('./routes/yahoo');
const bcbRoutes      = require('./routes/bcb');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

// Rate limit global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api', analysesRoutes);
app.use('/api', accountRoutes);
app.use('/api', computeRoutes);
app.use('/api', yahooRoutes);
app.use('/api', bcbRoutes);

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