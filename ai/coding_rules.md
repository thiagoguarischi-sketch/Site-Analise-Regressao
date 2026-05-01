# Coding Rules


Este projeto deve continuar simples e seguro para produção.

Regras IMPORTANTES:
Todo frontend continua em um único HTML
O frontend NÃO pode acessar Supabase diretamente
Toda comunicação com banco deve passar pelo backend
Nunca colocar segredos no frontend
Segurança

Nunca expor no código:

API keys
Tokens
SERVICE_ROLE_KEY
URLs privadas
Strings de conexão

Variáveis de ambiente:
Todo segredo deve estar em .env
.env nunca pode ir para o GitHub
Manter .env.example atualizado
Nunca hardcodar segredos

Backend deve usar:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PORT
Backend
Validar JWT em todas as rotas
Validar e sanitizar inputs
Implementar rate limit básico
Nunca confiar no frontend
Não expor erros internos
Supabase
Todas as tabelas com RLS ativado
Policies de SELECT/INSERT/UPDATE/DELETE por usuário

Comunicação Frontend ↔ Backend

O frontend e o backend DEVEM se comunicar obrigatoriamente via HTTP (fetch).

Regras:

Todo acesso a dados deve passar por /api/...
O frontend deve enviar o JWT do usuário em todas as requisições
O backend deve validar o JWT antes de acessar o Supabase
O frontend não pode manter nenhuma chamada direta ao Supabase

Mudanças no projeto:
Mudanças mínimas e seguras
Não adicionar frameworks
Não adicionar bibliotecas
Não quebrar funcionalidades existentes
