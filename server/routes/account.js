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
      return res.status(500).json({ error: 'Erro ao excluir conta.' });
    }

    // 2. Apaga compartilhamentos de análises
    await supabase.from('friend_shares').delete().eq('sender_id', userId);
    await supabase.from('friend_shares').delete().eq('receiver_id', userId);

    // 3. Apaga mensagens
    await supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // 4. Apaga amizades
    await supabase.from('friendships').delete().or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    // 5. Agora apaga a conta de auth (sem FK bloqueando)
    const { error: delUser } = await supabase.auth.admin.deleteUser(userId);

    if (delUser) {
      console.error('[DELETE account] SDK error:', JSON.stringify(delUser));
      return res.status(500).json({ error: 'Erro ao excluir conta.' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE account] Exception:', err.message);
    res.status(500).json({ error: 'Erro ao excluir conta.' });
  }
});

module.exports = router;
