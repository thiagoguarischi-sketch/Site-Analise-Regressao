const { createClient } = require('@supabase/supabase-js');

function _client(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}

async function getAnalyses(userId, accessToken) {
  const sb = _client(accessToken);
  const { data, error } = await sb
    .from('analises')
    .select('id, nome, tipo, created_at, dados')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function saveAnalysis(userId, payload, accessToken) {
  const sb = _client(accessToken);
  const { nome, tipo, label_x, label_y, dados } = payload;
  const { data, error } = await sb
    .from('analises')
    .insert([{ user_id: userId, nome, tipo, label_x, label_y, dados }])
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

async function deleteAnalysis(userId, analysisId, accessToken) {
  const sb = _client(accessToken);

  const { data: existing, error: fetchErr } = await sb
    .from('analises')
    .select('id')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !existing) {
    const err = new Error('Análise não encontrada ou sem permissão.');
    err.status = 404;
    throw err;
  }

  const { error } = await sb
    .from('analises')
    .delete()
    .eq('id', analysisId)
    .eq('user_id', userId);

  if (error) throw error;
}

module.exports = { getAnalyses, saveAnalysis, deleteAnalysis };
