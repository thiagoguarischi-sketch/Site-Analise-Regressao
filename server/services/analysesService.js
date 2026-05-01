const { supabase } = require('../middleware/auth');

async function getAnalyses(userId) {
  const { data, error } = await supabase
    .from('analises')
    .select('id, nome, tipo, created_at, dados')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function saveAnalysis(userId, { nome, tipo, label_x, label_y, dados }) {
  const { data, error } = await supabase
    .from('analises')
    .insert([{ user_id: userId, nome, tipo, label_x, label_y, dados }])
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

async function deleteAnalysis(userId, analysisId) {
  // Confirma propriedade antes de deletar
  const { data: existing, error: fetchErr } = await supabase
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

  const { error } = await supabase
    .from('analises')
    .delete()
    .eq('id', analysisId)
    .eq('user_id', userId);

  if (error) throw error;
}

module.exports = { getAnalyses, saveAnalysis, deleteAnalysis };