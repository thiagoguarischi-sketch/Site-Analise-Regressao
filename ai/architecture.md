# Application Architecture

Arquitetura geral:
Frontend (HTML único) → Backend API → Supabase

Frontend

Arquivo principal:
plataforma-regressaov14.html

O código JavaScript continua dividido em blocos dentro de <script>.

As funções continuam globais e vivem no escopo window.

O frontend não acessa mais o Supabase diretamente.
Toda comunicação é feita via fetch("/api/...").

Backend

Novo diretório:

/server

Responsável por:

intermediar acesso ao banco
validar autenticação (JWT Supabase)
aplicar regras de segurança
validar e sanitizar inputs
aplicar rate limit
proteger segredos via variáveis de ambiente

O backend usa:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
.env (não versionado)

Módulos do Frontend

AUTH MODULE

Responsável por:

login
logout
obter usuário atual
obter JWT do usuário
enviar JWT nas chamadas da API
proteger acesso ao dashboard

DASHBOARD MODULE

Responsável por:
listar análises do usuário via API
botão "nova análise"
botão "abrir análise existente"
função openAnalysisById(id)

ANALYSIS MODULE

Responsável por:
loadSimpleAnalysis(id) via API
runRegression()
salvar resultados via API
manipular dados da análise

CHARTS MODULE

Responsável por:
criação de gráficos
visualização de resultados
API MODULE (novo)

Responsável por:

comunicação com backend
chamadas fetch("/api/...")
envio de JWT nas requisições
tratamento de respostas e erros
Backend Modules
ROUTES

Endpoints principais:

POST /api/save-analysis
GET /api/analyses
DELETE /api/analysis/:id
AUTH MIDDLEWARE

Responsável por:

validar JWT recebido do frontend
identificar usuário autenticado
anexar user_id na requisição
SERVICES

Responsável por:

comunicação segura com Supabase
uso da SERVICE_ROLE_KEY
regras de acesso aos dados
Supabase

Supabase agora é acessado apenas pelo backend.

Regras obrigatórias:

Todas as tabelas com Row Level Security ativado
Policies baseadas em usuário

Regra principal:

auth.uid() = user_id
