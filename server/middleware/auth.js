const { createClient } = require('@supabase/supabase-js');

// Service role client — nunca expor ao frontend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Valida JWT do frontend.
 * Extrai user_id e anexa em req.userId.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    req.userId = data.user.id;
    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    return res.status(500).json({ error: 'Erro ao validar autenticação.' });
  }
}

module.exports = { requireAuth, supabase };