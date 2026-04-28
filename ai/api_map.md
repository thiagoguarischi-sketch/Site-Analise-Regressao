# Supabase Calls Map

Fluxo principal:

Carregar análises do usuário
SELECT * FROM analyses WHERE user_id = current_user

Criar nova análise
INSERT INTO analyses

Abrir análise existente
SELECT * FROM analyses WHERE id = ?

Salvar resultados
UPDATE analyses SET results = ? WHERE id = ?