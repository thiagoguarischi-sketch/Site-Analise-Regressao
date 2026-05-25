// Gerado pelo build do Vercel — lê variáveis de ambiente e escreve env-config.js.
// Nunca edite env-config.js diretamente; edite as variáveis no painel do Vercel.
const fs   = require('fs');
const path = require('path');

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'API_BASE'];
const missing  = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`\n[build] ERRO: variáveis de ambiente ausentes: ${missing.join(', ')}`);
  console.error('[build] Configure-as no painel do Vercel antes de fazer deploy.\n');
  process.exit(1);
}

const v = k => JSON.stringify(process.env[k]);

const content = `// Gerado automaticamente pelo build — não commite este arquivo.
window.__RL_CONFIG__ = {
  SUPABASE_URL:      ${v('SUPABASE_URL')},
  SUPABASE_ANON_KEY: ${v('SUPABASE_ANON_KEY')},
  API_BASE:          ${v('API_BASE')},
};\n`;

fs.writeFileSync(path.join(__dirname, 'env-config.js'), content, 'utf8');
console.log('[build] env-config.js gerado com sucesso.');
