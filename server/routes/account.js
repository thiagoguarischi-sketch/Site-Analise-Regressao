const express = require('express');
const router  = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// DELETE /api/account  — apaga dados do usuário e depois a conta auth
router.delete('/account', requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Apaga todas as análises do usuário
    const { error: delAnalises } = await supabase
      .from('analises')
      .delete()
      .eq('user_id', userId);

    if (delAnalises) {
      console.error('[DELETE account] Erro ao apagar análises:', delAnalises);
      return res.status(500).json({ error: 'Erro ao excluir conta.', detail: delAnalises.message });
    }

    // 2. Apaga compartilhamentos de análises (se a tabela existir)
    await supabase.from('friend_shares').delete().eq('from_user_id', userId);
    await supabase.from('friend_shares').delete().eq('to_user_id', userId);

    // 3. Apaga mensagens (se a tabela existir)
    await supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // 4. Apaga amizades (se a tabela existir)
    await supabase.from('friendships').delete().or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    // 5. Agora apaga a conta de auth (sem FK bloqueando)
    const { error: delUser } = await supabase.auth.admin.deleteUser(userId);

    if (delUser) {
      console.error('[DELETE account] SDK error:', JSON.stringify(delUser));
      return res.status(500).json({ error: 'Erro ao excluir conta.', detail: delUser.message, code: delUser.code });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE account] Exception:', err.message);
    res.status(500).json({ error: 'Erro ao excluir conta.', detail: err.message });
  }
});

// GET /api/account/debug
router.get('/account/debug', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    res.json({
      admin_test: error ? ('ERRO: ' + error.message) : 'OK',
      service_key_prefix: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 25) + '...',
    });
  } catch (e) {
    res.json({ exception: e.message });
  }
});

module.exports = router;
