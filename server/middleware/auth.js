const { createClient } = require('@supabase/supabase-js');

// Cliente com chave anon — usado para validar tokens JWT dos usuários
const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente com service role — usado apenas para operações admin (ex: deletar conta)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await authClient.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    req.userId = data.user.id;
    req.accessToken = token;
    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    return res.status(500).json({ error: 'Erro ao validar autenticação.' });
  }
}

module.exports = { requireAuth, supabase };
