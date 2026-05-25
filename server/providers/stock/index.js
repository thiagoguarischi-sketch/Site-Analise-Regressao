'use strict';

// Seleciona o provedor de dados de mercado via variável de ambiente.
// Para trocar: defina STOCK_PROVIDER no .env e implemente o contrato abaixo.
//
// Contrato obrigatório:
//   search(q: string)                                → Promise<{ quotes: Quote[] }>
//   chart(symbol, period1, period2, interval)        → Promise<ChartData | null>

const PROVIDER = process.env.STOCK_PROVIDER || 'yahoo';

const registry = {
  yahoo:        () => require('./yahoo'),
  // alphaVantage: () => require('./alphaVantage'),  // descomentar ao implementar
  // polygon:      () => require('./polygon'),
  // twelveData:   () => require('./twelveData'),
};

if (!registry[PROVIDER]) {
  throw new Error(
    `[stockProvider] Provedor desconhecido: "${PROVIDER}". Disponíveis: ${Object.keys(registry).join(', ')}`
  );
}

module.exports = registry[PROVIDER]();
