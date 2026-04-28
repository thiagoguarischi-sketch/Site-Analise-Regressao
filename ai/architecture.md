# Application Architecture

O projeto é um arquivo HTML único grande com scripts embutidos.

Arquivo principal:
plataforma-regressaov14.html

O código JavaScript está dividido em blocos dentro de <script>.

Principais módulos lógicos dentro do HTML:

AUTH MODULE
Responsável por:
- login
- logout
- obter usuário atual
- proteger acesso ao dashboard

DASHBOARD MODULE
Responsável por:
- listar análises do usuário
- botão "nova análise"
- botão "abrir análise existente"
- função openAnalysisById(id)

ANALYSIS MODULE
Responsável por:
- loadSimpleAnalysis(id)
- runRegression()
- salvar resultados
- manipular dados da análise

CHARTS MODULE
Responsável por:
- criação de gráficos
- visualização de resultados

SUPABASE MODULE
Responsável por:
- inicializar cliente Supabase
- consultas ao banco
- salvar e carregar análises

Importante:
As funções são globais e vivem no escopo window.