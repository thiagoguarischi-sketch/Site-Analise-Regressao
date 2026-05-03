# Instructions for Claude

Antes de responder, leia:
1. project_overview.md
2. architecture.md
3. database_schema.md
4. api_map.md
5. coding_rules.md

A aplicação foi modularizada em `src/` (ES6 modules). O entry point é `src/app.js`,
carregado por `index.html` via `<script type="module">`. Handlers `onclick=` inline
do HTML continuam funcionando porque `src/app.js` re-expõe as funções no `window`.

O HTML monolítico antigo está preservado em `legacy/plataforma-regressaov36.html`
apenas como referência histórica — não modificar.

Ao trabalhar:
- Edite os módulos em `src/` (não o legacy nem o `index.html` exceto markup).
- Prefira mudanças pequenas, mostre apenas os diffs.
- Não reescreva arquivos inteiros sem necessidade.
