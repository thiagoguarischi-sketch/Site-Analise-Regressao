var NAV_EN = {
  '0': '<div class="module-nav-spacer"></div><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 1 · Introduction · 1 of 10</div></div><button class="module-nav-btn next" onclick="showModule(1)">Module 2: Economics →</button>',
  '1': '<button class="module-nav-btn" onclick="showModule(0)">← Module 1: Introduction</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 2 · Economics · 2 of 10</div></div><button class="module-nav-btn next" onclick="showModule(2)">Module 3: Fixed Income →</button>',
  '2': '<button class="module-nav-btn" onclick="showModule(1)">← Module 2: Economics</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 3 · Fixed Income · 3 of 10</div></div><button class="module-nav-btn next" onclick="showModule(3)">Module 4: Equities →</button>',
  '3': '<button class="module-nav-btn" onclick="showModule(2)">← Module 3: Fixed Income</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 4 · Equities · 4 of 10</div></div><button class="module-nav-btn next" onclick="showModule(4)">Module 5: Derivatives →</button>',
  '4': '<button class="module-nav-btn" onclick="showModule(3)">← Module 4: Equities</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 5 · Derivatives · 5 of 10</div></div><button class="module-nav-btn next" onclick="showModule(5)">Module 6: Advanced Mgmt. →</button>',
  '5': '<button class="module-nav-btn" onclick="showModule(4)">← Module 5: Derivatives</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 6 · Advanced Mgmt. · 6 of 10</div></div><button class="module-nav-btn next" onclick="showModule(6)">Module 7: United States →</button>',
  '6': '<button class="module-nav-btn" onclick="showModule(5)">← Module 6: Advanced Mgmt.</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 7 · United States · 7 of 10</div></div><button class="module-nav-btn next" onclick="showModule(7)">Module 8: Global Markets →</button>',
  '7': '<button class="module-nav-btn" onclick="showModule(6)">← Module 7: United States</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Module 8 · Global Markets · 8 of 10</div></div><button class="module-nav-btn next" onclick="showModule(8)">Conclusion →</button>',
  '8': '<button class="module-nav-btn" onclick="showModule(7)">← Module 8: Global Markets</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Conclusion · 9 of 10</div></div><button class="module-nav-btn next" onclick="showModule(9)">Extra Module: Slope →</button>',
  '9': '<button class="module-nav-btn" onclick="showModule(8)">← Conclusion</button><div class="module-nav-center"><div class="module-progress"></div><div class="module-nav-label">Extra Module · Slope · 10 of 10</div></div><div class="module-nav-spacer"></div>'
};

var DIV_EN = {
  'mod-economia': '<div class="module-number">Module 2</div><div class="module-title">📊 Economics Fundamentals</div><div class="module-desc">The macroeconomic concepts that drive markets. Understanding inflation, interest rates, exchange rates and monetary policy is essential for any investor — they determine the environment in which all assets live.</div>',
  'mod-rf': '<div class="module-number">Module 3</div><div class="module-title">🔒 Fixed Income</div><div class="module-desc">Investments with known return rules from the start. More predictable and safer than equities, they form the foundation of any solid portfolio — but hide more complexity than they appear.</div>',
  'mod-rv': '<div class="module-number">Module 4</div><div class="module-title">📈 Equities</div><div class="module-desc">Investments whose return is not known in advance. Higher risk, higher potential return — and much more knowledge required. Here you learn to analyze companies, understand financial statements and price assets.</div>',
  'mod-der': '<div class="module-number">Module 5</div><div class="module-title">⚙️ Derivatives</div><div class="module-desc">Contracts that derive their value from an underlying asset. Used for protection (hedging), speculation and arbitrage. Advanced instruments that require deep understanding before trading — but essential for any sophisticated investor.</div>',
  'mod-5': '<div class="module-number">Module 6</div><div class="module-title">🧠 Advanced Portfolio Management</div><div class="module-desc">Modern portfolio theory, performance metrics, quantitative risk management, investor psychology and complete taxation.</div>',
  'conclusao': '<div class="module-number">Conclusion</div><div class="module-title">🗺️ Building your Portfolio</div><div class="module-desc">Everything you learned applied in a practical framework for building and managing your investment portfolio.</div>',
  'mod-extra': '<div class="module-number">Extra Module</div><div class="module-title">⚙️ Applying on the Slope Platform</div><div class="module-desc">How to use Slope\'s statistical regression analysis to validate hypotheses, model assets and build quantitative strategies with the concepts learned in this course.</div>',
  'mod-usa': '<div class="module-number">Module 7</div><div class="module-title">🇺🇸 US Financial Markets</div><div class="module-desc">The world\'s largest financial market: structure, instruments, regulators and how Brazilian investors can access it.</div>',
  'mod-mundo': '<div class="module-number">Module 8</div><div class="module-title">🌍 Global Financial Markets</div><div class="module-desc">Europe, China and the world\'s major markets: structure, opportunities and risks for the investor seeking true global diversification.</div>'
};

var SEC_EN = {};

SEC_EN['intro'] = '\
      <div class="section-title"><span class="section-icon">🌐</span> What the Financial Market Is</div>\
      <div class="section-body">\
        <p>The financial market is the set of institutions, instruments and practices that <strong>connect those with surplus money (investors/savers) with those who need money (companies, government, individuals)</strong>. It is the circulatory system of the economy: without it, capital would not reach where it is needed and the economy would seize up.</p>\
        <p>Think of it this way: a company that wants to build a factory needs R$ 500 million. It could borrow from a bank, issue shares on the stock exchange, or issue debentures. In every case, the money comes from investors — people like you — through the financial market.</p>\
        <p>There are four major segments within the financial market:</p>\
      </div>\
      <div class="cards-grid" style="margin-top:18px">\
        <div class="info-card">\
          <div class="info-card-icon">🏛️</div>\
          <div class="info-card-title">Credit Market</div>\
          <div class="info-card-body">Loans, financing and debt securities. The bank takes deposits and lends with a spread. Includes personal loans, mortgages, payroll loans, working capital.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📜</div>\
          <div class="info-card-title">Capital Market</div>\
          <div class="info-card-body">Issuance and trading of shares, debentures and other securities. The company accesses capital directly from investors, without a banking intermediary.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💱</div>\
          <div class="info-card-title">Foreign Exchange Market</div>\
          <div class="info-card-body">Buying and selling of foreign currencies. Determines the exchange rate. Moves trillions of dollars per day globally.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📦</div>\
          <div class="info-card-title">Derivatives Market</div>\
          <div class="info-card-body">Futures contracts, options and swaps whose value derives from another asset. Used for protection (hedging) and leveraged speculation.</div>\
        </div>\
      </div>\
      <div class="concept-box" style="margin-top:20px">\
        <div class="concept-label">Who regulates the Brazilian financial market?</div>\
        <div class="concept-body">\
          <strong>Central Bank of Brazil (BACEN):</strong> regulates banks, monetary policy and foreign exchange.<br>\
          <strong>CVM (Securities and Exchange Commission of Brazil):</strong> oversees the capital market, the stock exchange, funds and derivatives.<br>\
          <strong>SUSEP:</strong> supervises insurance and private pension plans.<br>\
          <strong>CMN (National Monetary Council):</strong> sets the general policies; BACEN and CVM carry them out.\
        </div>\
      </div>\
      <div class="alert info" style="margin-top:18px">\
        <span class="alert-icon">ℹ️</span>\
        <div class="alert-body">In this course we will cover <strong>5 progressive modules</strong>: economic fundamentals, fixed income, equities, derivatives and advanced portfolio management. Each module builds on the previous one — read them in order for the best results.</div>\
      </div>\
    ';

SEC_EN['oferta-demanda'] = '\
      <div class="section-title"><span class="section-icon">⚖️</span> Supply and Demand</div>\
      <div class="section-body">\
        <p>The <strong>law of supply and demand</strong> is the most fundamental force in economics. When many people want to buy something (high demand) and little quantity is available (low supply), the price rises. The reverse is also true.</p>\
        <p>This principle applies to everything: products in the supermarket, real estate, shares on the exchange, foreign currencies and even government bonds.</p>\
        <p>The <strong>equilibrium price</strong> is the point where the quantity supplied equals the quantity demanded. In practice, markets never sit exactly at that point — they are constantly adjusting, reacting to new information, expectations and external shocks.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">📈</div>\
          <div class="info-card-title">High demand + low supply</div>\
          <div class="info-card-body">Price rises. Example: a scarce product in high demand, the stock of a company with few shares available on the market.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📉</div>\
          <div class="info-card-title">Low demand + high supply</div>\
          <div class="info-card-body">Price falls. Example: a company issuing many new shares (dilution), a product with low demand and high inventory.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔄</div>\
          <div class="info-card-title">Elasticity</div>\
          <div class="info-card-body">Measures how much demand reacts to a change in price. Gasoline is inelastic (you need it even when the price is high). Leisure travel is elastic (you give it up if it gets expensive).</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💡</div>\
          <div class="info-card-title">Application to stocks</div>\
          <div class="info-card-body">Positive news about a company increases demand for its shares. With the same quantity available, the price rises. The market prices expectations, not just facts.</div>\
        </div>\
      </div>\
      <div class="alert tip" style="margin-top:16px">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>Insight for investors:</strong> Financial markets are pricing mechanisms based on the supply and demand of future expectations. A company with excellent results may see its stock fall if the result came in below what the market expected — the "demand" for the shares had already risen earlier, anticipating the good result.</div>\
      </div>\
    ';

SEC_EN['inflacao'] = '\
      <div class="section-title"><span class="section-icon">🔥</span> Inflation and Price Indices</div>\
      <div class="section-body">\
        <p><strong>Inflation</strong> is the generalized, continuous and persistent increase in prices. When inflation is high, each real buys less — purchasing power deteriorates silently.</p>\
        <p>There are two types of inflation by origin. <strong>Demand-pull inflation</strong> occurs when demand in the economy exceeds supply — "too much money chasing too few goods." <strong>Cost-push (or supply-side) inflation</strong> occurs when production costs rise (raw materials, energy, exchange rate) and are passed on to final prices.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🧺</div>\
          <div class="info-card-title">IPCA</div>\
          <div class="info-card-body"><strong>Brazil\'s official government inflation index.</strong> Calculated monthly by IBGE. It measures the price variation of a consumption basket for households earning 1 to 40 minimum wages, across 9 metropolitan regions. It is the reference for the Central Bank\'s inflation target.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🏗️</div>\
          <div class="info-card-title">IGP-M</div>\
          <div class="info-card-body">Calculated by FGV. Composed of the IPA (wholesale price index, 60%), IPC (consumer, 30%) and INCC (construction, 10%). Widely used in <strong>rental contracts</strong> and some securities. It is more volatile than the IPCA.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🛒</div>\
          <div class="info-card-title">INPC</div>\
          <div class="info-card-body">Measures inflation for households earning 1 to 5 minimum wages. Focused on lower incomes, where food spending carries greater weight. Used to adjust the <strong>minimum wage</strong>.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🏭</div>\
          <div class="info-card-title">IPC-Fipe</div>\
          <div class="info-card-body">Calculated by FIPE. Focuses on the city of São Paulo. A regional reference for Brazil\'s largest consumer market.</div>\
        </div>\
      </div>\
      <div class="concept-box" style="margin-top:20px">\
        <div class="concept-label">Real Return vs Nominal Return</div>\
        <div class="concept-body">\
          An investment only protects your wealth if it <strong>yields above inflation</strong>. If you invested R$ 10,000 and earned 8% per year, but inflation was 9%, you lost purchasing power.<br><br>\
          The exact formula for the real return uses the <strong>Fisher Effect</strong>:<br><br>\
          <strong>Real Return = [(1 + Nominal Return) / (1 + Inflation)] − 1</strong><br><br>\
          Example: 12% nominal with 5% inflation → real return = (1.12 / 1.05) − 1 = <strong>6.67%</strong> (not simply 7%).\
        </div>\
      </div>\
      <div class="example-box">\
        <div class="example-header">📘 The Inflation Target in Brazil</div>\
        <div class="example-body">\
          <p>The Central Bank has an inflation target (IPCA) set by the CMN. The inflation targeting regime works as follows:</p>\
          <ul class="hl-list">\
            <li>The CMN sets the annual target (e.g. 3% with a tolerance of ±1.5 p.p.)</li>\
            <li>If the IPCA threatens to exceed the ceiling, the Copom raises the Selic to cool the economy</li>\
            <li>If the IPCA threatens to fall below the floor, the Copom cuts the Selic to stimulate it</li>\
            <li>If the target is missed, the Central Bank governor must write an open letter explaining the causes</li>\
          </ul>\
          <div class="example-result">\
            <strong>Why this matters to you:</strong> when inflation is above target, interest rates rise — fixed income yields more, equities come under pressure. When inflation is under control, rates fall — equities tend to appreciate.\
          </div>\
        </div>\
      </div>\
      <div class="alert warn" style="margin-top:14px">\
        <span class="alert-icon">⚠️</span>\
        <div class="alert-body"><strong>The savings account trap:</strong> The savings account yields 0.5% per month (6.17% per year) when the Selic is above 8.5% per year. With inflation of 5-6%, the real gain is very low. In periods of high inflation, the savings account can yield less than the IPCA, destroying real wealth.</div>\
      </div>\
    ';

SEC_EN['taxa-juros'] = '\
      <div class="section-title"><span class="section-icon">🏦</span> Interest Rates: Selic and CDI</div>\
      <div class="section-body">\
        <p>The <strong>interest rate</strong> is the price of money over time. It exists because money today is worth more than money in the future — there is risk, inflation and opportunity cost involved. Whoever lends demands compensation; whoever borrows pays for that compensation.</p>\
        <p>In Brazil, the two most important rates for the individual investor are the <strong>Selic</strong> and the <strong>CDI</strong>. Understanding the difference and how they work is essential.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🏛️</div>\
          <div class="product-name">Selic — The Economy\'s Base Rate</div>\
        </div>\
        <div class="product-desc">\
          The Selic (Special System for Settlement and Custody) is the <strong>base interest rate of the Brazilian economy</strong>, set by the Copom (Monetary Policy Committee of the Central Bank) every 45 days in two-day meetings.<br><br>\
          It is called the "base" rate because it works as the <strong>floor of the entire economy</strong>: no serious institution will lend money below the Selic, since it could invest in Treasury bonds (zero risk) at that rate. That is why the country\'s entire interest rate structure is built on top of it.<br><br>\
          <strong>Transmission mechanism:</strong> Selic rises → credit becomes more expensive → households and companies consume/invest less → pressure on prices eases → inflation recedes. The reverse also works, but with a lag of 6-18 months.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Set by the Copom (8x per year)</span>\
          <span class="product-stat">Main anti-inflation tool</span>\
          <span class="product-stat">Reference for the entire economy</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">💼</div>\
          <div class="product-name">CDI — The Interbank Market Rate</div>\
        </div>\
        <div class="product-desc">\
          The CDI (Interbank Deposit Certificate) is the rate that banks charge each other for very short-term loans (usually overnight — 1 day). At the end of each day, banks with more deposits than loans lend to banks in the opposite situation.<br><br>\
          In practice, the <strong>CDI always sits 0.10 p.p. below the Selic</strong> — which is why they are practically equivalent. The difference is that the Selic is the rate for operations backed by government bonds (safer), and the CDI is between banks (slightly higher risk, hence the spread).<br><br>\
          <strong>Why does the CDI matter to you?</strong> The vast majority of fixed income investments are remunerated as a percentage of the CDI: "100% of the CDI", "110% of the CDI", "85% of the CDI". Understanding the CDI means understanding the benchmark of almost all private fixed income.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">≈ Selic − 0.10 p.p.</span>\
          <span class="product-stat">Reference for CDB, LCI, LCA</span>\
          <span class="product-stat">Calculated and published by B3</span>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Practical Example: what does "110% of the CDI" mean?</div>\
        <div class="concept-body">\
          Suppose the Selic is at <strong>10.50% per year</strong>. The CDI is at ~10.40% per year.<br><br>\
          A CDB that pays <strong>100% of the CDI</strong> → yields ~10.40% per year gross.<br>\
          A CDB that pays <strong>110% of the CDI</strong> → yields ~11.44% per year gross.<br>\
          A CDB that pays <strong>85% of the CDI</strong> → yields ~8.84% per year gross.<br><br>\
          <strong>Golden rule:</strong> large banks (Itaú, Bradesco, BB) pay 80-100% of the CDI because they are safe and have many customers. Small and mid-sized banks pay 110-130% of the CDI to attract capital, compensating for the higher perceived risk — and here the FGC coverage up to R$ 250k is crucial.\
        </div>\
      </div>\
    ';

SEC_EN['pib'] = '\
      <div class="section-title"><span class="section-icon">📊</span> GDP and Economic Cycles</div>\
      <div class="section-body">\
        <p><strong>Gross Domestic Product (GDP)</strong> is the sum of the market value of all final goods and services produced in a country during a period. It is the main measure of the size and health of the economy.</p>\
        <p>GDP can be measured through three equivalent approaches: (1) <strong>by production</strong> — value added in each sector; (2) <strong>by income</strong> — wages, profits, rents paid; (3) <strong>by demand</strong> — C + I + G + (X−M), where C=consumption, I=investment, G=government spending, X=exports, M=imports.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🚀</div>\
          <div class="info-card-title">Expansion</div>\
          <div class="info-card-body">GDP grows, employment rises, credit flows, corporate profits increase. A good phase for equities. The Central Bank monitors so as not to let inflation accelerate.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🌡️</div>\
          <div class="info-card-title">Peak</div>\
          <div class="info-card-body">Economy at maximum capacity. Inflation starts to press. Interest rates rise. The good phase has passed; time for caution and rebalancing toward more defensive assets.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📉</div>\
          <div class="info-card-title">Recession</div>\
          <div class="info-card-body">Two or more consecutive quarters of GDP decline. Unemployment rises, profits fall, credit tightens. The Central Bank cuts interest rates to stimulate the economy.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🌱</div>\
          <div class="info-card-title">Recovery</div>\
          <div class="info-card-body">Low interest rates stimulate credit and consumption. Companies start hiring and investing again. Usually the best time to begin increasing equity exposure.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">How Cycles Affect Investments</div>\
        <div class="concept-body">\
          <strong>Expansion:</strong> cyclical stocks (retail, construction, commodities) appreciate. Pre-fixed fixed income may suffer if rates rise.<br><br>\
          <strong>Recession:</strong> defensive stocks (utilities, healthcare, food) hold up better. Long-term pre-fixed bonds appreciate if the Central Bank cuts rates. Gold and the dollar serve as protection.<br><br>\
          <strong>The timing trap:</strong> the financial market anticipates the real cycle by 6-12 months. The stock market starts falling before a recession is officially declared and starts rising before GDP returns to growth.\
        </div>\
      </div>\
    ';

SEC_EN['cambio'] = '\
      <div class="section-title"><span class="section-icon">💱</span> Foreign Exchange</div>\
      <div class="section-body">\
        <p>The <strong>exchange rate</strong> is the price of one currency expressed in another. In Brazil, we follow the USD/BRL pair — how many reais are needed to buy 1 dollar.</p>\
        <p>The exchange rate is determined, in theory, by the supply and demand for currencies: exporters bringing dollars into Brazil increase the supply of USD, appreciating the real. Importers who need dollars increase the demand for USD, depreciating the real. In practice, speculation, foreign capital flows (foreign investors entering the stock exchange, for example) and the Central Bank\'s own policy have a major influence.</p>\
      </div>\
      <div class="use-list">\
        <div class="use-item yes">\
          <span class="use-dot">✅</span>\
          <div><strong>A high dollar favors:</strong> exporters (agribusiness, Petrobras, Vale, pulp/paper companies), companies with revenue in dollars, FX funds, BDRs and international ETFs in reais. Brazil becomes more competitive at selling abroad.</div>\
        </div>\
        <div class="use-item no">\
          <span class="use-dot">⚠️</span>\
          <div><strong>A high dollar hurts:</strong> importers, companies with dollar debt (USD liabilities against BRL revenue), the airline sector (fuel priced in USD), consumers (electronics, fuels become more expensive), and inflation (a high dollar pushes the IPCA up).</div>\
        </div>\
      </div>\
      <div class="formula-box">\
        <div class="formula-label">Purchasing Power Parity (PPP) and the Equilibrium Exchange Rate</div>\
        <div class="formula-eq">Fair Exchange Rate ≈ Current Rate × (Brazil Inflation / US Inflation)</div>\
        <div class="formula-note">\
          In the long run, countries with higher inflation tend to see their currencies depreciate in proportion to the inflation differential. Brazil has historically had higher inflation than the US, which explains the secular tendency of the real to depreciate. This is called <code>Purchasing Power Parity</code>.\
        </div>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🛡️</div>\
          <div class="info-card-title">Currency Diversification</div>\
          <div class="info-card-body">Holding part of your investments in dollar-denominated assets protects your wealth during Brazilian crises, when the real depreciates. IVVB11, BDRs and FX funds are practical ways to do this.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🏦</div>\
          <div class="info-card-title">Central Bank Intervention</div>\
          <div class="info-card-body">The Central Bank intervenes in the exchange rate via FX swaps (derivative contracts) or the direct sale/purchase of reserves to smooth sharp movements — not to fix the rate.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📊</div>\
          <div class="info-card-title">Factors that move the exchange rate</div>\
          <div class="info-card-body">Interest rate differential (Selic vs Fed Funds), country risk (Brazil CDS), commodity prices, foreign capital flow into the exchange, the trade balance and fiscal perception.</div>\
        </div>\
      </div>\
    ';

SEC_EN['politica-monetaria'] = '\
      <div class="section-title"><span class="section-icon">🏛️</span> Monetary and Fiscal Policy</div>\
      <div class="section-body">\
        <p>To understand markets deeply, you need to understand the two major instruments that governments use to manage the economy: <strong>monetary policy</strong> (controlled by the Central Bank) and <strong>fiscal policy</strong> (controlled by the government/congress).</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🏛️</div>\
          <div class="product-name">Monetary Policy</div>\
          <span class="product-tag rf">Central Bank</span>\
        </div>\
        <div class="product-desc">\
          The Central Bank controls the <strong>quantity of money and the cost of credit</strong> in the economy. Its main instruments are:<br><br>\
          <strong>1. Selic rate:</strong> raised to contract credit and bring down inflation; cut to stimulate the economy.<br>\
          <strong>2. Reserve requirements:</strong> the percentage of deposits that banks must keep idle at the Central Bank. An increase reduces banks\' lending capacity (contraction); a reduction frees up more credit.<br>\
          <strong>3. Open market operations:</strong> the Central Bank buys or sells government bonds to inject or withdraw liquidity from the financial system daily.<br>\
          <strong>4. Rediscount:</strong> the rate charged when the Central Bank lends to banks with short-term liquidity difficulties.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Instrument: Selic</span>\
          <span class="product-stat">Copom meets 8x per year</span>\
          <span class="product-stat">Goal: inflation on target</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">💰</div>\
          <div class="product-name">Fiscal Policy</div>\
          <span class="product-tag rv">Federal Government</span>\
        </div>\
        <div class="product-desc">\
          The federal government controls the economy via <strong>public spending and tax collection</strong>. When it spends more than it collects, it runs a <strong>primary deficit</strong> — it needs to issue debt (government bonds) to finance itself.<br><br>\
          <strong>Expansionary policy:</strong> the government spends more (public works, transfers, subsidies) → stimulates demand → risk of inflation → may force the Central Bank to raise rates.<br>\
          <strong>Contractionary policy:</strong> the government cuts spending, raises taxes → cools the economy → reduces inflation → allows the Central Bank to cut rates.<br><br>\
          <strong>Primary result:</strong> revenue minus expenses, excluding interest payments on the debt. It is the key indicator of fiscal health.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Instrument: federal budget</span>\
          <span class="product-stat">Indicator: primary result</span>\
          <span class="product-stat">Debt/GDP: fiscal sustainability</span>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">QE and QT: Tools of Modern Central Banks</div>\
        <div class="concept-body">\
          When the base rate is already at zero (or close to it) and the economy still does not react, central banks use unconventional tools:<br><br>\
          <strong>Quantitative Easing (QE):</strong> the central bank buys bonds directly in the market (long-term government bonds and even private ones). This injects money into the system, reduces long-term yields and pushes investors toward higher-risk assets (stocks, real estate), stimulating the economy via the wealth effect. The Fed, ECB and BoJ used it extensively after 2008 and during the 2020 pandemic.<br><br>\
          <strong>Quantitative Tightening (QT):</strong> the central bank stops reinvesting maturing bonds (or sells them), withdrawing liquidity. It reduces the central bank\'s balance sheet, raises yields and cools the economy.<br><br>\
          <strong>Forward Guidance:</strong> the central bank communicates its future policy intention in advance ("we will keep rates low for at least 2 years"). This anchors expectations and has a monetary effect even without changing the rate today.\
        </div>\
      </div>\
      <div class="alert info">\
        <span class="alert-icon">ℹ️</span>\
        <div class="alert-body"><strong>Why does fiscal policy matter to investors?</strong> A growing fiscal deficit means more public debt issuance → more bonds in the market → greater pressure for long-term rates to rise → pre-fixed bonds depreciate. "Fiscal risk" is one of the factors that weighs most heavily on the risk premiums of long-term bonds in Brazil.</div>\
      </div>\
    ';

SEC_EN['curva-juros'] = '\
      <div class="section-title"><span class="section-icon">📉</span> The Yield Curve</div>\
      <div class="section-body">\
        <p>The <strong>yield curve</strong> (or term structure of interest rates) is a chart that shows the <strong>expected returns for different maturities</strong>: from 3 months up to 30 years. It is one of the most powerful tools of macroeconomic analysis — and frequently ignored by beginner investors.</p>\
        <p>In essence, it captures what the market expects to happen to interest rates in the future. When you buy a 10-year bond, you are accepting the current 10-year rate because you believe it adequately reflects the risk over that period.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">📈</div>\
          <div class="info-card-title">Normal Curve (Upward Sloping)</div>\
          <div class="info-card-body"><strong>Long rates > short rates.</strong> The most common situation. The market demands an extra premium for the term (inflation risk and future uncertainty). It signals an expectation of normal economic growth.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">↔️</div>\
          <div class="info-card-title">Flat Curve</div>\
          <div class="info-card-body">Short- and long-term rates are similar. It indicates a transition — the Central Bank is raising rates (pulling the short end up) while the market expects future cuts (pressing the long end down).</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📉</div>\
          <div class="info-card-title">Inverted Curve</div>\
          <div class="info-card-body"><strong>Short rates > long rates.</strong> A classic sign of an imminent recession. The market prices future rate cuts (because the economy will slow down). In the US, it inverted before every recession since 1960.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🎯</div>\
          <div class="info-card-title">Steep Curve</div>\
          <div class="info-card-body">A very high spread between short- and long-term rates. Common at the start of expansion cycles: the Central Bank holds low rates (short end) but the market expects future inflation (premiums the long end).</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">The DI Futures Curve in Brazil</div>\
        <div class="concept-body">\
          In Brazil, the yield curve is built mainly from <strong>DI Futures contracts</strong> traded on B3. These are contracts that bet on what the accumulated CDI rate will be up to a given maturity (Jan/26, Jan/27, Jan/29, etc.).<br><br>\
          <strong>How to read it:</strong> if the DI Jan/26 is at 10.5% and the DI Jan/28 is at 11.2%, this means the market is pricing the Selic to average 10.5% through 2026 and average 11.2% through 2028 — that is, the market expects rates to rise or stay elevated for longer.<br><br>\
          <strong>Curve steepening (opening):</strong> when long-term rates rise more than short-term ones (fiscal risk premium). <strong>Curve flattening (closing):</strong> long-term rates fall (the market becomes more optimistic about fiscal/inflation). A closing of the long end is the best news for anyone holding long-term pre-fixed Treasury bonds.\
        </div>\
      </div>\
      <div class="formula-box">\
        <div class="formula-label">What moves each point of the curve</div>\
        <div class="formula-eq">Short term (up to 2 years): Selic expectations → driven by the Copom and current inflation\n\nMedium term (2–5 years): expectations of future inflation and economic growth\n\nLong term (5+ years): fiscal risk premium (debt/GDP, government credibility)\n                        + inflation risk premium + liquidity premium</div>\
      </div>\
      <div class="alert tip">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>Practical application:</strong> When the market is "steepening the long end" (long-term rates rising on fiscal risk), the prices of Treasury IPCA+ and long-term pre-fixed Treasury bonds fall. If you hold these bonds and need to redeem before maturity, you may take a loss. That is why long-term bonds require a commitment to holding until maturity.</div>\
      </div>\
    ';

SEC_EN['balanco-pagamentos'] = '\
      <div class="section-title"><span class="section-icon">🌍</span> Balance of Payments</div>\
      <div class="section-body">\
        <p>The <strong>Balance of Payments (BoP)</strong> is the systematic record of all economic transactions between the residents of a country and the rest of the world during a period. It is like Brazil\'s "bank statement" with the world.</p>\
        <p>Understanding the BoP helps to predict exchange rate movements and to understand the fragility or strength of a country\'s external position.</p>\
      </div>\
      <div class="cards-grid-2" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🏭</div>\
          <div class="info-card-title">Current Account</div>\
          <div class="info-card-body">\
            Records the real flows of goods, services and income:<br><br>\
            <strong>Trade Balance:</strong> exports minus imports of goods. Brazil runs a surplus (it exports more commodities than it imports).<br>\
            <strong>Services Balance:</strong> tourism, freight, royalties, software. Brazil is historically in deficit (it pays more than it receives).<br>\
            <strong>Income:</strong> profits, dividends and interest paid abroad (remittances). Brazil is in deficit (foreign companies remit profits abroad).\
          </div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💰</div>\
          <div class="info-card-title">Financial Account</div>\
          <div class="info-card-body">\
            Records capital and investment flows:<br><br>\
            <strong>Foreign Direct Investment (FDI):</strong> a foreign company opening a factory in Brazil. Stable and long-term.<br>\
            <strong>Portfolio Investment:</strong> foreigners buying Brazilian shares and bonds. More volatile — it can leave quickly in times of crisis ("sudden stop").<br>\
            <strong>Other investments:</strong> loans and trade credits.\
          </div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">International Reserves: The Country\'s Cushion</div>\
        <div class="concept-body">\
          <strong>International reserves</strong> are foreign-currency assets (mainly USD) that the Central Bank accumulates over the years. Brazil has ~US$ 350 billion in reserves — equivalent to ~26 months of imports.<br><br>\
          <strong>What they are for:</strong> (1) they guarantee that the country can honor external commitments even in a crisis; (2) they allow the Central Bank to intervene in the exchange rate; (3) they give credibility to foreign investors.<br><br>\
          <strong>Current account deficit:</strong> when Brazil "spends more abroad than it receives", it needs to attract foreign capital to offset it. If foreigners stop coming in (a scenario of global risk aversion), the real depreciates. That is why the external deficit is monitored closely.\
        </div>\
      </div>\
      <div class="alert info">\
        <span class="alert-icon">ℹ️</span>\
        <div class="alert-body"><strong>Brazil risk and the CDS:</strong> Brazil\'s 5-year CDS (Credit Default Swap) measures the cost of protecting against a default by the Brazilian government. The higher the CDS, the higher the perceived risk → the exchange rate tends to depreciate, long-term rates rise. It is a global thermometer of sentiment toward Brazil.</div>\
      </div>\
    ';

// ── MODULE 2: FIXED INCOME ──
SEC_EN['o-que-rf'] = '\
      <div class="section-title"><span class="section-icon">🔍</span> What is Fixed Income</div>\
      <div class="section-body">\
        <p>In <strong>fixed income</strong>, you lend your money to an issuer (government, bank, or company) that commits to returning it with interest, following rules defined at the time of application. The name "fixed income" does not mean the return is always the same — it means the <em>calculation formula</em> for the return is set in advance.</p>\
        <p>There are three types of remuneration, and understanding each one is essential to choosing the right investment for each goal:</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">📌</div>\
          <div class="info-card-title">Fixed Rate (Pré-fixado)</div>\
          <div class="info-card-body">The rate is set at contracting and does not change. Ex: <strong>12.5% per year</strong>. You know exactly how much you will receive at maturity. Ideal when you believe interest rates will fall — locks in today&#39;s high rate.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📡</div>\
          <div class="info-card-title">Floating Rate (Pós-fixado)</div>\
          <div class="info-card-body">The return follows an index (CDI, Selic). You don&#39;t know the final value, but you know it will track the rate. Ex: <strong>100% of the CDI</strong>. Ideal for emergency reserves and rising interest rate environments.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔗</div>\
          <div class="info-card-title">Hybrid (IPCA+)</div>\
          <div class="info-card-body">Combines inflation + fixed rate. Ex: <strong>IPCA + 6% per year</strong>. Guarantees real gain (above inflation). The nominal value varies, but purchasing power is preserved. Ideal for long-term goals.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">When to choose each type?</div>\
        <div class="concept-body">\
          <strong>Fixed Rate:</strong> when you believe the Brazilian Central Bank will cut rates in the coming months/years. By locking in a high rate today, you benefit from the future decline — especially if you resell before maturity (mark-to-market).<br><br>\
          <strong>Floating Rate (CDI/Selic):</strong> when there is uncertainty about the direction of interest rates, or when you may need the money before the deadline. It is the safest for short term and emergency reserves.<br><br>\
          <strong>Hybrid (IPCA+):</strong> for long-term goals (5+ years) such as retirement. Guarantees that the money will grow above inflation regardless of the scenario. But requires commitment to the term — redeeming early can generate losses.\
        </div>\
      </div>\
    ';


SEC_EN['marcacao-mercado'] = '\
      <div class="section-title"><span class="section-icon">📊</span> Mark-to-Market and Duration</div>\
      <div class="section-body">\
        <p>This is one of the most important — and most misunderstood — concepts in fixed income. Many investors are shocked to see a "fixed income" bond showing negative returns on their app screen. How is this possible?</p>\
        <p>The answer lies in <strong>mark-to-market</strong>: the value of your bond is updated daily to reflect how much it would be worth if you sold it now on the secondary market. And that price moves in the opposite direction to interest rates.</p>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Why do prices and rates move in opposite directions?</div>\
        <div class="concept-body">\
          Imagine you bought a fixed-rate Treasury bond paying <strong>12% per year</strong> maturing in 3 years.<br><br>\
          The next day, Copom raises the Selic and new bonds start paying <strong>14% per year</strong>.<br><br>\
          Now, if you want to sell your bond before maturity, who would want to buy a 12% bond when they can buy a new 14% one? Only if you <strong>sell it cheaper</strong> — with enough discount so the buyer gets 14% per year over the remaining period.<br><br>\
          Therefore: <strong>rates rise → bond price falls</strong>. <strong>Rates fall → bond price rises</strong>. If you hold to maturity, you receive exactly what was agreed. If you need to sell early, you may gain or lose.\
        </div>\
      </div>\
      <div class="formula-box">\
        <div class="formula-label">Bond Pricing (Present Value)</div>\
        <div class="formula-eq">Bond Price = Σ [ Cash Flow_t / (1 + rate)^t ]\
\
Example — fixed-rate bond at 12% p.a., maturity 1 year, face value R$ 1,000:\
Price = 1,000 / (1.12)^1 = R$ 892.86\
\
If the market rate rises to 14%:\
Price = 1,000 / (1.14)^1 = R$ 877.19   ← bond lost value</div>\
        <div class="formula-note">\
          The formula works for any maturity. Bonds with longer maturities are <code>more sensitive</code> to rate changes — a 10-year bond falls much more than a 6-month bond when rates rise by 1%.\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">⏱️</div>\
          <div class="product-name">Duration (Macaulay Duration)</div>\
        </div>\
        <div class="product-desc">\
          <strong>Duration</strong> measures the weighted average maturity of a bond&#39;s cash flows, using the present value of each payment as the weight. It is a measure of interest rate risk: the greater the duration, the more sensitive the bond is to rate changes.<br><br>\
          <strong>Modified Duration</strong> is the most useful measure for the investor. It says: "if interest rates rise 1%, my bond loses approximately X% of value":<br><br>\
          <em>Modified Duration = Macaulay Duration / (1 + rate/n)</em><br><br>\
          For example, if a bond has a Modified Duration of <strong>7 years</strong> and the market rate rises by 1 p.p. (from 12% to 13%), the bond price falls approximately <strong>7%</strong>. If the rate falls 1 p.p., the price rises ~7%.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Tesouro Selic: duration ≈ 0 (no market risk)</span>\
          <span class="product-stat">Tesouro IPCA+ 2035: duration ~7 years</span>\
          <span class="product-stat">Tesouro Pré 2033: duration ~6 years</span>\
        </div>\
      </div>\
      <div class="example-box">\
        <div class="example-header">📘 Practical Example: Mark-to-Market on Tesouro IPCA+</div>\
        <div class="example-body">\
          <p>You buy Tesouro IPCA+ 2035 with a rate of <strong>IPCA + 6.5% per year</strong>, investing R$ 10,000.</p>\
          <p>6 months later, the market starts pricing in more fiscal risk. The rate on the same bond rises to <strong>IPCA + 7.5% per year</strong> (a 1 p.p. widening).</p>\
          <p>Since the bond has a Modified Duration of ~8 years, the estimated price change is:</p>\
          <div class="example-result">\
            <strong>Estimated change:</strong> −8 × (+1%) = −8% depreciation<br>\
            <strong>Your mark-to-market balance:</strong> R$ 10,000 × 0.92 = <strong>R$ 9,200</strong><br>\
            <strong>But if you hold until 2035:</strong> you will receive exactly IPCA + 6.5% on the amount invested — the R$ 800 "loss" is only temporary.\
          </div>\
        </div>\
      </div>\
      <div class="alert tip">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>Practical rule:</strong> Use Tesouro Selic for money you may need before maturity (near-zero duration — no price fluctuation). Use Tesouro IPCA+ and fixed-rate bonds only with money that can stay until maturity, or if you want to speculate on the direction of interest rates.</div>\
      </div>\
    ';


SEC_EN['tesouro'] = '\
      <div class="section-title"><span class="section-icon">🏛️</span> Treasury Direct (Tesouro Direto)</div>\
      <div class="section-body">\
        <p><strong>Treasury Direct (Tesouro Direto)</strong> is the federal government program that allows individuals to buy federal government bonds online, with a minimum investment of about R$ 30. It is considered the safest investment in Brazil: the issuer is the federal government, which can print money to honor its commitments.</p>\
        <p>Bonds are held in custody at B3 and can be traded on any business day — but the selling price before maturity is the market price (mark-to-market), which may be lower than the purchase price.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">💚</div>\
          <div class="product-name">Tesouro Selic</div>\
          <span class="product-tag rf">Floating Rate</span>\
        </div>\
        <div class="product-desc">\
          Earns the Selic rate accrued daily. It is the only Treasury bond with no significant mark-to-market risk — its value rises every day, never falls under normal conditions.<br><br>\
          <strong>Ideal use:</strong> emergency reserve (redemption on the next business day), short-term goals (up to 2 years), and as a "parking spot" while analyzing other opportunities.<br><br>\
          <strong>Custody fee:</strong> 0.20% per year charged by B3 (exempt for assets up to R$ 10,000 in Tesouro Selic).\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Liquidity: D+1</span>\
          <span class="product-stat">No market risk</span>\
          <span class="product-stat">Regressive income tax table</span>\
          <span class="product-stat">Best for emergency reserve</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🔵</div>\
          <div class="product-name">Tesouro IPCA+</div>\
          <span class="product-tag rf">Hybrid</span>\
        </div>\
        <div class="product-desc">\
          Earns IPCA + pre-fixed rate. The real rate (above inflation) is guaranteed if you hold to maturity. Available with and without semi-annual coupon payments.<br><br>\
          <strong>With Semi-Annual Interest:</strong> you receive part of the returns every 6 months — ideal for those seeking periodic income (retirees). But coupons are taxed under the regressive table, reducing the compound interest effect.<br><br>\
          <strong>Without Semi-Annual Interest:</strong> all returns accumulate until maturity. Better for long-term accumulation. Note: subject to intense mark-to-market.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Inflation protection</span>\
          <span class="product-stat">Guaranteed real return at maturity</span>\
          <span class="product-stat">Long duration: high market risk</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🟡</div>\
          <div class="product-name">Tesouro Pré-fixado (Fixed Rate)</div>\
          <span class="product-tag rf">Fixed Rate</span>\
        </div>\
        <div class="product-desc">\
          Rate defined at the time of purchase for the entire period. Ex: 13.50% per year until 2027. You know exactly the value you will receive at maturity (R$ 1,000 per bond).<br><br>\
          <strong>When it makes sense:</strong> when the investor believes that Copom will cut rates — locking in 13.5% today means if the Selic falls to 10%, you still earn 13.5%. And if you sell before maturity, the price will have risen.<br><br>\
          <strong>Main risk:</strong> if rates rise after purchase, the bond price falls. Those who sell before maturity may incur a loss. Those who hold until the end receive exactly what was agreed.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Rate locked at purchase</span>\
          <span class="product-stat">Speculation on rate cuts</span>\
          <span class="product-stat">High market risk if sold early</span>\
        </div>\
      </div>\
      <div class="example-box">\
        <div class="example-header">📘 Comparison: Tesouro IPCA+ in Practice</div>\
        <div class="example-body">\
          <p>You buy Tesouro IPCA+ with a rate of <strong>IPCA + 6% per year</strong> for R$ 1,000. The following year, inflation (IPCA) was 5%.</p>\
          <div class="example-result">\
            <strong>Nominal return for the year:</strong> (1.06 × 1.05) − 1 = <strong>11.3%</strong><br>\
            <strong>Real return:</strong> 6% (above inflation)<br>\
            <strong>Your gross balance after 1 year:</strong> R$ 1,113<br>\
            <strong>After income tax (22.5% on R$ 113):</strong> R$ 1,000 + R$ 87.58 = <strong>R$ 1,087.58 net</strong>\
          </div>\
        </div>\
      </div>\
    ';


SEC_EN['cdb'] = '\
      <div class="section-title"><span class="section-icon">🏦</span> CDB (Bank Deposit Certificate)</div>\
      <div class="section-body">\
        <p>The <strong>CDB (Certificado de Depósito Bancário)</strong> is a debt security issued by banks to raise funds from the public. When you buy a CDB, you are literally lending money to the bank. The bank uses this money to finance its lending operations, earning the spread between what it pays you and what it charges on loans.</p>\
        <p>The CDB is protected by the <strong>FGC (Credit Guarantee Fund)</strong> up to R$ 250,000 per taxpayer ID per financial conglomerate, with a global limit of R$ 1 million every 4 years.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">📊</div>\
          <div class="info-card-title">Floating Rate CDB (% CDI)</div>\
          <div class="info-card-body">The most common. Earns a percentage of the CDI. The <strong>larger the bank, the lower the rate</strong> (90–100% CDI). Smaller banks and fintechs pay 110–130% CDI to attract capital — the FGC up to R$250k makes this strategy viable.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📌</div>\
          <div class="info-card-title">Fixed Rate CDB</div>\
          <div class="info-card-body">Rate set at contracting. Ex: 13% per year. You know the exact amount to receive. Same logic as fixed-rate Treasury bonds: good when you believe rates will fall.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔗</div>\
          <div class="info-card-title">IPCA+ CDB</div>\
          <div class="info-card-body">Earns inflation + fixed rate. Inflation protection with FGC coverage. Alternative to Tesouro IPCA+, with the bank&#39;s credit risk — but protected by FGC up to R$250k.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">⚡</div>\
          <div class="info-card-title">Daily Liquidity CDB</div>\
          <div class="info-card-body">Allows redemption at any time without penalty. Generally pays less (90–100% CDI). Alternative to Tesouro Selic for emergency reserves in digital banks.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Regressive Income Tax Table — same for CDB, Treasury, and other taxed fixed income</div>\
        <div class="concept-body">\
          Income tax applies <strong>only on earnings</strong> (not on the principal), with a decreasing rate based on the holding period:<br><br>\
          <strong>Up to 180 days:</strong> 22.5% &nbsp;|&nbsp; <strong>181 to 360 days:</strong> 20% &nbsp;|&nbsp; <strong>361 to 720 days:</strong> 17.5% &nbsp;|&nbsp; <strong>Above 720 days:</strong> 15%<br><br>\
          Income tax is withheld at source by the broker/bank at redemption. In addition, there is also <strong>IOF</strong> for redemptions within 30 days — the rate starts at 96% of earnings on day 1 and decreases linearly to zero on day 30.\
        </div>\
      </div>\
      <div class="alert tip">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>Ladder strategy:</strong> To maximize returns with liquidity, build a "ladder" of CDBs with different maturities (3, 6, 12, 24 months). As each CDB matures, reinvest in the longest available term — benefiting from higher rates at longer maturities without losing periodic access to your money.</div>\
      </div>\
    ';


SEC_EN['lci-lca'] = '\
      <div class="section-title"><span class="section-icon">🌾</span> LCI and LCA</div>\
      <div class="section-body">\
        <p><strong>LCI (Real Estate Credit Bill)</strong> and <strong>LCA (Agribusiness Credit Bill)</strong> are securities issued by banks to raise funds for real estate financing (LCI) and agribusiness (LCA). The most important advantage is the <strong>total income tax exemption for individuals</strong> — which is why they offer lower gross rates, but the net return is usually equal to or higher than an equivalent CDB.</p>\
      </div>\
      <div class="use-list">\
        <div class="use-item yes">\
          <span class="use-dot">✅</span>\
          <div><strong>Advantages:</strong> Income tax exemption (the nominal gain is the net gain), FGC protection up to R$ 250k, net return generally higher than equivalent taxed CDB, various options on digital platforms.</div>\
        </div>\
        <div class="use-item no">\
          <span class="use-dot">⚠️</span>\
          <div><strong>Limitations:</strong> Mandatory lock-up period (90 days for LCI, 90 days for LCA — but in practice many have a minimum term of 1 year). Lower liquidity than Tesouro Selic. No daily liquidity like many CDBs.</div>\
        </div>\
      </div>\
      <div class="example-box" style="margin-top:16px">\
        <div class="example-header">📘 How to calculate the equivalent rate: LCI/LCA vs CDB</div>\
        <div class="example-body">\
          <p>To compare correctly, convert the tax-exempt rate to the equivalent gross taxed rate. The formula is:</p>\
          <p><strong>Equivalent gross rate = LCI/LCA rate ÷ (1 − income tax rate)</strong></p>\
          <p>Example: LCI paying 88% CDI, compared with a long-term CDB (15% income tax rate):</p>\
          <div class="example-result">\
            <strong>Equivalent gross rate:</strong> 88% ÷ (1 − 0.15) = 88% ÷ 0.85 = <strong>103.5% CDI</strong><br>\
            In other words: the LCI at 88% CDI is equivalent to a CDB at 103.5% CDI. If the bank offers a CDB above 103.5% CDI, the CDB is better. If below, the LCI wins.\
          </div>\
        </div>\
      </div>\
    ';


SEC_EN['cri-cra'] = '\
      <div class="section-title"><span class="section-icon">🏗️</span> CRI and CRA</div>\
      <div class="section-body">\
        <p><strong>CRI (Real Estate Receivables Certificate)</strong> and <strong>CRA (Agribusiness Receivables Certificate)</strong> are securitization instruments. Unlike LCI/LCA (issued by banks), CRIs and CRAs are issued by <strong>securitization companies</strong> — specialized firms that "package" receivables into tradeable securities.</p>\
        <p>The process: a construction company has hundreds of clients paying monthly installments. It assigns these future receivables to a securitizer, which turns them into CRIs and sells them to investors. You buy the CRI and receive payments as clients pay their installments.</p>\
      </div>\
      <div class="cards-grid-2" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🏠</div>\
          <div class="info-card-title">CRI (Real Estate Receivables Certificate)</div>\
          <div class="info-card-body">Backed by real estate receivables: mortgage installments, rents, CCIs (Real Estate Credit Notes). <strong>Income tax exempt for individuals.</strong> Can be indexed to IPCA, IGP-M, CDI or fixed rate. Widely used by companies such as MRV, Cyrela, shopping centers and developers.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🌽</div>\
          <div class="info-card-title">CRA (Agribusiness Receivables Certificate)</div>\
          <div class="info-card-body">Backed by agribusiness receivables: CPRs (Rural Product Notes), commodity contracts, rural financing. <strong>Income tax exempt for individuals.</strong> Common issuers: JBS, BRF, Cosan, agricultural cooperatives, trading companies.</div>\
        </div>\
      </div>\
      <div class="use-list" style="margin-top:16px">\
        <div class="use-item yes">\
          <span class="use-dot">✅</span>\
          <div><strong>Advantages over LCI/LCA:</strong> Income tax exemption (same), but can offer higher rates (higher credit risk = greater premium). Accessible via platforms such as XP, BTG, with some having a minimum investment of R$ 1,000.</div>\
        </div>\
        <div class="use-item no">\
          <span class="use-dot">⚠️</span>\
          <div><strong>Higher risk than LCI/LCA:</strong> <strong>Not covered by FGC.</strong> The credit risk belongs to the issuer. If the company does not pay, CRI/CRA investors may incur losses. Always check the <strong>credit rating</strong> of the issuance.</div>\
        </div>\
        <div class="use-item warn">\
          <span class="use-dot">📋</span>\
          <div><strong>Credit rating:</strong> agencies such as Moody&#39;s, Fitch and S&amp;P (international scale) or Austin and Liberum (Brazilian) evaluate the risk of the issuance. AAA or AA = low risk. BBB = medium risk (investment grade). BB and below = high risk (high yield / "junk").</div>\
        </div>\
      </div>\
    ';


SEC_EN['debentures'] = '\
      <div class="section-title"><span class="section-icon">🏢</span> Debentures</div>\
      <div class="section-body">\
        <p><strong>Debentures</strong> are debt securities issued by companies to raise capital directly from investors, without needing a bank as intermediary. When a company needs capital to expand, pay off expensive debt, or finance projects, it can issue debentures instead of taking out a loan — generally at a lower cost and with longer terms.</p>\
        <p>In return, the investor receives periodic interest (coupons) and the principal at maturity. Debentures are regulated by the CVM and traded on the secondary market through brokers.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">⚡</div>\
          <div class="info-card-title">Incentivized Debentures (Law 12,431)</div>\
          <div class="info-card-body"><strong>Income tax exempt for individuals.</strong> Issued to finance infrastructure projects (electricity, highways, sanitation, telecom, ports). Offer the best net rates. Issuers: Copel, Eletrobras, Equatorial, CCR, Iguá Saneamento.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💰</div>\
          <div class="info-card-title">Regular Debentures</div>\
          <div class="info-card-body">Subject to regressive income tax. Offer higher gross rates to compensate for taxation. Issued by any publicly listed company. No FGC protection — full credit risk.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔄</div>\
          <div class="info-card-title">Convertible Debentures</div>\
          <div class="info-card-body">Can be converted into shares of the issuing company at the option of the holder or the company. Mixes fixed income and equities: if the company grows a lot, you may become a shareholder on advantageous terms.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🛡️</div>\
          <div class="info-card-title">Guarantees and Covenants</div>\
          <div class="info-card-body">Debentures can have real guarantees (real estate, machinery), personal guarantees (surety), or be unsecured — receiving after other creditors in bankruptcy. Covenants are protective clauses: if the company exceeds X% of debt/EBITDA, it may be required to prepay.</div>\
        </div>\
      </div>\
      <div class="alert warn">\
        <span class="alert-icon">⚠️</span>\
        <div class="alert-body"><strong>Credit risk is real:</strong> Debentures have no FGC coverage. If the issuing company goes bankrupt or faces financial difficulties, payment may be delayed or partially lost. Always analyze the company&#39;s financial health (leverage, cash flow) and the issuance rating before investing.</div>\
      </div>\
    ';


SEC_EN['fundos-rf'] = '\
      <div class="section-title"><span class="section-icon">🧺</span> Fixed Income Funds</div>\
      <div class="section-body">\
        <p><strong>Fixed income funds</strong> are collective investment vehicles managed by a professional (fund manager). By investing in a fund, you buy shares and the manager allocates capital in different fixed income securities according to the fund&#39;s strategy. They are an option for those who want diversification and professional management with low initial capital.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🏦</div>\
          <div class="info-card-title">DI Fund / Simple Fixed Income Fund</div>\
          <div class="info-card-body">Invests mainly in Tesouro Selic and repo operations. Closely tracks the CDI. High liquidity (D+0 or D+1). Used as a savings account substitute. <strong>Watch the management fee</strong> — above 0.5% per year it starts eroding returns.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📈</div>\
          <div class="info-card-title">Private Credit Fund</div>\
          <div class="info-card-body">Invests in CRIs, CRAs, debentures and other private securities. Higher credit risk, higher potential return (CDI + 1 to 3%). Good option for those wanting access to private credit with diversification and professional management.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔵</div>\
          <div class="info-card-title">IPCA / Inflation Fund</div>\
          <div class="info-card-body">Concentrates in Tesouro IPCA+ and inflation-indexed securities. Protects against inflation in the long run. Subject to mark-to-market — may have negative returns in the short term if rates rise.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">⚠️</div>\
          <div class="info-card-title">Come-Cotas (Bi-Annual Tax Bite)</div>\
          <div class="info-card-body">Fixed income funds withhold income tax in advance in <strong>May and November</strong> each year, directly from fund shares. Rate: 15% (long term) or 20% (short term). Reduces the compound interest effect — a disadvantage compared to direct investment.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Fund vs. Direct Investment: when to use each?</div>\
        <div class="concept-body">\
          <strong>Use the fund when:</strong> the amount invested is small (does not reach the minimum for individual CRIs/CRAs), you want professional private credit management, or want automatic diversification among dozens of issuers.<br><br>\
          <strong>Prefer direct investment when:</strong> the capital allows accessing good issuances directly, the fund fees are high (above 0.7% p.a. for a DI fund is too expensive), or you want to avoid the come-cotas tax bite.<br><br>\
          <strong>Management fee:</strong> for DI funds, ideally below 0.3% p.a. For private credit, up to 1% p.a. may be justified by diversification and management.\
        </div>\
      </div>\
    ';


SEC_EN['previdencia'] = '\
      <div class="section-title"><span class="section-icon">🏖️</span> Private Pension (PGBL and VGBL)</div>\
      <div class="section-body">\
        <p>Private pension is a long-term investment product with <strong>specific tax benefits</strong>. There are two types: PGBL and VGBL — choosing the wrong one can be costly. The difference is fundamental and depends on your income tax filing method.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📋</div>\
          <div class="product-name">PGBL — Free Benefit Generator Plan</div>\
          <span class="product-tag rf">Full Declaration</span>\
        </div>\
        <div class="product-desc">\
          <strong>Tax benefit at entry:</strong> contributions can be deducted from the income tax base in the annual return, up to the limit of <strong>12% of gross taxable income</strong>. This defers tax payment to the time of redemption.<br><br>\
          <strong>Tax at redemption:</strong> income tax applies to the <strong>total amount redeemed</strong> (principal + earnings), since no tax was paid at entry. It only makes sense for those who file the full tax return.<br><br>\
          <strong>Example of benefit:</strong> annual taxable income of R$ 120,000 → PGBL contribution of R$ 14,400 (12%) → taxable base falls to R$ 105,600 → income tax reduced by up to R$ 3,888 in the year (effective rate ~27%).\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">For those who file full tax return</span>\
          <span class="product-stat">Deducts up to 12% of income</span>\
          <span class="product-stat">Tax at redemption on total amount</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">💼</div>\
          <div class="product-name">VGBL — Free Benefit Life Generator</div>\
          <span class="product-tag rf">Simplified Declaration</span>\
        </div>\
        <div class="product-desc">\
          <strong>No deduction at entry:</strong> you do not deduct contributions from annual income tax. In return, at redemption, income tax applies <strong>only on earnings</strong> (not on the principal).<br><br>\
          <strong>Suitable for:</strong> those who use the simplified declaration (would not benefit from PGBL), those who have already contributed the maximum 12% to PGBL and want to contribute more, and for estate planning (does not go through probate).\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">For simplified tax declaration</span>\
          <span class="product-stat">No deduction at entry</span>\
          <span class="product-stat">Tax at redemption only on earnings</span>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Progressive vs. Regressive Table — choice is permanent per plan</div>\
        <div class="concept-body">\
          <strong>Progressive Table:</strong> income tax by the same calculation as salary (0%, 7.5%, 15%, 22.5%, 27.5%). Advantageous for small redemptions (less than R$ 2,800/month are tax-exempt). May result in a tax refund in the annual return.<br><br>\
          <strong>Regressive Table:</strong> the rate decreases with accumulation time: 35% (up to 2 years), 30% (2–4 years), 25% (4–6 years), 20% (6–8 years), 15% (8–10 years), <strong>10% (above 10 years)</strong>. For those investing for more than 10 years, the 10% rate is lower than any bracket of the progressive table on high earnings.<br><br>\
          <strong>General rule:</strong> for those with a 10+ year horizon and high income, regressive is better. For those who will redeem in a few years with low income, progressive is better.\
        </div>\
      </div>\
      <div class="alert tip">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>Watch out for fees:</strong> Private pension can have a loading fee (percentage charged on each contribution — avoid), management fee (charged annually — demand below 1% for a conservative fund) and exit fee (charged at redemption — avoid). Always compare total costs before contracting.</div>\
      </div>\
    ';


SEC_EN['comparar-rf'] = '\
      <div class="section-title"><span class="section-icon">🔢</span> How to Compare Fixed Income Investments</div>\
      <div class="section-body">\
        <p>To correctly compare fixed income investments with different types of remuneration, taxation and terms, always use the <strong>net, equivalent and real rate</strong>. Comparing gross rates between taxed and exempt investments is a common — and costly — mistake.</p>\
      </div>\
      <div class="steps">\
        <div class="step">\
          <div class="step-num">1</div>\
          <div class="step-body">\
            <div class="step-title">Convert everything to an annual basis</div>\
            <div class="step-desc"><strong>"1% per month"</strong> is not 12% per year. The correct conversion uses compound interest: (1.01)^12 − 1 = <strong>12.68% per year</strong>. Never add monthly rates; always compound them.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">2</div>\
          <div class="step-body">\
            <div class="step-title">Deduct income tax</div>\
            <div class="step-desc">For taxed investments (CDB, Treasury), apply the income tax rate according to the planned term. Exempt investments (LCI, LCA, CRI, CRA, incentivized debentures) keep the gross rate as the net rate.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">3</div>\
          <div class="step-body">\
            <div class="step-title">Compare on the same basis (% CDI equivalent or % p.a.)</div>\
            <div class="step-desc">To compare LCI (exempt) with CDB (taxed): <strong>LCI rate ÷ (1 − income tax rate)</strong>. Example: LCI 90% CDI ÷ 0.85 = 105.9% CDI equivalent gross for someone paying 15% income tax.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">4</div>\
          <div class="step-body">\
            <div class="step-title">Deduct expected inflation</div>\
            <div class="step-desc">Real net rate = [(1 + net rate) / (1 + expected inflation)] − 1. This shows the real purchasing power gain. A CDB at 10% net with 8% inflation yields only 1.85% real gain.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">5</div>\
          <div class="step-body">\
            <div class="step-title">Consider liquidity, risk and term</div>\
            <div class="step-desc">A higher rate on an investment with lower liquidity, higher credit risk or longer term may not compensate. Evaluate the additional premium: is it worth it? For how long will you not need this money?</div>\
          </div>\
        </div>\
      </div>\
      <div style="overflow-x:auto; margin-top:20px">\
        <table class="compare-table">\
          <thead>\
            <tr>\
              <th>Investment</th>\
              <th>Issuer</th>\
              <th>Income Tax</th>\
              <th>FGC</th>\
              <th>Liquidity</th>\
              <th>Credit Risk</th>\
            </tr>\
          </thead>\
          <tbody>\
            <tr>\
              <td>Tesouro Selic</td>\
              <td>Federal Gov.</td>\
              <td class="bad">Yes (regressive)</td>\
              <td class="bad">No</td>\
              <td class="good">D+1 (daily)</td>\
              <td class="good">Minimal</td>\
            </tr>\
            <tr>\
              <td>Tesouro IPCA+ / Fixed Rate</td>\
              <td>Federal Gov.</td>\
              <td class="bad">Yes (regressive)</td>\
              <td class="bad">No</td>\
              <td class="mid">At maturity*</td>\
              <td class="good">Minimal</td>\
            </tr>\
            <tr>\
              <td>CDB</td>\
              <td>Banks</td>\
              <td class="bad">Yes (regressive)</td>\
              <td class="good">Yes (up to R$250k)</td>\
              <td class="mid">Varies by bond</td>\
              <td class="good">Low (with FGC)</td>\
            </tr>\
            <tr>\
              <td>LCI / LCA</td>\
              <td>Banks</td>\
              <td class="good">Exempt</td>\
              <td class="good">Yes (up to R$250k)</td>\
              <td class="bad">With min. lock-up</td>\
              <td class="good">Low (with FGC)</td>\
            </tr>\
            <tr>\
              <td>CRI / CRA</td>\
              <td>Securitizers</td>\
              <td class="good">Exempt</td>\
              <td class="bad">No</td>\
              <td class="mid">Secondary market</td>\
              <td class="mid">Medium (no FGC)</td>\
            </tr>\
            <tr>\
              <td>Incentivized Debentures</td>\
              <td>Companies</td>\
              <td class="good">Exempt</td>\
              <td class="bad">No</td>\
              <td class="bad">Low liquidity</td>\
              <td class="mid">Medium (no FGC)</td>\
            </tr>\
            <tr>\
              <td>DI Fund (&lt; 0.3% fee)</td>\
              <td>Fund Manager</td>\
              <td class="bad">Yes + come-cotas</td>\
              <td class="bad">No</td>\
              <td class="good">D+0 or D+1</td>\
              <td class="good">Low</td>\
            </tr>\
          </tbody>\
        </table>\
      </div>\
      <div class="alert info" style="margin-top:14px">\
        <span class="alert-icon">ℹ️</span>\
        <div class="alert-body">* Tesouro IPCA+ and fixed-rate bonds have daily liquidity (you can sell before maturity), but the selling price is the market price — which may be lower than the purchase price. "At maturity" indicates the only moment of liquidity without market risk.</div>\
      </div>\
    ';

// ── MODULE 3: EQUITIES ──
SEC_EN['o-que-rv'] = '\
      <div class="section-title"><span class="section-icon">🎲</span> What is Equities (Variable Income)</div>\
      <div class="section-body">\
        <p>In <strong>equities</strong>, you do not know how much you will earn — or even if you will earn anything. The return depends on factors such as company results, the macroeconomic environment, market expectations, foreign capital flows, monetary policy and, to a large extent, the collective psychology of investors.</p>\
        <p>The key conceptual difference from fixed income: in equities, you are not a creditor (you lent money), you are a <strong>partner</strong>. By buying shares in a company, you participate in its profits and losses proportionally.</p>\
      </div>\
      <div class="use-list">\
        <div class="use-item yes">\
          <span class="use-dot">✅</span>\
          <div><strong>Why invest in equities:</strong> Over the long term (10–20 years), stocks have historically outperformed fixed income in most markets. In Brazil, the Ibovespa adjusted for inflation generated positive real returns over 10+ year horizons in most periods. Participating in the growth of the best companies in the country is one of the most powerful wealth-creation mechanisms.</div>\
        </div>\
        <div class="use-item no">\
          <span class="use-dot">⚠️</span>\
          <div><strong>Real risks and need for preparation:</strong> You can lose 30%, 50% or even 100% of capital in extreme cases (company going bankrupt). Volatility requires a long-term horizon, diversification and emotional control. Never invest in equities money you may need in less than 3–5 years.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Types of Risk in Equities</div>\
        <div class="concept-body">\
          <strong>Systematic risk (non-diversifiable):</strong> affects all market assets — economic crises, pandemics, wars, changes in global monetary policy. Diversifying within the stock market does not protect against this risk.<br><br>\
          <strong>Non-systematic risk (diversifiable):</strong> specific to a company or sector — management scandal, loss of a key customer, adverse sector regulation, industrial plant disaster. Can be eliminated with diversification across 15–20 companies in different sectors.<br><br>\
          <strong>Risk premium:</strong> the difference between the expected return on stocks and the risk-free rate (Selic/CDI). The investor demands this premium for accepting volatility. In Brazil, the historical equity risk premium is 4–6% per year above the CDI — but with enormous variation.\
        </div>\
      </div>\
    ';


SEC_EN['acoes'] = '\
      <div class="section-title"><span class="section-icon">📄</span> Stocks: How They Work</div>\
      <div class="section-body">\
        <p>A <strong>stock</strong> represents the smallest fraction of a company&#39;s share capital. By buying 100 shares of Petrobras, you become a partner of Petrobras with a participation proportional to the number of shares you hold relative to the total issued by the company.</p>\
        <p>As a shareholder, you have property rights (participation in profits via dividends and JCP, priority in receiving assets in liquidation) and, depending on the type of share, political rights (voting at shareholder meetings).</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🗳️</div>\
          <div class="info-card-title">Ordinary Shares (ON) — suffix 3</div>\
          <div class="info-card-body">Give <strong>voting rights</strong> at the company&#39;s general meetings. Allow participation in decisions such as election of board members, approval of mergers and dividend distribution. For the small investor, the vote has limited practical relevance, but activists and funds use them to pressure management.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💵</div>\
          <div class="info-card-title">Preferred Shares (PN) — suffix 4</div>\
          <div class="info-card-body">No voting right, but with <strong>preference in receiving dividends</strong> (minimum 10% above ordinary shares). In bankruptcy, they have priority over ordinary shares. Historically the most traded by retail investors. Ex: PETR4, VALE3 (ON), ITUB4.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🌐</div>\
          <div class="info-card-title">Units — suffix 11</div>\
          <div class="info-card-body">Share deposit certificates representing a bundle of ordinary and preferred shares together. Example: SANB11 (Santander) represents 1 ON + 1 PN. Combine voting rights and dividend preference.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔢</div>\
          <div class="info-card-title">Ticker and Lot</div>\
          <div class="info-card-body">The <strong>ticker</strong> is the stock code (PETR4, MGLU3, VALE3). On B3, stocks are traded in <strong>lots of 100</strong> in the main market. The fractional market (suffix F) allows buying from 1 to 99 units — ideal for beginners.</div>\
        </div>\
      </div>\
      <div class="formula-box">\
        <div class="formula-label">Gordon Growth Model (Dividend Discount)</div>\
        <div class="formula-eq">Fair Price = D₁ / (r − g)\
\
D₁ = expected dividend next year\
r  = investor&#39;s required rate of return\
g  = perpetual dividend growth rate\
\
Example: D₁ = R$ 2.00 | r = 12% | g = 5%\
P = 2.00 / (0.12 − 0.05) = R$ 28.57 per share</div>\
        <div class="formula-note">In practice, the price fluctuates around this theoretical value depending on market expectations and short-term sentiment.</div>\
      </div>\
    ';


SEC_EN['ipo'] = '\
      <div class="section-title"><span class="section-icon">🚀</span> IPO: Going Public</div>\
      <div class="section-body">\
        <p>An <strong>IPO (Initial Public Offering)</strong> is the process by which a private company sells its shares to the public for the first time and becomes listed on the stock exchange. It is a transformative event: the company gains access to long-term capital, its founders and early investors can monetize part of their stakes, and the company gains visibility and credibility.</p>\
      </div>\
      <div class="steps">\
        <div class="step">\
          <div class="step-num">1</div>\
          <div class="step-body">\
            <div class="step-title">Due diligence and selection of underwriters</div>\
            <div class="step-desc">The company hires investment banks (BTG, XP, Itaú BBA, Goldman Sachs) as underwriters. They conduct due diligence and prepare the <strong>prospectus</strong> — a document with all information about the company, risks, use of proceeds and audited financial statements.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">2</div>\
          <div class="step-body">\
            <div class="step-title">Registration with CVM and roadshow</div>\
            <div class="step-desc">The prospectus is submitted to the CVM for approval. Meanwhile, the underwriters conduct the <strong>roadshow</strong>: presentations to large institutional investors (funds, insurers, foreigners) to generate interest and collect price indications.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">3</div>\
          <div class="step-body">\
            <div class="step-title">Bookbuilding and pricing</div>\
            <div class="step-desc"><strong>Bookbuilding</strong> is the price formation process: institutional investors indicate how many shares they would buy and at what price. The underwriters set an indicative range and, at the end, fix the <strong>IPO price</strong> based on aggregated demand.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">4</div>\
          <div class="step-body">\
            <div class="step-title">Retail offering and stock exchange debut</div>\
            <div class="step-desc">Individual investors can reserve shares through brokers during the subscription period. On the IPO day, shares start trading on B3. The price may rise or fall immediately — there is short-term pressure from the market.</div>\
          </div>\
        </div>\
        <div class="step">\
          <div class="step-num">5</div>\
          <div class="step-body">\
            <div class="step-title">Lock-up and post-IPO period</div>\
            <div class="step-desc">Original shareholders are prevented from selling for a <strong>lock-up</strong> period — generally 6 to 12 months. When it expires, there is a risk of selling pressure. Attentive investors monitor the lock-up deadline.</div>\
          </div>\
        </div>\
      </div>\
      <div class="alert warn">\
        <span class="alert-icon">⚠️</span>\
        <div class="alert-body"><strong>IPO for retail: beware of the hype.</strong> Studies show that most IPOs deliver below-index performance in the 3–5 years following the debut. The company has an incentive to price the IPO high (maximum capital raised); private equity funds want to exit with appreciation. Retail investors frequently get the most expensive part. The exception is good companies bought at a reasonable price with a long horizon.</div>\
      </div>\
    ';


SEC_EN['b3'] = '\
      <div class="section-title"><span class="section-icon">🏛️</span> The Stock Exchange (B3)</div>\
      <div class="section-body">\
        <p><strong>B3 (Brasil, Bolsa, Balcão)</strong> is Brazil&#39;s only stock exchange, resulting from the merger of BM&amp;FBovespa with Cetip in 2017. It is where stocks, FIIs, ETFs, futures contracts, options and other assets are traded. B3 handles the trading system, clearing and custody of assets.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">📊</div>\
          <div class="info-card-title">Ibovespa (IBOV)</div>\
          <div class="info-card-body">B3&#39;s main index (~90 most traded stocks). Rebalanced every 4 months. Weighted by liquidity (traded volume). Companies such as VALE3, PETR4, ITUB4 have a large weight — which makes it concentrated in a few sectors (commodities and finance).</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🏆</div>\
          <div class="info-card-title">Other Indices</div>\
          <div class="info-card-body"><strong>IBRX-50:</strong> 50 most traded stocks (free float). <strong>SMLL:</strong> small caps. <strong>IDIV:</strong> highest dividend payers. <strong>IFIX:</strong> real estate funds. <strong>IBRA:</strong> Brazil Broad (most comprehensive).</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">⏰</div>\
          <div class="info-card-title">Trading Hours</div>\
          <div class="info-card-body">Pre-opening: 09h45–10h. Regular session: 10h–17h. After-market: 17h25–18h. <strong>Circuit breaker:</strong> halts 30 min if Ibov falls 10%; halts 1h if it falls 15%. Prevents panic and manipulation on days of sharp declines.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📋</div>\
          <div class="info-card-title">Order Types</div>\
          <div class="info-card-body"><strong>Market order:</strong> immediate execution at the best price. <strong>Limit order:</strong> sets a maximum buy price. <strong>Stop loss:</strong> automatic sell if price falls to X. <strong>Stop gain:</strong> automatic sell if price rises to X.</div>\
        </div>\
      </div>\
      <div class="alert info">\
        <span class="alert-icon">ℹ️</span>\
        <div class="alert-body"><strong>Income tax on stocks:</strong> Monthly sales below R$ 20,000 are <strong>exempt from income tax</strong> (swing trade). Above that: 15% on profit (swing) or 20% (day trade). Calculation is monthly and payment is made via DARF by the last business day of the following month. You are responsible — the broker does not calculate or pay for you.</div>\
      </div>\
    ';


SEC_EN['demonstrativos'] = '\
      <div class="section-title"><span class="section-icon">📑</span> Financial Statements</div>\
      <div class="section-body">\
        <p>To invest in stocks on a solid basis, you need to be able to read the three fundamental statements: <strong>Income Statement, Balance Sheet and Cash Flow Statement</strong>. Companies listed on B3 publish these documents quarterly (ITR) and annually (DFP) on the CVM platform and on their Investor Relations (IR) website.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📊</div>\
          <div class="product-name">Income Statement (DRE)</div>\
          <span class="product-tag rv">Performance</span>\
        </div>\
        <div class="product-desc">The income statement shows how much the company <strong>generated and spent in a given period</strong>, culminating in profit or loss. Read always from top to bottom:</div>\
        <div style="font-size:13px; color:var(--txt2); line-height:1.9; font-family:var(--font-mono); background:var(--bg3); padding:16px; border-radius:8px; margin-bottom:14px;">\
          Gross Revenue<br>\
          <span style="color:var(--acc)">  (−) Deductions</span> (sales taxes, returns)<br>\
          = Net Revenue<br>\
          <span style="color:var(--acc)">  (−) COGS</span> (cost of goods/services sold)<br>\
          = <strong style="color:var(--y)">Gross Profit</strong> → Gross Margin = Gross Profit / Net Revenue<br>\
          <span style="color:var(--acc)">  (−) Operating Expenses</span> (sales, G&amp;A, R&amp;D)<br>\
          = <strong style="color:var(--y)">EBITDA</strong> (proxy for operating cash generation)<br>\
          <span style="color:var(--acc)">  (−) D&amp;A</span> (depreciation &amp; amortization)<br>\
          = <strong style="color:var(--y)">EBIT</strong> (operating income / result before financial)<br>\
          <span style="color:var(--acc)">  (±) Financial Result</span> (interest, FX variation)<br>\
          = EBT (earnings before tax)<br>\
          <span style="color:var(--acc)">  (−) Income Tax &amp; Social Contribution</span><br>\
          = <strong style="color:var(--y)">Net Income</strong>\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">High gross margin = pricing power</span>\
          <span class="product-stat">EBITDA = operational efficiency</span>\
          <span class="product-stat">Net income = basis for dividends</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">⚖️</div>\
          <div class="product-name">Balance Sheet</div>\
          <span class="product-tag rv">Position</span>\
        </div>\
        <div class="product-desc">The balance sheet is a <strong>snapshot of the company at a moment in time</strong>. The fundamental equation: <strong>Assets = Liabilities + Shareholders&#39; Equity</strong></div>\
        <div class="formula-grid">\
          <div class="formula-box" style="margin:0">\
            <div class="formula-label">ASSETS</div>\
            <div class="formula-eq" style="font-size:12px">Current (up to 12 months):\
  Cash and equivalents\
  Accounts receivable\
  Inventories\
Non-Current:\
  PP&amp;E (property, plant &amp; equipment)\
  Intangibles (brands, patents)\
  Investments in associates</div>\
          </div>\
          <div class="formula-box" style="margin:0">\
            <div class="formula-label">LIABILITIES + EQUITY</div>\
            <div class="formula-eq" style="font-size:12px">Current (up to 12 months):\
  Suppliers\
  Short-term debt\
  Taxes payable\
Non-Current:\
  Long-term debt\
Shareholders&#39; Equity:\
  Capital + Reserves + Retained Earnings</div>\
          </div>\
        </div>\
        <div class="product-stats" style="margin-top:12px">\
          <span class="product-stat">Net Debt = Gross Debt − Cash</span>\
          <span class="product-stat">Current Ratio = Current Assets/Current Liabilities (ideal &gt; 1)</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">💧</div>\
          <div class="product-name">Cash Flow Statement (DFC)</div>\
          <span class="product-tag rv">Real Cash</span>\
        </div>\
        <div class="product-desc">\
          Shows the <strong>money that actually entered and left</strong> the cash. A company can have accounting profit and destroy cash — the cash flow statement reveals this.<br><br>\
          <strong>CFO (Operating):</strong> cash generated by operations. Should be positive and growing.<br>\
          <strong>CFI (Investing):</strong> capex, acquisitions. Negative is normal for growing companies.<br>\
          <strong>CFF (Financing):</strong> fundraising, dividends, stock buybacks.<br><br>\
          <strong>FCF (Free Cash Flow) = CFO − maintenance capex</strong> — the cash available to shareholders after maintaining the business. It is the most honest value metric and the basis for DCF.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">CFO &gt; Net Income = high earnings quality</span>\
          <span class="product-stat">FCF = basis of DCF valuation</span>\
        </div>\
      </div>\
    ';


SEC_EN['analise-fund'] = '\
      <div class="section-title"><span class="section-icon">📋</span> Fundamental Analysis</div>\
      <div class="section-body">\
        <p><strong>Fundamental analysis</strong> seeks to determine the intrinsic value of a company based on its economic and financial fundamentals. The goal is to find <strong>good companies trading at a price below their real value</strong> — and buy before the market notices the discount.</p>\
      </div>\
      <div class="cards-grid-2" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">💰</div>\
          <div class="info-card-title">P/E — Price / Earnings</div>\
          <div class="info-card-body">How much the market pays for each unit of earnings. <strong>P/E 15 = paying 15 years of current earnings.</strong> Always compare within the same sector. Banks: 8–12x. Utilities: 10–15x. Growth tech: 30–80x. Use Forward P/E (based on expected earnings) for growth companies.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📚</div>\
          <div class="info-card-title">P/B — Price / Book Value</div>\
          <div class="info-card-body">Compares the market price with the book value of equity. <strong>P/B &lt; 1 = company is worth less on the stock market than its assets</strong> — may be an opportunity or a value trap. Ideal for analyzing banks, insurers and asset-intensive companies.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🏭</div>\
          <div class="info-card-title">EV/EBITDA</div>\
          <div class="info-card-body"><strong>EV = Market Cap + Net Debt.</strong> Compares the total enterprise value with its operating cash generation. Allows comparing companies with different capital structures. Industrial: 6–10x. Retail: 8–15x. Tech: 15–40x.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📈</div>\
          <div class="info-card-title">ROE and ROIC</div>\
          <div class="info-card-body"><strong>ROE &gt; 15% consistently</strong> = competitive advantage. Decompose via DuPont: margin × turnover × leverage. <strong>ROIC &gt; WACC</strong> = company creates real value. ROIC &lt; WACC = destroys value even with positive accounting profit.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💳</div>\
          <div class="info-card-title">Net Debt / EBITDA</div>\
          <div class="info-card-body">Leverage in "years of cash generation." <strong>Below 2x:</strong> conservative. <strong>2–3x:</strong> moderate. <strong>Above 4x:</strong> highly leveraged, elevated risk in adverse cycles or rising rates.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🛡️</div>\
          <div class="info-card-title">Moat (Competitive Advantage)</div>\
          <div class="info-card-body">Barriers that protect the company from competition: <strong>strong brand, high switching cost, network effects, cost advantage, intangible assets</strong> (patents). Companies with moats sustain ROIC &gt; 15% for more than 10 consecutive years.</div>\
        </div>\
      </div>\
      <div class="faq-list" style="margin-top:20px">\
        <div class="faq-item" id="faq-pl">\
          <div class="faq-q" onclick="toggleFaq(&#39;faq-pl&#39;)">How to use P/E correctly? <span class="faq-arrow">▼</span></div>\
          <div class="faq-a">Compare P/E with: (1) the company&#39;s own historical average, (2) companies in the same sector, (3) expected growth rate. Use the <strong>PEG Ratio = P/E ÷ annual earnings growth</strong>. PEG &lt; 1 = potentially cheap; PEG &gt; 2 = expensive for its growth rate. A P/E of 25 for a company growing 25% per year (PEG = 1) can be cheaper than P/E 12 for a stagnant company (PEG = 6 or more).</div>\
        </div>\
        <div class="faq-item" id="faq-roe2">\
          <div class="faq-q" onclick="toggleFaq(&#39;faq-roe2&#39;)">Is high ROE always a positive sign? <span class="faq-arrow">▼</span></div>\
          <div class="faq-a">Not necessarily. By the <strong>DuPont Formula</strong>, ROE = Net Margin × Asset Turnover × Financial Leverage. A company can have artificially high ROE by being heavily indebted — which inflates the denominator (equity is smaller). High ROE sustained by <strong>margin and turnover</strong>, without excessive leverage, is the genuine quality signal.</div>\
        </div>\
        <div class="faq-item" id="faq-ebitda2">\
          <div class="faq-q" onclick="toggleFaq(&#39;faq-ebitda2&#39;)">Is EBITDA the same as cash generation? <span class="faq-arrow">▼</span></div>\
          <div class="faq-a">No. EBITDA ignores changes in working capital (a company can have positive EBITDA and negative CFO due to inventory/receivable build-up), capex and cash taxes. Charlie Munger quipped: "anyone who uses EBITDA as a cash proxy doesn&#39;t know what depreciation is." <strong>FCF (CFO − maintenance capex)</strong> is the most honest metric.</div>\
        </div>\
        <div class="faq-item" id="faq-moat2">\
          <div class="faq-q" onclick="toggleFaq(&#39;faq-moat2&#39;)">How to identify a company&#39;s moat? <span class="faq-arrow">▼</span></div>\
          <div class="faq-a">Ask: "If I had R$ 1 billion and wanted to destroy this company, could I?" If the answer is "yes, easily" — the moat is weak. If it is "unlikely, because customers would not switch" — the moat is strong. Objective metrics: ROIC &gt; 15% for 10+ consecutive years, stable or growing margins even with sector expansion, and stable or growing market share despite competition.</div>\
        </div>\
      </div>\
    ';


SEC_EN['valuation'] = '\
      <div class="section-title"><span class="section-icon">🎯</span> Valuation: How to Price Companies</div>\
      <div class="section-body">\
        <p><strong>Valuation</strong> is the process of estimating the intrinsic value of a company. There is no single correct method — different approaches complement each other and each has blind spots. A good investor triangulates multiple methods.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📐</div>\
          <div class="product-name">DCF — Discounted Cash Flow</div>\
          <span class="product-tag rv">Most precise, most subjective</span>\
        </div>\
        <div class="product-desc">\
          The DCF projects future free cash flows and discounts them to the present at a risk rate (WACC). The enterprise value is the sum of these discounted flows + the terminal value (perpetuity).<br><br>\
          <strong>Step by step:</strong> (1) Project FCF for 5–10 years; (2) calculate Terminal Value; (3) calculate WACC; (4) discount everything to present; (5) subtract net debt; (6) divide by the number of shares.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Most used by sell-side analysts</span>\
          <span class="product-stat">Sensitive to WACC and growth rate</span>\
          <span class="product-stat">"Garbage in, garbage out"</span>\
        </div>\
      </div>\
      <div class="formula-box">\
        <div class="formula-label">Essential DCF formulas</div>\
        <div class="formula-eq">Enterprise Value (EV) = Σ [FCF_t / (1+WACC)^t] + Terminal Value\
\
Terminal Value = FCF_n × (1+g) / (WACC − g)\
  g = perpetuity growth rate (generally 3–5%)\
\
WACC = [Ke × E/(D+E)] + [Kd × (1−t) × D/(D+E)]\
  Ke = cost of equity (via CAPM)\
  Kd = cost of debt (before tax)\
\
CAPM: Ke = Rf + β × (Rm − Rf)\
  Rf = risk-free rate (long Tesouro IPCA+)\
  β  = stock&#39;s sensitivity to the market\
\
Fair Price = (EV − Net Debt) / Number of shares</div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📊</div>\
          <div class="product-name">Multiples Valuation</div>\
          <span class="product-tag rv">Relative to market</span>\
        </div>\
        <div class="product-desc">\
          Compares the company with peers in the same sector using multiples. Faster and more commonly used day-to-day. Logic: if all banks trade at P/B 1.5x, a bank at 0.8x may be cheap — or have some problem justifying the discount.<br><br>\
          <strong>Equity multiples:</strong> P/E, P/B, P/FCF, P/Sales<br>\
          <strong>Enterprise multiples (EV):</strong> EV/EBITDA, EV/EBIT, EV/Sales\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Fast and comparable</span>\
          <span class="product-stat">Can mislead in sectors in crisis</span>\
          <span class="product-stat">Best for mature, stable companies</span>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Margin of Safety — Ben Graham&#39;s principle</div>\
        <div class="concept-body">\
          Ben Graham (Buffett&#39;s mentor) taught that the investor should buy stocks with a <strong>margin of safety</strong> — paying significantly less than the estimated intrinsic value. If the DCF says the company is worth R$ 50 per share, buy at R$ 35 (30% discount).<br><br>\
          The margin of safety protects against estimation errors (your projections may be wrong), inflated multiples and unforeseen events.<br><br>\
          <strong>Buffett summarized:</strong> "I prefer a good company at a fair price over a mediocre company at a great price."\
        </div>\
      </div>\
    ';


SEC_EN['analise-tec'] = '\
      <div class="section-title"><span class="section-icon">📈</span> Technical Analysis (Chart Analysis)</div>\
      <div class="section-body">\
        <p><strong>Technical analysis</strong> studies historical price and volume patterns to identify trends and predict future movements. It rests on three premises: (1) price discounts everything; (2) prices move in trends; (3) history tends to repeat itself, as human psychology is constant.</p>\
        <p>It is more commonly used for <strong>entry and exit timing</strong> than for defining what to buy — it complements fundamental analysis.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🕯️</div>\
          <div class="product-name">Candlesticks and Reversal Patterns</div>\
          <span class="product-tag rv">Price Reading</span>\
        </div>\
        <div class="product-desc">\
          Each candle = open (O), high (H), low (L) and close (C). Green = closed above open. Red = closed below.<br><br>\
          <strong>Important reversal patterns:</strong><br>\
          • <strong>Doji:</strong> open ≈ close → indecision, possible reversal<br>\
          • <strong>Hammer:</strong> long lower shadow, small body at top → rejection of low prices → bullish signal<br>\
          • <strong>Shooting Star:</strong> long upper shadow → rejection of high prices → bearish signal<br>\
          • <strong>Bullish Engulfing:</strong> large green candle "engulfs" the previous red candle → strong bullish reversal<br>\
          • <strong>Morning Star:</strong> 3-candle pattern after a decline → reversal to the upside<br><br>\
          <strong>Golden rule:</strong> candlestick patterns have more weight when: (1) they appear after an established trend, (2) they occur at a relevant support/resistance level, (3) they are confirmed by above-average volume.\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📏</div>\
          <div class="product-name">Trends, Supports and Resistances</div>\
          <span class="product-tag rv">Structure</span>\
        </div>\
        <div class="product-desc">\
          <strong>Uptrend:</strong> ascending highs and lows. Buy on corrections (pullbacks to support or uptrend line).<br>\
          <strong>Downtrend:</strong> descending highs and lows. Sell on rallies.<br>\
          <strong>Sideways:</strong> price oscillates between defined support and resistance.<br><br>\
          <strong>Support:</strong> level where demand historically exceeds supply — price reacts upward. When broken, it becomes resistance (polarity shift).<br>\
          <strong>Resistance:</strong> level where supply exceeds demand — price reacts downward. When broken with volume, it becomes support.<br><br>\
          <strong>Fibonacci:</strong> retracements of 38.2%, 50% and 61.8% are the most common targets for pullbacks within a trend.\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🔢</div>\
          <div class="product-name">Technical Indicators</div>\
          <span class="product-tag rv">Confirmation</span>\
        </div>\
        <div class="product-desc">\
          <strong>Moving Averages (MA):</strong> MA20 (short) and MA200 (long). Golden Cross (MA20 crosses MA200 upward) = long-term bullish signal. Death Cross = bearish signal.<br><br>\
          <strong>RSI (Relative Strength Index):</strong> oscillator 0–100. &gt;70 = overbought; &lt;30 = oversold. But in a strong uptrend, RSI can stay &gt;70 for weeks — overbought does not mean time to sell.<br><br>\
          <strong>MACD:</strong> difference between 12 and 26 exponential MAs + signal line (9-period MA of MACD). MACD crossing above signal = buy; below = sell.<br><br>\
          <strong>Bollinger Bands:</strong> MA20 ± 2 standard deviations. Contraction of bands ("squeeze") = imminent volatility increase. Expansion = trend in progress.<br><br>\
          <strong>Volume:</strong> the most important of all — confirms any signal. Resistance breakout with high volume = confirmed. With low volume = likely false breakout.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Indicators are lagging (they lag price)</span>\
          <span class="product-stat">Use 2–3 confirming indicators</span>\
          <span class="product-stat">Volume is the only reliable leading indicator</span>\
        </div>\
      </div>\
    ';


SEC_EN['fiis'] = '\
      <div class="section-title"><span class="section-icon">🏢</span> Real Estate Investment Trusts (FIIs)</div>\
      <div class="section-body">\
        <p><strong>FIIs (Fundos de Investimento Imobiliário)</strong> allow anyone to "own" a fraction of high-quality real estate without having to buy an entire property. You buy shares on B3 and receive monthly income from rents or real estate receivables — with income tax exemption for individuals under legal conditions.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🏬</div>\
          <div class="info-card-title">Brick FIIs (Physical Assets)</div>\
          <div class="info-card-body">Invest in physical real estate. Income = rents. Types: <strong>Corporate Offices</strong> (BRCO11), <strong>Shopping Malls</strong> (XPML11, MALL11), <strong>Logistics Warehouses</strong> (BTLG11, HGLG11 — favored by e-commerce), <strong>Hospitals</strong>, <strong>Bank Branches</strong>.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📜</div>\
          <div class="info-card-title">Paper FIIs (CRI)</div>\
          <div class="info-card-body">Invest in CRIs. Income indexed to IPCA, CDI or IGP-M. Less sensitive to physical vacancy. In high-rate cycles, paper FIIs with CDI-indexed CRIs tend to outperform brick FIIs. Ex: KNCR11, MXRF11.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🧺</div>\
          <div class="info-card-title">FoFs (Fund of Funds)</div>\
          <div class="info-card-body">FII funds. Automatic diversification and professional allocation management. Downside: double layer of fees. Good for beginners. Ex: BCFF11, RBFF11.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📊</div>\
          <div class="info-card-title">FII Indicators</div>\
          <div class="info-card-body"><strong>DY (Dividend Yield):</strong> 12-month income ÷ current price. Compare with Tesouro IPCA+. <strong>P/NAV:</strong> P/NAV &lt; 1 = discount to net asset value. <strong>Physical vacancy:</strong> % of empty properties. High vacancy reduces income.</div>\
        </div>\
      </div>\
      <div class="alert tip">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>FII vs. Direct Real Estate:</strong> FIIs offer daily liquidity, diversification across multiple properties, professional management, monthly income and income tax exemption — all with an initial investment of R$ 100. A direct property requires high capital, has low liquidity, high transaction costs (transfer tax, notary, brokerage) and a 15% capital gains tax on sale. For most individual investors, FIIs are superior to direct real estate as a way to gain real estate exposure.</div>\
      </div>\
    ';


SEC_EN['etfs'] = '\
      <div class="section-title"><span class="section-icon">🧺</span> ETFs (Exchange Traded Funds)</div>\
      <div class="section-body">\
        <p><strong>ETFs</strong> are index funds traded on the stock exchange like stocks. By buying a share, you automatically hold a diversified portfolio that replicates a reference index. It is the simplest and most cost-efficient way to invest in a diversified manner.</p>\
        <p>Decades of academic research show that the majority of active managers do not consistently outperform their reference indices after fees. John Bogle (Vanguard): "if you can&#39;t beat the market, buy the market."</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">📊</div>\
          <div class="info-card-title">BOVA11 — Ibovespa</div>\
          <div class="info-card-body">Replicates the Ibovespa. ~90 largest Brazilian stocks in one trade. Fee: 0.10% p.a. Concentrated in commodities (Vale, Petrobras) and finance (Itaú, Bradesco, B3) — two sectors account for &gt;50% of the index.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🌍</div>\
          <div class="info-card-title">IVVB11 — S&amp;P 500</div>\
          <div class="info-card-body">Replicates the S&amp;P 500. Apple, Microsoft, Amazon, Alphabet, NVIDIA, Meta. International exposure with built-in currency protection. Fee: ~0.24% p.a. One of the most traded ETFs in Brazil.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🔒</div>\
          <div class="info-card-title">IMAB11 — IMA-B</div>\
          <div class="info-card-body">Tesouro IPCA+. Inflation protection with stock exchange liquidity. High duration — large price swings if real interest rates change. Good for inflation hedging within an equity portfolio.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🌱</div>\
          <div class="info-card-title">Other ETFs</div>\
          <div class="info-card-body"><strong>SMAL11:</strong> Brazilian small caps. <strong>NASD11:</strong> NASDAQ-100. <strong>GOLD11:</strong> gold. <strong>HASH11:</strong> crypto. <strong>DIVO11:</strong> US dividends. <strong>SPXI11:</strong> S&amp;P 500 with currency hedge (for those not wanting USD exposure).</div>\
        </div>\
      </div>\
      <div class="alert tip">\
        <span class="alert-icon">💡</span>\
        <div class="alert-body"><strong>Dollar Cost Averaging (DCA):</strong> Investing a fixed amount every month (e.g., R$ 500 in IVVB11) regardless of price is one of the most efficient strategies for the long term. When the price falls, you buy more shares; when it rises, you buy fewer — reducing the average price and eliminating the risk of bad timing.</div>\
      </div>\
    ';


SEC_EN['bdrs'] = '\
      <div class="section-title"><span class="section-icon">🌐</span> BDRs (Brazilian Depositary Receipts)</div>\
      <div class="section-body">\
        <p><strong>BDRs</strong> are certificates traded in Brazil that represent shares of foreign companies listed abroad. They allow investing in Apple, Amazon, Microsoft and others without needing an account at an international broker.</p>\
        <p>Each BDR represents a fraction (or multiple) of the original share. A depositary institution (Citibank, Deutsche Bank) holds the shares abroad and issues the BDRs in Brazil.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🏢</div>\
          <div class="info-card-title">Most traded BDRs</div>\
          <div class="info-card-body">AAPL34 (Apple), AMZN34 (Amazon), GOGL34 (Alphabet/Google), META34 (Meta), MSFT34 (Microsoft), NFLX34 (Netflix), NVDC34 (NVIDIA), TSLA34 (Tesla). All traded in Brazilian reais on B3.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💱</div>\
          <div class="info-card-title">Currency Exposure</div>\
          <div class="info-card-body">BDR price in R$ = price in USD × exchange rate. If the dollar rises 5% and the stock doesn&#39;t change, the BDR rises ~5% in reais. <strong>BDRs are dollar-denominated assets</strong> — they protect the portfolio when the real depreciates.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📋</div>\
          <div class="info-card-title">Taxation</div>\
          <div class="info-card-body"><strong>15% income tax</strong> on capital gains. <strong>No exemption</strong> for R$20,000/month (that exemption is exclusive to Brazilian stocks). Dividends received: 15% withheld at source. Declare in monthly tax return if there is income.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">⚖️</div>\
          <div class="info-card-title">BDR vs. International ETF</div>\
          <div class="info-card-body">For concentrating in a few companies: individual BDRs. For broad diversification at low cost: IVVB11 is more efficient (smaller spread, higher liquidity, low management fee).</div>\
        </div>\
      </div>\
    ';


SEC_EN['dividendos'] = '\
      <div class="section-title"><span class="section-icon">💰</span> Dividends and JCP</div>\
      <div class="section-body">\
        <p>Companies that generate profit can distribute part of that profit to shareholders. In Brazil, there are two main forms — with distinct tax treatments.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">💚</div>\
          <div class="info-card-title">Dividends</div>\
          <div class="info-card-body"><strong>Income tax exempt for individuals.</strong> By law, companies must distribute at least 25% of adjusted profit. Received directly in the brokerage account, without taxation. The share price falls by the dividend amount on the ex-date.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">💼</div>\
          <div class="info-card-title">JCP (Interest on Net Equity)</div>\
          <div class="info-card-body"><strong>15% income tax withheld at source.</strong> More advantageous for the company (reduces corporate income tax). The shareholder receives the net amount. On platforms, it appears as "gross income" and "net income."</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">📅</div>\
          <div class="info-card-title">Record Date and Ex-Date</div>\
          <div class="info-card-body"><strong>Record date:</strong> you must hold the stock to receive the dividend. <strong>Ex-date:</strong> those who buy from this date onward do not receive the next dividend. On the ex-date, the price falls approximately by the dividend amount (automatic discount).</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">⚠️</div>\
          <div class="info-card-title">Dividend Trap</div>\
          <div class="info-card-body">High DY can be a trap: if the price fell a lot (company with problems), the historical DY appears high but the future dividend will be cut. Analyze the <strong>payout ratio</strong> and whether the earnings that originate the dividend are recurring.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Companies with a solid dividend track record in Brazil</div>\
        <div class="concept-body">\
          Sectors with the greatest tradition: <strong>Electric Utilities</strong> (Taesa, CPFL, Engie, Eletrobras), <strong>Banks</strong> (Itaú, Bradesco, Banco do Brasil), <strong>Telecommunications</strong> (Vivo/Telefônica, TIM), <strong>Sanitation</strong> (Sabesp, Copasa), <strong>Mature Commodities</strong> (Vale, Petrobras in favorable cycles).<br><br>\
          <strong>Brazilian dividend aristocrats:</strong> companies that have maintained or grown dividends for 5+ consecutive years. They are rarer in Brazil than in the US, but they exist — look at the IDIV index from B3 as a starting point.\
        </div>\
      </div>\
    ';

// ── MODULE 4: DERIVATIVES ──
SEC_EN['intro-derivativos'] = '\
      <div class="section-title"><span class="section-icon">⚙️</span> Introduction to Derivatives</div>\
      <div class="section-body">\
        <p>A <strong>derivative</strong> is a financial contract whose value <em>derives</em> from the price of another asset — called the <strong>underlying asset</strong>. The underlying can be a stock, index, currency, interest rate, commodity (soybeans, corn, coffee, oil), or any other financial asset.</p>\
        <p>The derivatives market is one of the largest in the world — the global OTC (over-the-counter) derivatives market exceeds US$ 700 trillion in notional value. In Brazil, B3 is one of the world&#39;s largest derivatives exchanges.</p>\
      </div>\
      <div class="cards-grid" style="margin-top:16px">\
        <div class="info-card">\
          <div class="info-card-icon">🛡️</div>\
          <div class="info-card-title">Hedge (Protection)</div>\
          <div class="info-card-body">Reduces or eliminates an existing risk. An exporter expecting to receive US$ 10 million in 3 months sells dollar futures to lock in the exchange rate. A stock fund buys Ibovespa puts to protect against a sharp decline.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🎲</div>\
          <div class="info-card-title">Speculation</div>\
          <div class="info-card-body">Takes on risk in expectation of profit. The speculator does not hold the underlying asset — they want to profit from price variation using leverage. High potential for gain and loss. Provides liquidity to the market as a counterpart.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">⚖️</div>\
          <div class="info-card-title">Arbitrage</div>\
          <div class="info-card-body">Exploiting price differences of the same asset in different markets for risk-free profit. Example: stock trading at different prices on the exchange and in the options market. In practice, arbitrages are rare and exploited by algorithms in milliseconds.</div>\
        </div>\
        <div class="info-card">\
          <div class="info-card-icon">🏛️</div>\
          <div class="info-card-title">Exchange-traded vs. OTC</div>\
          <div class="info-card-body"><strong>Exchange-traded:</strong> standardized contracts, clearing house guarantees operations (counterparty risk eliminated). <strong>OTC (over-the-counter):</strong> customized contracts between two parties, without clearing house guarantee — counterparty risk exists.</div>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Leverage: the power (and danger) of derivatives</div>\
        <div class="concept-body">\
          The most important characteristic of derivatives is <strong>leverage</strong>: with a small margin deposit (10–20% of the contract value), you control a much larger contract.<br><br>\
          Example: margin of R$ 1,000 to control a mini index contract worth R$ 25,000 = <strong>25x leverage</strong>. If the index rises 1%, you profit 25% of the margin capital. If it falls 1%, you lose 25%.<br><br>\
          <strong>Why this is dangerous:</strong> leverage amplifies both gains and losses. In adverse markets, you can lose more than you deposited as margin — and receive margin calls requiring an immediate additional deposit. Derivatives without deep understanding are the fastest path to financial ruin.\
        </div>\
      </div>\
    ';


SEC_EN['futuros'] = '\
      <div class="section-title"><span class="section-icon">📅</span> Futures Contracts</div>\
      <div class="section-body">\
        <p>A <strong>futures contract</strong> is a standardized agreement to buy or sell an asset at a pre-determined price on a specific future date. Both parties have the <strong>obligation</strong> to honor the contract — unlike options, where there is a right but not an obligation.</p>\
        <p>Futures are traded on B3, which acts as the central counterparty: it guarantees that both sides will honor the contract, eliminating credit risk between the parties.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📊</div>\
          <div class="product-name">Mini Index (WIN) and Mini Dollar (WDO)</div>\
          <span class="product-tag der">Exchange-traded</span>\
        </div>\
        <div class="product-desc">\
          The most traded contracts by individuals in Brazil:<br><br>\
          <strong>Mini Index Future (WINM25, WINQ25...):</strong> each point of the contract is worth R$ 0.20. With Ibovespa at 130,000 points, each contract is worth R$ 26,000. Typical margin: ~R$ 1,500. Allows speculating (or hedging) on the Ibovespa without buying all the stocks.<br><br>\
          <strong>Mini Dollar Future (WDOM25, WDOQ25...):</strong> each contract represents US$ 10,000. With dollar at R$ 5.20, each contract is worth R$ 52,000. Typical margin: ~R$ 2,500. Widely used by exporters, importers and speculators.<br><br>\
          Expiry is monthly (last Wednesday of the month). "WIN<strong>M</strong>25" = expires in <strong>June</strong> 2025 (M = June in B3&#39;s code).\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Very high liquidity (most liquid market in Brazil)</span>\
          <span class="product-stat">Daily adjustment D+1</span>\
          <span class="product-stat">No IOF or income tax up to 20% on profit</span>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Daily Adjustment (Mark-to-Market in Futures)</div>\
        <div class="concept-body">\
          In futures contracts, gains and losses are <strong>settled financially every day</strong> — not just at expiry. This is the <strong>daily adjustment</strong>:<br><br>\
          Example: you bought mini index at 130,000 points. At end of day, the index closed at 130,500 (+500 points). Your gain = 500 × R$ 0.20 = <strong>R$ 100</strong> credited to your account the next day.<br><br>\
          If the next day the index falls to 129,800 (−700 points from previous close): loss = 700 × R$ 0.20 = <strong>R$ 140</strong> debited from your account.<br><br>\
          If your account falls below the <strong>minimum margin</strong>, you receive a <strong>margin call</strong> — you must deposit more money or the position is compulsorily closed.\
        </div>\
      </div>\
      <div class="example-box">\
        <div class="example-header">📘 Example: Dollar Futures Hedge</div>\
        <div class="example-body">\
          <p>An exporting company will receive <strong>US$ 500,000</strong> in 60 days. Today the dollar is at R$ 5.00 (expected revenue = R$ 2,500,000). Risk: if the dollar falls to R$ 4.70, revenue falls to R$ 2,350,000 — a R$ 150,000 loss.</p>\
          <p><strong>Hedge:</strong> the company sells 50 mini dollar futures contracts (50 × US$ 10,000 = US$ 500,000) at R$ 5.00.</p>\
          <div class="example-result">\
            <strong>Scenario 1 — Dollar falls to R$ 4.70:</strong><br>\
            Loss in spot FX: −R$ 150,000 | Gain in futures: +R$ 150,000 → <strong>net result: zero</strong> (perfect hedge)<br><br>\
            <strong>Scenario 2 — Dollar rises to R$ 5.30:</strong><br>\
            Gain in spot FX: +R$ 150,000 | Loss in futures: −R$ 150,000 → <strong>net result: zero</strong><br><br>\
            The hedge eliminated currency risk — good and bad at the same time. The company traded uncertainty for predictability.\
          </div>\
        </div>\
      </div>\
      <div class="faq-list" style="margin-top:16px">\
        <div class="faq-item" id="faq-futures1">\
          <div class="faq-q" onclick="toggleFaq(&#39;faq-futures1&#39;)">What is contango and backwardation? <span class="faq-arrow">▼</span></div>\
          <div class="faq-a"><strong>Contango:</strong> futures price &gt; spot price. Normal situation — the future includes the cost of carry (interest, storage). <strong>Backwardation:</strong> futures price &lt; spot price. Occurs when there is immediate physical scarcity (agricultural commodities pre-harvest) or when the market anticipates price declines. Important for those who roll contracts regularly — in contango, rolling costs money; in backwardation, it generates a gain.</div>\
        </div>\
        <div class="faq-item" id="faq-futures2">\
          <div class="faq-q" onclick="toggleFaq(&#39;faq-futures2&#39;)">What is rollover and why does it matter? <span class="faq-arrow">▼</span></div>\
          <div class="faq-a"><strong>Rollover</strong> is the renewal of the position when the futures contract is close to expiry: you close the current contract and open a new one for the following month. In contango (next contract price higher than current), each rollover has a cost. Commodity ETFs (such as oil) suffer from this problem — their performance can diverge significantly from the commodity&#39;s spot price over time.</div>\
        </div>\
      </div>\
    ';


SEC_EN['opcoes'] = '\
      <div class="section-title"><span class="section-icon">🎟️</span> Options: Calls and Puts</div>\
      <div class="section-body">\
        <p>An <strong>option</strong> is a contract that gives the buyer the <em>right</em> (but not the obligation) to buy or sell an underlying asset at a pre-determined price (<strong>strike</strong>) up to or on the expiry date. In exchange for this right, the buyer pays a <strong>premium</strong> to the seller.</p>\
        <p>The option seller (writer) has the <strong>obligation</strong> to fulfill the contract if the buyer exercises their right. Therefore, the risk is asymmetric: the buyer has limited risk (loses at most the premium paid), the seller has potentially unlimited risk (in a naked call).</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📈</div>\
          <div class="product-name">Call (Purchase Option)</div>\
          <span class="product-tag der">Right to Buy</span>\
        </div>\
        <div class="product-desc">\
          The call buyer acquires the <strong>right to buy</strong> the underlying asset at the strike price up to expiry.<br><br>\
          <strong>When to buy a call?</strong> When you believe the asset will rise. If the stock is at R$ 50 and you buy a call with strike R$ 55 for R$ 2.00 premium:<br>\
          • Stock rises to R$ 62: you exercise the option, buy at R$ 55, sell at R$ 62 → profit = R$ 7 − R$ 2 (premium) = <strong>R$ 5 per share (250%)</strong><br>\
          • Stock stays below R$ 55: you don&#39;t exercise → lose only <strong>R$ 2.00 (100% of premium)</strong><br><br>\
          This is options leverage: with R$ 2 of capital at risk, you participated in a R$ 7 gain — 3.5x leverage on the asset and 250% on the capital at risk.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Buyer: unlimited profit, loss = premium</span>\
          <span class="product-stat">Seller: profit = premium, potentially unlimited loss</span>\
          <span class="product-stat">Bullish</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📉</div>\
          <div class="product-name">Put (Sell Option)</div>\
          <span class="product-tag der">Right to Sell</span>\
        </div>\
        <div class="product-desc">\
          The put buyer acquires the <strong>right to sell</strong> the underlying asset at the strike price up to expiry.<br><br>\
          <strong>When to buy a put?</strong> When you believe the asset will fall, OR to protect a long position (portfolio insurance).<br><br>\
          If the stock is at R$ 50 and you buy a put with strike R$ 45 for R$ 1.50 premium:<br>\
          • Stock falls to R$ 35: you exercise, sell at R$ 45 what is worth R$ 35 → profit = R$ 10 − R$ 1.50 = <strong>R$ 8.50 per share</strong><br>\
          • Stock rises or stays above R$ 45: you don&#39;t exercise → lose <strong>R$ 1.50 (100% of premium)</strong><br><br>\
          <strong>Protective put:</strong> investor buys stocks of a company AND buys puts of that same stock. If the stock falls a lot, the puts gain value and offset the loss. It is literally portfolio insurance.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Buyer: nearly unlimited profit, loss = premium</span>\
          <span class="product-stat">Seller: profit = premium, large loss if asset plummets</span>\
          <span class="product-stat">Bearish or protection</span>\
        </div>\
      </div>\
      <div class="formula-box">\
        <div class="formula-label">Option Premium Composition</div>\
        <div class="formula-eq">Premium = Intrinsic Value + Time Value\
\
Intrinsic Value (calls) = max(S − K, 0)\
  S = current asset price | K = option strike\
\
ITM (In The Money):   call with S &gt; K  (has intrinsic value)\
ATM (At The Money):   call with S ≈ K  (intrinsic value ≈ zero)\
OTM (Out The Money):  call with S &lt; K  (intrinsic value = zero)\
\
Time Value = premium − intrinsic value\
  Depends on: time to expiry + implied volatility + interest rate\
  Decays over time (Theta) — toward expiry, time value\
  goes to zero (theta decay).</div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">The Greeks: premium sensitivities</div>\
        <div class="concept-body">\
          The "Greeks" measure how the option premium reacts to changes in different variables:<br><br>\
          <strong>Delta (Δ):</strong> change in premium for each R$ 1 change in the asset. Delta of 0.50 = if the stock rises R$ 1, the call premium rises R$ 0.50. ITM calls have delta near 1; OTM calls have delta near 0.<br><br>\
          <strong>Gamma (Γ):</strong> rate of change of delta when the asset moves. High gamma = delta changes rapidly. ATM options near expiry have very high gamma — small asset changes cause large delta changes.<br><br>\
          <strong>Theta (Θ):</strong> time decay of the premium. Theta of −0.05 means the premium loses R$ 0.05 per day, all else equal. The option buyer pays theta; the seller collects theta.<br><br>\
          <strong>Vega (V):</strong> sensitivity of premium to implied volatility. Vega of 0.10 = if implied volatility rises 1%, the premium rises R$ 0.10. Buying options before high-volatility events (earnings, elections) can be profitable if volatility rises.\
        </div>\
      </div>\
    ';


SEC_EN['estrategias-opcoes'] = '\
      <div class="section-title"><span class="section-icon">🧩</span> Options Strategies</div>\
      <div class="section-body">\
        <p>Options can be combined with each other and with the underlying asset to create specific risk/return profiles. Well-structured strategies allow profiting in different market scenarios — up, down, sideways movement or just volatility increase.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📞</div>\
          <div class="product-name">Covered Call</div>\
          <span class="product-tag der">Income Generation</span>\
        </div>\
        <div class="product-desc">\
          An investor who already owns stocks <strong>sells calls</strong> on those same stocks to generate additional income. By selling the call, you receive the premium now.<br><br>\
          <strong>Example:</strong> you hold 100 shares at R$ 50. You sell 1 call with strike R$ 55 for R$ 2.00 premium (receive R$ 200).<br>\
          • Stock stays below R$ 55 at expiry: the call expires worthless, you keep the R$ 200 + the stocks.<br>\
          • Stock rises to R$ 60: buyer exercises, you sell at R$ 55 (your ceiling). Profit = R$ 5 (appreciation) + R$ 2 (premium) = R$ 7, but you missed the move from R$ 55 to R$ 60 (opportunity cost).<br><br>\
          <strong>When to use:</strong> when you believe the stock will trade sideways or with moderate gains during the option term. Increases income in sideways markets.\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🛡️</div>\
          <div class="product-name">Protective Put (Portfolio Insurance)</div>\
          <span class="product-tag der">Protection</span>\
        </div>\
        <div class="product-desc">\
          Buy puts on stocks you already own. Works like insurance: if the stock falls below the put&#39;s strike, your losses are limited — the put gains value and offsets the decline.<br><br>\
          <strong>Example:</strong> you hold shares at R$ 50 and buy a put with strike R$ 45 for R$ 1.50. If the stock falls to R$ 30, the put is worth R$ 15 (45−30), offsetting most of the loss. Your effective floor is R$ 45 − R$ 1.50 (premium) = <strong>R$ 43.50 per share</strong>.<br><br>\
          <strong>Cost:</strong> the put premium is the "insurance premium" — a certain "erosion" you pay for having the protection.\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">↔️</div>\
          <div class="product-name">Straddle — Betting on Volatility</div>\
          <span class="product-tag der">High Volatility</span>\
        </div>\
        <div class="product-desc">\
          Simultaneous purchase of an ATM call and an ATM put with the same strike and expiry. You profit if the asset moves a lot in any direction — it doesn&#39;t matter if it goes up or down.<br><br>\
          <strong>When to use:</strong> before events with potential for big moves (quarterly earnings, Copom decision, election, court ruling outcome), when you don&#39;t know the direction but believe there will be a strong move.<br><br>\
          <strong>Risk:</strong> you lose if the asset stays near the strike until expiry — both options lose time value (theta decay is the straddle buyer&#39;s enemy).\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">📊</div>\
          <div class="product-name">Bull Call Spread</div>\
          <span class="product-tag der">Reduced Cost</span>\
        </div>\
        <div class="product-desc">\
          Buy a call at strike K1 and sell another call at strike K2 (K2 &gt; K1), both with the same expiry. The premium received from the sale partially finances the purchase — reducing the strategy cost.<br><br>\
          <strong>Example:</strong> stock at R$ 50. Buy call K1=50 for R$ 3. Sell call K2=55 for R$ 1.50. Net cost: R$ 1.50.<br>\
          • Maximum profit if stock ≥ R$ 55: (55−50) − 1.50 = <strong>R$ 3.50</strong><br>\
          • Maximum loss if stock &lt; R$ 50: <strong>R$ 1.50</strong> (premium paid)<br><br>\
          <strong>Advantage:</strong> lower cost than buying the call alone. <strong>Disadvantage:</strong> profit is limited to the spread — you don&#39;t participate in gains beyond K2.\
        </div>\
      </div>\
      <div class="alert warn">\
        <span class="alert-icon">⚠️</span>\
        <div class="alert-body"><strong>Naked short options:</strong> Selling calls without holding the stocks (or puts without having the cash to buy the stocks) creates theoretically unlimited risk. A brutal adverse move can generate losses that far exceed the available capital. Never sell naked options without deeply understanding the risk and having capital to support margin calls.</div>\
      </div>\
    ';


SEC_EN['swaps'] = '\
      <div class="section-title"><span class="section-icon">🔄</span> Swaps and Hedging</div>\
      <div class="section-body">\
        <p>A <strong>swap</strong> is a derivative contract in which two parties agree to <strong>exchange financial flows</strong> based on different indices. It is one of the most widely used hedging instruments by companies, banks and the Brazilian Central Bank itself.</p>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">💱</div>\
          <div class="product-name">Interest Rate Swap (Fixed Rate × CDI)</div>\
          <span class="product-tag der">Rate Management</span>\
        </div>\
        <div class="product-desc">\
          A company that took a floating-rate loan (CDI + spread) may want to protect itself against rate hikes. It does a swap: pays a fixed rate and receives CDI. This makes its effective financing cost predictable.<br><br>\
          <strong>Example:</strong> company owes R$ 10M at CDI + 2% per year. Does a swap: pays 12% fixed and receives CDI. Total cost = (CDI + 2%) − CDI + 12% = 14% per year — regardless of CDI. The uncertainty was eliminated.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Widely used by corporate treasuries</span>\
          <span class="product-stat">Converts debt index</span>\
          <span class="product-stat">Traded in the OTC market</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🌐</div>\
          <div class="product-name">Brazilian Central Bank Currency Swap</div>\
          <span class="product-tag der">Exchange Rate Policy</span>\
        </div>\
        <div class="product-desc">\
          The Brazilian Central Bank uses the <strong>currency swap</strong> to intervene in the exchange rate without spending international reserves. In the traditional currency swap:<br><br>\
          • <strong>Central Bank pays:</strong> dollar variation + currency coupon<br>\
          • <strong>Central Bank receives:</strong> CDI<br><br>\
          When the Central Bank does a currency swap, it effectively "sells dollars in the futures market" — increasing the supply of dollars in futures contracts, containing the exchange rate rise. The market sees this as a signal that the Central Bank is putting a "ceiling" on the dollar, reducing speculative pressure.<br><br>\
          <strong>Reverse currency swap:</strong> the Central Bank does the opposite — buys dollars in the futures market — when it wants to contain the fall of the dollar (prevent overly appreciated real that harms exports).\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">Does not use international reserves</span>\
          <span class="product-stat">Powerful market signal</span>\
          <span class="product-stat">Central Bank can lose money if dollar rises sharply</span>\
        </div>\
      </div>\
      <div class="product-card">\
        <div class="product-card-header">\
          <div class="product-icon">🛡️</div>\
          <div class="product-name">CDS — Credit Default Swap</div>\
          <span class="product-tag der">Credit Insurance</span>\
        </div>\
        <div class="product-desc">\
          A <strong>CDS (Credit Default Swap)</strong> is a credit derivative that works like insurance against an issuer&#39;s default. The CDS buyer pays a periodic fee (the "CDS spread"); the seller commits to compensating the buyer if the issuer defaults.<br><br>\
          <strong>Brazil&#39;s CDS (Sovereign):</strong> the 5-year CDS of the Brazilian government measures the cost of protecting against a federal government default. The higher the CDS, the greater the risk perceived by the international market.<br><br>\
          <strong>How investors use it:</strong> the Brazil CDS is monitored as a country-risk thermometer — when it rises (market more pessimistic about Brazil), the tendency is for the currency to depreciate and long-term rates to rise.\
        </div>\
        <div class="product-stats">\
          <span class="product-stat">High Brazil CDS = elevated perceived fiscal risk</span>\
          <span class="product-stat">Quoted in annual basis points</span>\
          <span class="product-stat">Monitor alongside FX and long-term DI rates</span>\
        </div>\
      </div>\
      <div class="concept-box">\
        <div class="concept-label">Summary: When to use each derivative?</div>\
        <div class="concept-body">\
          <strong>Futures contracts:</strong> FX/index hedge for large volumes, speculation with leverage in liquid markets (mini index, mini dollar).<br><br>\
          <strong>Options — call buying:</strong> bullish speculation with risk limited to premium. Participate in potential upside spending little.<br>\
          <strong>Options — put buying:</strong> portfolio protection (protective put) or bearish speculation with limited risk.<br>\
          <strong>Options — covered call:</strong> generate additional income on stocks you already own.<br>\
          <strong>Long straddle:</strong> when you expect a large move but don&#39;t know the direction.<br><br>\
          <strong>Swaps:</strong> companies wanting to convert the index of their debt or revenue. Central Bank for exchange rate policy.<br>\
          <strong>CDS:</strong> protection against a specific issuer&#39;s default, or speculation on deterioration/improvement of credit quality.\
        </div>\
      </div>\
    ';

SEC_EN['markowitz'] = '      <div class="section-title"><span class="section-icon">📐</span> Modern Portfolio Theory (Markowitz)</div>\
      <div class="section-body">\
        <p>Harry Markowitz published in 1952 the article <em>Portfolio Selection</em>, which transformed investment management into a mathematical discipline. The central idea is simple but powerful: <strong>the risk of a portfolio is not the average of the assets&#39; risks — it is determined by the correlations among them</strong>.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Two types of risk</div>\
          <ul class="hl-list">\
            <li><strong>Systematic risk (market risk):</strong> affects all assets (recession, interest rates, war). Cannot be eliminated by diversification. Measured by Beta.</li>\
            <li><strong>Unsystematic risk (specific risk):</strong> exclusive to a company or sector. Can be eliminated through diversification. E.g.: product recall, accounting fraud, CEO fired.</li>\
          </ul>\
          <p style="margin-top:12px">With 15–20 well-chosen assets, you eliminate virtually all specific risk. What remains is market risk.</p>\
        </div>\
\
        <h4>The Efficient Frontier</h4>\
        <p>Imagine you can combine two assets (A and B) in different proportions. Each combination produces a point on the risk × return chart. The set of all combinations forms a curve — the <strong>efficient frontier</strong>.</p>\
        <p>Portfolios <em>below</em> the frontier are inefficient: there exist portfolios with higher return for the same risk, or lower risk for the same return. No rational investor should choose them.</p>\
\
        <div class="formula-box">\
          <div class="formula-title">Expected return of a 2-asset portfolio</div>\
          <div class="formula">E(Rp) = w₁·E(R₁) + w₂·E(R₂)</div>\
          <div class="formula-note">w₁, w₂ = asset weights (w₁+w₂ = 1) — weighted average of expected returns.</div>\
        </div>\
\
        <div class="formula-box">\
          <div class="formula-title">Variance of a 2-asset portfolio</div>\
          <div class="formula">σ²p = w₁²·σ₁² + w₂²·σ₂² + 2·w₁·w₂·σ₁·σ₂·ρ₁₂</div>\
          <div class="formula-note">ρ₁₂ = correlation between assets (-1 to +1). The lower ρ, the lower σ²p.</div>\
        </div>\
\
        <h4>The effect of correlation</h4>\
        <div class="cards-grid">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">ρ = +1 (perfect correlation)</div>\
            <p>Assets move exactly together. <strong>No diversification</strong>. Portfolio risk is the weighted average of individual risks.</p>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">ρ = 0 (no correlation)</div>\
            <p>Independent movements. <strong>Partial diversification</strong>. Portfolio risk falls significantly.</p>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">ρ = -1 (perfect inverse correlation)</div>\
            <p>Assets move in opposite directions. <strong>Maximum diversification</strong>. Risk can theoretically be zeroed out.</p>\
          </div>\
        </div>\
\
        <h4>Capital Market Line (CML) and the Market Portfolio</h4>\
        <p>When you add a risk-free asset (e.g., Selic Treasury) to the universe of portfolios, the efficient frontier becomes a straight line — the <strong>Capital Market Line (CML)</strong>. It starts from the risk-free asset and touches the efficient frontier at a specific point: the <strong>market portfolio</strong>.</p>\
        <p>The market portfolio theoretically contains all market assets in proportion to their capitalizations. In practice, a broad index like IBOVESPA or S&amp;P 500 serves as an approximation.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 CAPM — Capital Asset Pricing Model</div>\
          <p>The CAPM (Sharpe, 1964) describes the expected return of an asset as a function of its systematic risk:</p>\
          <div class="formula" style="margin:10px 0">E(Ri) = Rf + βi · [E(Rm) - Rf]</div>\
          <ul class="hl-list">\
            <li><strong>Rf:</strong> risk-free rate (e.g., Selic)</li>\
            <li><strong>βi:</strong> asset sensitivity to the market</li>\
            <li><strong>[E(Rm) - Rf]:</strong> market risk premium (historical ~5–7% p.a. in the USA)</li>\
            <li><strong>β = 1:</strong> asset moves the same as the market. β = 1.5 → rises/falls 50% more than the market.</li>\
          </ul>\
          <p style="margin-top:8px">CAPM has limitations (assumes efficient market, no transaction costs, no taxes), but is widely used to calculate the cost of capital in valuation.</p>\
        </div>\
      </div>\
    ';

SEC_EN['correlacao'] = '      <div class="section-title"><span class="section-icon">🔗</span> Correlation and Diversification in Practice</div>\
      <div class="section-body">\
        <p>Understanding correlation theoretically is easy. Applying it in practice requires attention to pitfalls that emerge in times of crisis — exactly when diversification should work.</p>\
\
        <div class="formula-box">\
          <div class="formula-title">Pearson correlation coefficient</div>\
          <div class="formula">ρ(A,B) = Cov(A,B) / (σA · σB)</div>\
          <div class="formula-note">Ranges from -1 (perfect inversion) to +1 (perfect synchrony). Zero indicates absence of linear relationship.</div>\
        </div>\
\
        <h4>Typical correlations in the Brazilian market</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag">High</span> Stocks in the same sector</div>\
            <div class="product-desc">E.g.: Petrobras and Vale with exporters. ρ ≈ 0.70–0.90. Adding more stocks from the same sector does not diversify.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Medium</span> Stocks × REITs (FIIs)</div>\
            <div class="product-desc">Moderate correlation ρ ≈ 0.40–0.60. FIIs have an income component that reduces joint volatility.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Low</span> Stocks × Fixed Income</div>\
            <div class="product-desc">Low or negative correlation ρ ≈ -0.10 to +0.20. In crises, fixed income rises (flight to quality).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Negative</span> Stocks × Dollar</div>\
            <div class="product-desc">Historically ρ ≈ -0.40 to -0.60 in Brazil. In crises, dollar rises and the stock market falls — excellent hedge.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">⚠️ The Correlation Fallacy in Crises (Tail Correlation)</div>\
          <p>During normal markets, two stocks may have a correlation of 0.3. But in severe crises (2008, Mar/2020), the correlation of risk assets converges to 1 — everything falls together. This is called <strong>tail correlation</strong> and is the biggest problem with Markowitz theory in practice.</p>\
          <p style="margin-top:8px">Solution: include assets with structurally negative correlation (gold, dollar, government bonds of safe countries) — not just historically low correlation.</p>\
        </div>\
\
        <h4>Practical example: number of assets × risk</h4>\
        <div class="cards-grid-2">\
          <div>\
            <p>Suppose assets with individual standard deviation of 30% and average pairwise correlation of 0.3:</p>\
            <table style="width:100%;border-collapse:collapse;margin-top:8px">\
              <tr style="background:var(--bg-2)">\
                <th style="padding:8px;text-align:left;border:1px solid var(--border)">No. of assets</th>\
                <th style="padding:8px;text-align:center;border:1px solid var(--border)">Portfolio σ</th>\
                <th style="padding:8px;text-align:center;border:1px solid var(--border)">Reduction vs. 1 asset</th>\
              </tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)">1</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">30.0%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">—</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)">2</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">24.7%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-18%</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)">5</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">21.2%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-29%</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)">10</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">19.7%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-34%</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)">20</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">19.0%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-37%</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)">∞</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">18.4%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-39%</td></tr>\
            </table>\
          </div>\
          <div class="concept-box" style="margin:0;align-self:start">\
            <div class="concept-title">📌 Interpretation</div>\
            <p>The first assets added have the greatest impact. From 1 to 5 assets, you eliminate 29% of risk. From 20 to ∞, you gain only 2% more. <strong>Excessive diversification (over-diversification) dilutes alpha without eliminating more risk.</strong></p>\
            <p style="margin-top:8px">For an individual investor, 10–20 well-selected assets across different classes already capture almost all the benefit of diversification.</p>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['metricas'] = '      <div class="section-title"><span class="section-icon">📊</span> Sharpe Ratio and Performance Metrics</div>\
      <div class="section-body">\
        <p>Return in isolation says nothing. A fund that returned 30% by taking enormous risk may be worse than one that returned 15% with very low volatility. Risk-adjusted performance metrics allow fair comparisons.</p>\
\
        <div class="formula-box">\
          <div class="formula-title">Sharpe Ratio</div>\
          <div class="formula">Sharpe = (Rp - Rf) / σp</div>\
          <div class="formula-note">Rp = portfolio return | Rf = risk-free rate | σp = standard deviation of returns. The higher, the better. Sharpe &gt; 1 is considered good; &gt; 2 is excellent.</div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">Limitations of the Sharpe Ratio</div>\
          <ul class="hl-list">\
            <li>Uses standard deviation (volatility upward and downward). An asset that only rises irregularly may have a low Sharpe but be excellent.</li>\
            <li>Assumes normal distribution of returns. In reality, there are fat tails — extreme events more frequent than the model assumes.</li>\
            <li>Comparable only between similar strategies.</li>\
          </ul>\
        </div>\
\
        <div class="formula-grid">\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">Sortino Ratio</div>\
            <div class="formula">Sortino = (Rp - Rf) / σ_downside</div>\
            <div class="formula-note">σ_downside considers only negative returns (below a target). More fair: does not penalize upside volatility.</div>\
          </div>\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">Calmar Ratio</div>\
            <div class="formula">Calmar = Annualized Return / |Max Drawdown|</div>\
            <div class="formula-note">Maximum drawdown = largest peak-to-trough decline. The higher the Calmar, the better the return/drawdown relationship.</div>\
          </div>\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">Jensen&#39;s Alpha</div>\
            <div class="formula">α = Rp - [Rf + β·(Rm - Rf)]</div>\
            <div class="formula-note">Positive alpha = manager generated return above what CAPM expected. Measures manager skill vs. the market.</div>\
          </div>\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">Information Ratio</div>\
            <div class="formula">IR = (Rp - Rbenchmark) / Tracking Error</div>\
            <div class="formula-note">Tracking Error = σ(Rp - Rb). Measures consistency of alpha generated vs. benchmark. Good managers have IR &gt; 0.5.</div>\
          </div>\
        </div>\
\
        <h4>Maximum Drawdown (MDD)</h4>\
        <p>Maximum drawdown measures the largest possible loss an investor would have suffered if they bought at the peak and sold at the trough over a given period. It is the most intuitive risk metric — you literally lost X% of your money.</p>\
        <div class="concept-box">\
          <div class="concept-title">📌 Why MDD matters more than volatility?</div>\
          <p>A fund with σ = 15% can have MDD of -20% or -50% depending on the concentration of losses. MDD captures the worst experienced scenario and directly affects the psychological behavior of the investor. Many abandon good strategies at exactly the worst moment.</p>\
        </div>\
\
        <h4>Comparing funds: practical example</h4>\
        <table style="width:100%;border-collapse:collapse;margin-top:8px">\
          <tr style="background:var(--bg-2)">\
            <th style="padding:8px;text-align:left;border:1px solid var(--border)">Fund</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">Return/year</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">σ</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">MDD</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">Sharpe</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">Calmar</th>\
          </tr>\
          <tr><td style="padding:8px;border:1px solid var(--border)">A (aggressive)</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">22%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">28%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-45%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">0.54</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">0.49</td></tr>\
          <tr><td style="padding:8px;border:1px solid var(--border)">B (balanced)</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">16%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">14%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-22%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">0.79</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">0.73</td></tr>\
          <tr><td style="padding:8px;border:1px solid var(--border)">C (conservative)</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">11%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">6%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">-8%</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">0.67</td><td style="padding:8px;text-align:center;border:1px solid var(--border)">1.38</td></tr>\
        </table>\
        <p style="margin-top:8px;font-size:0.9em;color:var(--t2)">Fund A has the highest absolute return but lowest risk-adjusted quality. Fund B is best in Sharpe. Fund C is excellent in Calmar — ideal for those who cannot tolerate drawdowns.</p>\
      </div>\
    ';

SEC_EN['gestao-risco'] = '      <div class="section-title"><span class="section-icon">🛡️</span> Risk Management and Position Sizing</div>\
      <div class="section-body">\
        <p>Knowing when to buy is important. Knowing <em>how much</em> to buy is what separates professional traders from amateurs. <strong>Position sizing</strong> is the set of rules that defines how much capital to allocate to each trade.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">⚠️ The Asymmetric Arithmetic of Losses</div>\
          <p>Losses and gains are <strong>not symmetric</strong>. A 50% loss requires a 100% gain to recover the original capital:</p>\
          <table style="width:100%;border-collapse:collapse;margin-top:8px">\
            <tr style="background:var(--bg-2)">\
              <th style="padding:6px;border:1px solid var(--border)">Loss suffered</th>\
              <th style="padding:6px;border:1px solid var(--border)">Gain needed to recover</th>\
            </tr>\
            <tr><td style="padding:6px;border:1px solid var(--border)">-10%</td><td style="padding:6px;border:1px solid var(--border)">+11%</td></tr>\
            <tr><td style="padding:6px;border:1px solid var(--border)">-20%</td><td style="padding:6px;border:1px solid var(--border)">+25%</td></tr>\
            <tr><td style="padding:6px;border:1px solid var(--border)">-33%</td><td style="padding:6px;border:1px solid var(--border)">+50%</td></tr>\
            <tr><td style="padding:6px;border:1px solid var(--border)">-50%</td><td style="padding:6px;border:1px solid var(--border)">+100%</td></tr>\
            <tr><td style="padding:6px;border:1px solid var(--border)">-75%</td><td style="padding:6px;border:1px solid var(--border)">+300%</td></tr>\
          </table>\
          <p style="margin-top:8px">Conclusion: <strong>preserving capital is more important than maximizing return.</strong> Avoiding large drawdowns is mathematically superior to trying to recover from them later.</p>\
        </div>\
\
        <div class="formula-box">\
          <div class="formula-title">Kelly Criterion — optimal position size</div>\
          <div class="formula">f* = (p·b - q) / b</div>\
          <div class="formula-note">f* = fraction of capital to risk | p = probability of gain | q = 1-p | b = gain/loss ratio (e.g., winning R$2 to lose R$1 → b=2). Kelly maximizes long-term capital growth.</div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Kelly example</div>\
          <p>You have a strategy with 60% win rate (p=0.6) and average gain of R$150 for average loss of R$100 (b=1.5):</p>\
          <div class="formula" style="margin:8px 0">f* = (0.6×1.5 - 0.4) / 1.5 = (0.9 - 0.4) / 1.5 = 0.5/1.5 = 33%</div>\
          <p>Kelly suggests risking 33% of capital per trade. In practice, <strong>½ Kelly or ¼ Kelly</strong> is used because estimates of p and b are uncertain — full Kelly is too volatile.</p>\
        </div>\
\
        <h4>Practical position sizing rules</h4>\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">The 2% Rule</div>\
            <div class="use-desc">Never risk more than 2% of total capital in a single trade. With R$100,000, the maximum risk per trade is R$2,000.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Mandatory Stop Loss</div>\
            <div class="use-desc">Define the stop before entering. Position size = Max risk / (Entry price - Stop). Never enter without a defined stop.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Maximum concentration</div>\
            <div class="use-desc">Avoid more than 10–15% in a single asset. Even the best company can suffer unpredictable events (Americanas, Enron).</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Position correlation</div>\
            <div class="use-desc">Having 5 bank stocks is not diversification — it&#39;s 1 concentrated position in banks. Consider consolidated risk.</div>\
          </div>\
        </div>\
\
        <h4>VaR and CVaR — tail risk metrics</h4>\
        <div class="formula-grid">\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">Value at Risk (VaR)</div>\
            <div class="formula">VaR₉₅ = -μ + 1.645·σ (daily)</div>\
            <div class="formula-note">Maximum expected loss with 95% confidence in 1 day. If VaR₉₅ = R$5,000, there is a 5% chance of losing more than that in a single day.</div>\
          </div>\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">CVaR (Expected Shortfall)</div>\
            <div class="formula">CVaR₉₅ = E[Loss | Loss &gt; VaR₉₅]</div>\
            <div class="formula-note">Average of losses in the worst 5% of scenarios. More informative than VaR because it measures the severity of tails, not just the threshold.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">⚠️ VaR Limitations</div>\
          <ul class="hl-list">\
            <li>Assumes normal distribution — underestimates extreme events (fat tails).</li>\
            <li>Does not say what happens beyond the threshold — only that the loss will be "large".</li>\
            <li>In crises, correlations rise, making historical VaR useless as a forecast.</li>\
            <li>Regulators (Basel III) require CVaR because it is more conservative.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['psicologia'] = '      <div class="section-title"><span class="section-icon">🧠</span> Investor Psychology</div>\
      <div class="section-body">\
        <p>Daniel Kahneman (Nobel 2002) demonstrated that humans are systematically irrational in financial decisions. <strong>Cognitive biases</strong> are thinking patterns that deviate decisions from the rationally expected behavior — and they are costly for investors.</p>\
\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Loss Aversion</div>\
            <div class="product-desc"><strong>What it is:</strong> losses hurt 2× more than equivalent gains. Kahneman and Tversky: losing R$100 is psychologically equivalent to gaining R$200.<br><br><strong>Impact:</strong> investor holds losing positions (hoping to recover) and sells winners early (realizing small profit). Result: portfolio full of losers.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Anchoring</div>\
            <div class="product-desc"><strong>What it is:</strong> fixating on an irrelevant reference price (e.g., "I bought at R$50, I won&#39;t sell for less"). The past price has no relation to future value.<br><br><strong>Impact:</strong> selling decisions based on purchase price instead of current fundamentals. "I&#39;ll wait for it to go back to R$50" while the company deteriorates.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Confirmation Bias</div>\
            <div class="product-desc"><strong>What it is:</strong> seeking only information that confirms pre-existing theses and ignoring contrary evidence.<br><br><strong>Impact:</strong> investor convinced a company is great ignores signs of deterioration. "The market just doesn&#39;t understand yet."</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Herd Behavior</div>\
            <div class="product-desc"><strong>What it is:</strong> following the majority without own analysis. If everyone is buying, "it must be good". If everyone sells, "better get out too".<br><br><strong>Impact:</strong> buying at the top (when optimism is maximum) and selling at the bottom (when pessimism is maximum). Exact opposite of what should be done.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Overconfidence</div>\
            <div class="product-desc"><strong>What it is:</strong> overestimating one&#39;s ability to predict the market. Studies show 80% of investors believe they are above average.<br><br><strong>Impact:</strong> over-trading (trading too much), excessive concentration, underestimating risks. The more the investor trades, the worse net returns generally are after costs.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Recency Bias</div>\
            <div class="product-desc"><strong>What it is:</strong> extrapolating recent trends into the future. Stock market rose 3 years → "it will keep rising". Fell a lot → "it will never recover".<br><br><strong>Impact:</strong> investing heavily after a rally (expensive) and freezing or redeeming after a drop (cheap). Does exactly the wrong thing at the wrong time.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> Sunk Cost Fallacy</div>\
            <div class="product-desc"><strong>What it is:</strong> considering unrecoverable past losses in current decision-making. "I&#39;ve already lost R$20,000 here, I can&#39;t get out now."<br><br><strong>Impact:</strong> holding bad positions just because money was already lost in them. The right question is: "If I didn&#39;t have this position, would I buy today?" If no, sell.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Bias</span> FOMO (Fear of Missing Out)</div>\
            <div class="product-desc"><strong>What it is:</strong> fear of missing an opportunity after seeing others profit. Fuel for speculative bubbles.<br><br><strong>Impact:</strong> entering assets without analysis, at the peak of euphoria, paying too much. Bitcoin in 2017, meme stocks in 2021. There will always be another opportunity — haste destroys capital.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 How to combat cognitive biases</div>\
          <ul class="hl-list">\
            <li><strong>Written investment policy:</strong> define before buying: objective, timeframe, sell criteria, stop. Following pre-defined rules eliminates emotion at decision time.</li>\
            <li><strong>Trade journal:</strong> record the investment thesis before entering. Review periodically. You will see your own error patterns.</li>\
            <li><strong>Automatic contributions (DCA):</strong> contributing a fixed amount monthly eliminates timing and FOMO — you buy cheap and expensive automatically, at average cost.</li>\
            <li><strong>Exit checklist:</strong> never sell (or hold) based on emotion. Use objective criteria: thesis broken? Fundamentals worsened? Stop reached?</li>\
            <li><strong>Premortem:</strong> before investing, imagine you&#39;ve already lost 40%. What could have caused it? This helps identify risks that confirmation bias hides.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['tributacao'] = '      <div class="section-title"><span class="section-icon">🧾</span> Complete Investor Taxation Guide</div>\
      <div class="section-body">\
        <p>Taxes are one of the greatest destroyers of long-term returns — and many investors ignore them in planning. Understanding the tax regime for each asset class allows choosing the right product for the right objective.</p>\
\
        <h4>General taxation table — Brazil</h4>\
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:0.88em">\
          <tr style="background:var(--y);color:#000">\
            <th style="padding:8px;text-align:left;border:1px solid var(--border)">Product</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">Income Tax Rate</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">When it applies</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">IOF</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--border)">Notes</th>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Equities (swing trade)</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">15%</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Profit on sale</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Exempt up to R$20,000/month in sales. Monthly DARF if taxable.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Equities (day trade)</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">20%</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Daily profit</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">IRRF 1% of profit withheld at source (advance). No R$20k exemption.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>FIIs (REITs)</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">20% (capital gain) / 0% (dividend)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Sale of units</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Monthly income exempt for individuals. No R$20k exemption.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Equity ETFs</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">15%</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Sale</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">No R$20k exemption. Day trade = 20%. IRRF 1% on sale.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>BDRs</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">15% (swing) / 20% (day)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Profit on sale</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">No R$20k exemption. Dividends taxable as gain.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Treasury Direct / CDB</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">22.5% → 15% (regressive table)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Redemption</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Yes (up to 30 days)</td>\
            <td style="padding:8px;border:1px solid var(--border)">Table: up to 180d = 22.5% | 181–360d = 20% | 361–720d = 17.5% | +720d = 15%</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>LCI / LCA</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">0% (exempt)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">—</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Full exemption for individuals. That&#39;s why they yield less than CDB of same duration.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>CRI / CRA</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">0% (exempt)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">—</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Exempt for individuals. No FGC guarantee — issuer risk.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Common debentures</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">22.5% → 15% (regressive table)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Interest + amortization</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Standard regressive table.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Incentivized debentures</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">0% (exempt)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">—</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Law 12.431. Infrastructure projects. Exempt for individuals.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Fixed Income Funds (come-cotas)</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">15% (LP) / 20% (CP)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">May and Nov + redemption</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Yes (up to 30d)</td>\
            <td style="padding:8px;border:1px solid var(--border)">Come-cotas collects income tax in advance 2×/year, eroding the compounding effect.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>PGBL</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">10% → 27.5% (progressive/regressive table)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Redemption (total)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Tax applies to 100% (principal + gain). Deductible from annual income tax base (up to 12% of gross income).</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>VGBL</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">10% → 27.5% (gain only)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Redemption</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Tax only on gain. Not deductible. Better for those exempt from income tax or for estate planning.</td>\
          </tr>\
          <tr>\
            <td style="padding:8px;border:1px solid var(--border)"><strong>Derivatives (options, futures)</strong></td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">15% (swing) / 20% (day)</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">Monthly profit</td>\
            <td style="padding:8px;text-align:center;border:1px solid var(--border)">No</td>\
            <td style="padding:8px;border:1px solid var(--border)">Loss offset allowed. Day trade: IRRF 1% of profit withheld at source.</td>\
          </tr>\
        </table>\
\
        <h4>DARF — when and how to pay</h4>\
        <div class="concept-box">\
          <div class="concept-title">📌 Individual investor obligations</div>\
          <ul class="hl-list">\
            <li><strong>Equity swing trade:</strong> DARF (code 6015) by the last business day of the month following the taxable sale. You calculate and issue it on the Federal Revenue website or via SICALC.</li>\
            <li><strong>Day trade:</strong> DARF (code 6015) with the same deadline. The 1% IRRF is deducted from the total tax due.</li>\
            <li><strong>FIIs:</strong> DARF (code 6015) on capital gain from unit sales, same deadline. Monthly income is already exempt — no DARF needed.</li>\
            <li><strong>Fixed income:</strong> tax withheld at source by the institution at redemption. No action required from the investor.</li>\
            <li><strong>Losses:</strong> can be offset against future profits of the same asset type (e.g., gain on stock offsets loss on stock). Day trade can only offset day trade.</li>\
          </ul>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">💡 Smart tax planning</div>\
          <ul class="hl-list">\
            <li><strong>Use the R$20k exemption:</strong> if your monthly stock sales don&#39;t exceed R$20,000, there&#39;s no income tax. Plan rebalancing within this limit.</li>\
            <li><strong>Prefer exempt products when equivalent:</strong> LCI/LCA exempt with same duration and risk as taxable CDB — compare the net rate: gross CDB × (1 - tax rate).</li>\
            <li><strong>Avoid come-cotas in fixed income funds:</strong> for conservative profiles, direct CDB or LCI are more efficient than DI funds, which suffer come-cotas.</li>\
            <li><strong>Pension for long term:</strong> the regressive table reaches 10% after 10 years — cheaper than the standard progressive table if income at redemption is high.</li>\
            <li><strong>Tax loss harvesting:</strong> in months with losses in the stock market, sell positions with latent gains to offset — you reduce tax without necessarily changing your allocation (rebuy after the wash sale period, if applicable).</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['montando-carteira'] = '      <div class="section-title"><span class="section-icon">🏗️</span> From Knowledge to Action: 6 Steps</div>\
      <div class="section-body">\
        <p>Knowledge without action does not generate wealth. This final guide turns everything you have learned into a concrete process for building and managing your personal portfolio.</p>\
\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">Step 1 — Financial Diagnosis</div>\
            <div class="use-desc">Calculate your net worth (assets − liabilities). Map your income, fixed expenses, and variable expenses. Identify how much you can save monthly. <strong>Without a diagnosis, there is no treatment.</strong></div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Step 2 — Emergency Reserve</div>\
            <div class="use-desc">Before any investment: 6 months of expenses in liquid and safe assets (Selic Treasury or daily-liquidity CDB). This is the foundation — without it, you sell investments at the worst time.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Step 3 — Define your Profile and Goals</div>\
            <div class="use-desc">Time horizon (short/medium/long), goal (home, retirement, passive income), tolerance to fluctuations. The same investor can have different profiles for different goals — separate portfolios by purpose.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Step 4 — Choose Strategic Allocation</div>\
            <div class="use-desc">Decide the percentage per asset class (fixed income, domestic equities, international equities, REITs, strategic reserve). This decision accounts for ~90% of long-term return variation.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Step 5 — Asset Selection</div>\
            <div class="use-desc">Within each class, choose the specific assets. Use the learned frameworks: fundamentals for equities, duration for fixed income, correlation for the whole. Quality &gt; quantity.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Step 6 — Rebalancing and Evolution</div>\
            <div class="use-desc">Review semiannually. Rebalance to target percentages (sell what rose too much, buy what lagged). Increase risk exposure as wealth and experience grow.</div>\
          </div>\
        </div>\
\
        <h4>Portfolio profiles: practical examples</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Conservative</span> Horizon &lt; 3 years</div>\
            <div class="product-desc">\
              <ul class="hl-list">\
                <li>70% Fixed Income: Selic Treasury + daily CDB + LCI/LCA</li>\
                <li>15% Pre-fixed/IPCA+ Fixed Income: IPCA+ Treasury up to 5 years</li>\
                <li>10% Real estate credit FIIs (CRI/CRA)</li>\
                <li>5% Defensive equities (utilities, sanitation)</li>\
              </ul>\
            </div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Moderate</span> Horizon 5–10 years</div>\
            <div class="product-desc">\
              <ul class="hl-list">\
                <li>40% Diversified Fixed Income (IPCA+, pre-fixed, floating)</li>\
                <li>30% Brazilian Equities (dividends + growth)</li>\
                <li>15% International equities (S&amp;P 500 ETF)</li>\
                <li>10% REITs (brick + credit)</li>\
                <li>5% Strategic reserve (Selic Treasury)</li>\
              </ul>\
            </div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Aggressive</span> Horizon 10+ years</div>\
            <div class="product-desc">\
              <ul class="hl-list">\
                <li>20% Fixed Income (reserve + long IPCA+)</li>\
                <li>40% Brazilian Equities (value + growth + small caps)</li>\
                <li>25% International equities (USA + emerging markets)</li>\
                <li>10% REITs</li>\
                <li>5% Derivatives / protection (hedge options)</li>\
              </ul>\
            </div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag adv">All-Weather</span> Any scenario</div>\
            <div class="product-desc">\
              Based on Ray Dalio&#39;s portfolio, designed to work in any economic environment:\
              <ul class="hl-list" style="margin-top:8px">\
                <li>30% Equities</li>\
                <li>40% Long bonds (IPCA+ Treasury 2045+)</li>\
                <li>15% Medium bonds (3–7 years)</li>\
                <li>7.5% Gold / commodities</li>\
                <li>7.5% Dollar / FX reserve</li>\
              </ul>\
            </div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 The three variables that matter most in the long run</div>\
          <div class="cards-grid-2" style="margin-top:12px">\
            <div>\
              <p><strong>1. Savings rate:</strong> how much you save from what you earn is more determinant than any investment strategy. Doubling the savings rate has an immediate impact. Doubling annual return is uncertain and depends on risk.</p>\
              <p style="margin-top:8px"><strong>2. Time in the market:</strong> R$500/month at 10% p.a. for 30 years = ~R$1.1 million. Starting 10 years earlier doubles the final result. Time is the only asset that cannot be bought.</p>\
            </div>\
            <div>\
              <p><strong>3. Consistency of contributions:</strong> DCA (Dollar Cost Averaging) — regular contributions regardless of market — eliminates bad timing risk and automatically benefits from drops (buying cheaper).</p>\
              <p style="margin-top:8px">The combination of these three variables surpasses any stock-picking or market timing as a wealth generator for the individual investor.</p>\
            </div>\
          </div>\
        </div>\
\
        <div class="cta-box" style="margin-top:40px">\
          <div class="cta-title">You have completed the Financial Markets Course</div>\
          <div class="cta-sub">From macroeconomics to derivatives, from fundamental analysis to investor psychology — you now have the complete framework to invest with intelligence and discipline.</div>\
          <a href="../index.html" class="cta-btn">Explore other tools</a>\
        </div>\
      </div>\
    ';

SEC_EN['slope-intro'] = '      <div class="section-title"><span class="section-icon">🔭</span> What is Regression Analysis and Why It Matters for Investors</div>\
      <div class="section-body">\
        <p>In previous modules you learned concepts like Beta, correlation, CAPM, and time series in a theoretical way. The Slope platform allows you to <strong>test these hypotheses with real data</strong> — turning intuitions into quantifiable evidence.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 What regression answers for the investor</div>\
          <ul class="hl-list">\
            <li><strong>Is there a relationship between two variables?</strong> E.g.: does Petrobras&#39; price really follow the oil price?</li>\
            <li><strong>How strong is that relationship?</strong> R² measures how much of the asset&#39;s variation is explained by the independent variable.</li>\
            <li><strong>Is the relationship statistically significant or just noise?</strong> The p-value of the coefficient answers this.</li>\
            <li><strong>What would the expected value be given a scenario?</strong> The model allows projections with confidence intervals.</li>\
            <li><strong>How does the stock behave in different market regimes?</strong> Quantile regression shows behavior in the tails (crises and rallies).</li>\
          </ul>\
        </div>\
\
        <h4>The 6 types of analysis available and when to use each</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header" data-i18n-html="pcard-hdr-linear"><span class="product-tag rf">Linear</span> Simple Linear Regression</div>\
            <div class="product-desc" data-i18n-html="pcard-desc-linear"><strong>Use for:</strong> measuring an asset&#39;s Beta (stock return × index return), checking if a macroeconomic variable explains an asset&#39;s price, calculating correlation between two assets.<br><br><strong>Practical ex.:</strong> daily returns of PETR4 × Brent variation.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header" data-i18n-html="pcard-hdr-multipla"><span class="product-tag rf">Multiple</span> Multiple Linear Regression</div>\
            <div class="product-desc" data-i18n-html="pcard-desc-multipla"><strong>Use for:</strong> multifactor model (Fama-French style) — explaining a stock&#39;s return by multiple simultaneous factors (market, size, value, momentum).<br><br><strong>Practical ex.:</strong> VALE3 return ~ IBOV return + dollar variation + iron ore price.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header" data-i18n-html="pcard-hdr-polinomial"><span class="product-tag rv">Polynomial</span> Polynomial Regression</div>\
            <div class="product-desc" data-i18n-html="pcard-desc-polinomial"><strong>Use for:</strong> non-linear relationships between variables (yield curve, price elasticity). Good when the dispersion pattern in the chart suggests curvature.<br><br><strong>Practical ex.:</strong> modeling the options return curve as a function of implied volatility (volatility smile).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header" data-i18n-html="pcard-hdr-logistica"><span class="product-tag rv">Logistic</span> Logistic Regression</div>\
            <div class="product-desc" data-i18n-html="pcard-desc-logistica"><strong>Use for:</strong> predicting probability of binary events — chance of a company defaulting, probability of the index closing positive given a set of indicators.<br><br><strong>Practical ex.:</strong> predict if IBOV will rise tomorrow based on RSI, volume, and US market opening.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header" data-i18n-html="pcard-hdr-quantilica"><span class="product-tag der">Quantile</span> Quantile Regression</div>\
            <div class="product-desc" data-i18n-html="pcard-desc-quantilica"><strong>Use for:</strong> analyzing behavior in the tails of the distribution — how the asset behaves in extreme scenarios (crashes and rallies) vs. normal days. Captures asymmetry.<br><br><strong>Practical ex.:</strong> how USDBRL reacts to country risk in the worst 10% of days for the stock market.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header" data-i18n-html="pcard-hdr-regularizada"><span class="product-tag der">Ridge/Lasso</span> Regularization</div>\
            <div class="product-desc" data-i18n-html="pcard-desc-regularizada"><strong>Use for:</strong> models with many explanatory variables (overfitting). Ridge keeps all factors with reduced coefficients; Lasso automatically eliminates irrelevant ones.<br><br><strong>Practical ex.:</strong> model with 15 technical indicators — Lasso identifies which ones really matter.</div>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['slope-beta'] = '      <div class="section-title"><span class="section-icon">📈</span> Example 1 — Calculating an Asset&#39;s Beta</div>\
      <div class="section-body">\
        <p>Beta is the slope coefficient of the regression of an asset&#39;s returns against market returns. Instead of calculating manually, Slope does this in seconds with real market data.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Step-by-step: Beta of PETR4 against IBOVESPA</div>\
          <ul class="hl-list">\
            <li><strong>1. Open the platform</strong> and select <em>Simple Linear Regression Analysis</em>.</li>\
            <li><strong>2. Data source:</strong> click "Import from financial market". Type <code>PETR4.SA</code> in the ticker field and select the desired period (e.g., last 2 years, daily frequency).</li>\
            <li><strong>3. Add the index:</strong> repeat for <code>^BVSP</code> (IBOVESPA). You now have two imported assets.</li>\
            <li><strong>4. Configure:</strong> set Y = daily returns of PETR4 and X = daily returns of IBOV. Click "Calculate Returns" if the platform uses raw prices.</li>\
            <li><strong>5. Run the regression.</strong></li>\
          </ul>\
        </div>\
\
        <h4>Reading the results</h4>\
        <div class="cards-grid-2">\
          <div>\
            <p>Slope displays the coefficients table with the following main values:</p>\
            <table style="width:100%;border-collapse:collapse;margin-top:8px">\
              <tr style="background:var(--bg-2)">\
                <th style="padding:8px;border:1px solid var(--border)">Metric</th>\
                <th style="padding:8px;border:1px solid var(--border)">What it means</th>\
              </tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)"><strong>Slope Coefficient (β)</strong></td><td style="padding:8px;border:1px solid var(--border)">This is the <strong>asset&#39;s Beta</strong>. β=1.4 → PETR4 moves 40% more than IBOV.</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)"><strong>Intercept (α)</strong></td><td style="padding:8px;border:1px solid var(--border)">Jensen&#39;s Alpha — the return the asset generates independent of the market. α&gt;0 is favorable.</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)"><strong>R²</strong></td><td style="padding:8px;border:1px solid var(--border)">% of PETR4&#39;s variation explained by IBOV. R²=0.65 → 65% of the movement is market-driven.</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)"><strong>p-value of β</strong></td><td style="padding:8px;border:1px solid var(--border)">If &lt;0.05, the relationship is statistically significant. If ≥0.05, it may be noise.</td></tr>\
              <tr><td style="padding:8px;border:1px solid var(--border)"><strong>RMSE</strong></td><td style="padding:8px;border:1px solid var(--border)">Model&#39;s average error — average residual deviation of the asset relative to the index (specific risk).</td></tr>\
            </table>\
          </div>\
          <div class="concept-box" style="margin:0;align-self:start">\
            <div class="concept-title">💡 Practical interpretation</div>\
            <p>If β=1.4, p&lt;0.001 and R²=0.65, you conclude:</p>\
            <ul class="hl-list" style="margin-top:8px">\
              <li>PETR4 is a <strong>high-Beta</strong> asset — amplifies market movements.</li>\
              <li>65% of its risk is systematic (non-diversifiable). 35% is Petrobras-specific.</li>\
              <li>RMSE represents idiosyncratic risk — what fundamentals and company news control.</li>\
              <li>To reduce total risk, combine PETR4 with low-Beta assets with negative correlation.</li>\
            </ul>\
          </div>\
        </div>\
\
        <h4>Charts generated by the platform</h4>\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">Scatter + regression line</div>\
            <div class="use-desc">Each point is a day. The slope of the line is the Beta. Points dispersed around the line = high specific risk (high RMSE).</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Residuals vs. fitted values</div>\
            <div class="use-desc">Detects heteroscedasticity — if the dispersion of residuals increases with the fitted value, the linear model may not be adequate. Consider log-returns.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Q-Q Plot</div>\
            <div class="use-desc">Shows if residuals follow a normal distribution. Deviations in the tails = fat tails — extreme events are more frequent than the model assumes. Relevant for VaR.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Cook&#39;s Distance</div>\
            <div class="use-desc">Identifies influential observations that distort the regression. Points with Cook &gt; 1 are suspicious — they may be crashes, circuit breakers, or data errors.</div>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['slope-macro'] = '      <div class="section-title"><span class="section-icon">🌐</span> Example 2 — Modeling the Impact of Macroeconomic Variables</div>\
      <div class="section-body">\
        <p>One of the most valuable applications for investors is quantifying how much macroeconomic variables affect different assets. This allows building portfolios with conscious exposures to each risk factor.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Example: how much does the dollar explain the exporter index?</div>\
          <ul class="hl-list">\
            <li><strong>Y:</strong> daily return of a basket of exporters (Vale, Petrobras, Suzano, JBS) — import each ticker via financial market.</li>\
            <li><strong>X:</strong> daily variation of USDBRL (dollar vs. real).</li>\
            <li><strong>Model:</strong> Simple Linear Regression.</li>\
          </ul>\
          <p style="margin-top:8px">Expected result: positive coefficient (~0.4 to 0.7) — when the dollar rises 1%, exporters tend to rise 0.4–0.7%. A significant p-value confirms the hypothesis.</p>\
        </div>\
\
        <h4>Multifactor model with multiple regression</h4>\
        <p>Want to go further? Use multiple regression to separate the contribution of each factor:</p>\
        <div class="concept-box">\
          <div class="concept-title">📌 Step-by-step: simplified Fama-French model for VALE3</div>\
          <ul class="hl-list">\
            <li><strong>Y:</strong> daily return VALE3.SA</li>\
            <li><strong>X₁:</strong> daily return ^BVSP (market factor)</li>\
            <li><strong>X₂:</strong> daily variation USDBRL=X (exchange rate factor)</li>\
            <li><strong>X₃:</strong> variation of iron ore price (import as manual series or via CSV)</li>\
            <li><strong>Model:</strong> Multiple Linear Regression in Slope</li>\
          </ul>\
          <p style="margin-top:8px">Slope displays the partial coefficient of each factor, controlling for the others. You discover how much each variable contributes <em>independently</em>. If the iron ore coefficient has p&lt;0.01, it is a relevant factor even after controlling for market and exchange rate.</p>\
        </div>\
\
        <div class="cards-grid-2">\
          <div class="formula-box" style="margin:0">\
            <div class="formula-title">Estimated model (hypothetical example)</div>\
            <div class="formula">VALE3 = 0.002 + 1.15·IBOV + 0.38·USDBRL + 0.61·IronOre</div>\
            <div class="formula-note">Interpretation: VALE3 has market Beta of 1.15, FX sensitivity of 0.38, and iron ore sensitivity of 0.61. For each 1% rise in iron ore, VALE3 tends to rise 0.61% (ceteris paribus).</div>\
          </div>\
          <div class="concept-box" style="margin:0;align-self:start">\
            <div class="concept-title">💡 Utility for portfolio management</div>\
            <p>With these coefficients, you know exactly what the portfolio&#39;s exposure to each factor is. To <strong>hedge</strong> currency exposure, buy a dollar ETF or futures contract proportional to the estimated coefficient.</p>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['slope-series'] = '      <div class="section-title"><span class="section-icon">📉</span> Example 3 — Time Series Analysis (ARIMA and GARCH)</div>\
      <div class="section-body">\
        <p>For those who want to go beyond static regression, Slope offers time series analysis with decomposition, ARIMA, and GARCH — tools used by professional managers to model prices, volatility, and make projections.</p>\
\
        <h4>Time series decomposition</h4>\
        <div class="concept-box">\
          <div class="concept-title">📌 What decomposition reveals</div>\
          <p>Slope separates any series into 3 components:</p>\
          <ul class="hl-list" style="margin-top:8px">\
            <li><strong>Trend:</strong> long-term direction of the price/indicator.</li>\
            <li><strong>Seasonality:</strong> repetitive patterns (e.g., company earnings impact price every quarter).</li>\
            <li><strong>Residual:</strong> what remains — random shocks, news, events.</li>\
          </ul>\
          <p style="margin-top:8px"><strong>Practical application:</strong> import the historical price of a logistics REIT. The decomposition will reveal whether there is a structural upward trend (demand for warehouses) and whether the price rises systematically in certain months (dividend window).</p>\
        </div>\
\
        <h4>ARIMA — modeling and forecasting prices</h4>\
        <p>ARIMA (AutoRegressive Integrated Moving Average) captures the autocorrelation structure of a series — i.e., how much today&#39;s price is explained by past prices.</p>\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">ARIMA(p,d,q) Parameters</div>\
            <ul class="hl-list">\
              <li><strong>p (AR):</strong> how many past lags to include. Use the PACF chart from the platform to identify.</li>\
              <li><strong>d (I):</strong> how many differentiations make the series stationary. Stock prices generally require d=1 (work with returns).</li>\
              <li><strong>q (MA):</strong> how many past shocks to include. Use the ACF chart.</li>\
            </ul>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">📌 Example: projecting IPCA+ Treasury 2045</div>\
            <ul class="hl-list">\
              <li>Import the IPCA+ Treasury 2045 rate history as CSV.</li>\
              <li>Run decomposition — see the real interest rate trend.</li>\
              <li>Run ARIMA(1,1,1) as a starting point.</li>\
              <li>Slope projects the next N periods with a <strong>confidence interval</strong> — the uncertainty band of the projection.</li>\
              <li>Combine with the duration concept learned in Module 2 to estimate the bond price impact.</li>\
            </ul>\
          </div>\
        </div>\
\
        <h4>GARCH — modeling volatility</h4>\
        <p>GARCH (Generalized AutoRegressive Conditional Heteroskedasticity) models the fact that <strong>volatility clusters</strong> — periods of high volatility tend to be followed by more volatility (which you saw in the VaR concept).</p>\
        <div class="concept-box">\
          <div class="concept-title">📌 Application: dynamic VaR with GARCH</div>\
          <ul class="hl-list">\
            <li><strong>1.</strong> Import daily returns of your portfolio (or an asset) via financial market.</li>\
            <li><strong>2.</strong> Run the GARCH(1,1) model in Slope.</li>\
            <li><strong>3.</strong> The conditional volatility chart shows periods of high (2020 crisis, elections) and low volatility.</li>\
            <li><strong>4.</strong> The volatility projection for the coming days allows calculating a <strong>dynamic VaR</strong> — much more accurate than static VaR with fixed σ.</li>\
            <li><strong>5.</strong> Use this to adjust position sizes: when GARCH projects high volatility, reduce exposure (reduced Kelly); when it projects low volatility, you can expand.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['slope-opcoes'] = '      <div class="section-title"><span class="section-icon">🎯</span> Example 4 — Analyzing Options with Quantile Regression</div>\
      <div class="section-body">\
        <p>In Module 4 you learned that an option&#39;s price depends on implied volatility and Delta. Quantile regression allows analyzing how an asset behaves in different market regimes — something that average linear regression does not capture.</p>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Use case: IBOV behavior at the extremes</div>\
          <p>You want to know: when the S&amp;P 500 falls a lot (10th percentile), how much does IBOV fall on average? And when the S&amp;P rises a lot (90th percentile), how much does IBOV rise?</p>\
          <ul class="hl-list" style="margin-top:8px">\
            <li><strong>Y:</strong> daily return of ^BVSP</li>\
            <li><strong>X:</strong> daily return of ^GSPC (S&amp;P 500)</li>\
            <li><strong>Model:</strong> Quantile Regression with quantiles: 0.10, 0.25, 0.50, 0.75, 0.90</li>\
          </ul>\
          <p style="margin-top:8px">Typical result: at quantile 0.10 (bad days), the coefficient is 1.8 — IBOV falls 80% more than the S&amp;P in crises. At quantile 0.90 (great days), the coefficient is 1.2 — IBOV rises 20% more. This is the <strong>tail asymmetry</strong> that the average correlation of 0.6 hides.</p>\
        </div>\
\
        <h4>Using this for options strategies</h4>\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">Calibrate portfolio hedge</div>\
            <div class="use-desc">If the coefficient at the 10th percentile is 1.8, you need more puts than the average Beta suggests to adequately protect the portfolio in crises.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Price asymmetry</div>\
            <div class="use-desc">If the asset falls more than it rises (10th percentile coefficient &gt; 90th percentile), puts are worth more than calls of the same strike — this explains the volatility skew.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Size vertical spreads</div>\
            <div class="use-desc">The 10th percentile indicates the expected move in the worst-case scenario. Use this to define the strike of the short leg in a bear spread.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Validate VaR</div>\
            <div class="use-desc">Compare the parametric VaR calculated in Module 5 with the interval predicted by the quantile model. Large divergences indicate fat tails not captured by the normal model.</div>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['slope-fluxo'] = '      <div class="section-title"><span class="section-icon">🗂️</span> Complete Analysis Flow: from Data to Decision</div>\
      <div class="section-body">\
        <p>To consolidate, see how to integrate the Slope platform into a complete quantitative analysis workflow — from data collection to investment decision.</p>\
\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">1. Data collection</div>\
            <div class="use-desc">Use the financial market integration to import historical prices directly (tickers like PETR4.SA, ^BVSP, USDBRL=X). For macroeconomic data (IPCA, Selic), import via CSV from the Brazilian Central Bank or IBGE website.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">2. Exploratory analysis</div>\
            <div class="use-desc">Start with the scatter plot and correlation coefficient. Visualize the relationship before modeling. A non-linear pattern in the chart signals that linear regression may not be adequate.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">3. Model selection</div>\
            <div class="use-desc">Linear for direct relationships. Polynomial if there is curvature. Quantile for tail analysis. Time series (ARIMA/GARCH) if the variable of interest is a price or volatility over time.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">4. Statistical validation</div>\
            <div class="use-desc">Check: R² (explanatory power), p-values of coefficients (significance), residuals chart (homoscedasticity), and Q-Q plot (normality). A model with R²=0.3 and p&lt;0.01 is valid — but limited.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">5. Economic interpretation</div>\
            <div class="use-desc">Translate coefficients into investment language. A coefficient of 0.6 for exchange rate in exporter returns means 60% FX exposure — hedge proportionally.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">6. Decision and monitoring</div>\
            <div class="use-desc">Save the analysis on the platform (cloud). Export to Excel BI to document assumptions. Revisit and re-estimate the model semiannually — coefficients change with market regimes.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">⚠️ Important limitations — do not confuse model with reality</div>\
          <ul class="hl-list">\
            <li><strong>Correlation is not causation:</strong> IBOV and exchange rate are correlated, but it is foreign capital flow that causes both. Models identify relationships, not causes.</li>\
            <li><strong>Overfitting:</strong> a model with too many variables can fit the historical data perfectly and fail completely out of sample. Use Ridge/Lasso to penalize complexity.</li>\
            <li><strong>Coefficient instability:</strong> a stock&#39;s Beta in 2018 may differ from its Beta in 2024. Always estimate with a recent window and monitor structural breaks.</li>\
            <li><strong>Non-stationary data:</strong> never regress prices directly — use returns (difference of log-prices). Prices have a trend and violate regression assumptions.</li>\
            <li><strong>Models are tools, not oracles:</strong> use as one of the inputs in the decision, never as the only one. Combine with fundamental and macroeconomic analysis.</li>\
          </ul>\
        </div>\
\
        <div class="cta-box" style="margin-top:32px">\
          <div class="cta-title">Ready to apply in practice?</div>\
          <div class="cta-sub">Open the Slope platform, import your favorite assets, and replicate the examples from this module. Start with the Beta calculation — it&#39;s the simplest and already delivers immediate insights about your portfolio.</div>\
          <a href="../analise.html" class="cta-btn">Open analysis platform</a>\
        </div>\
      </div>\
    ';

SEC_EN['usa-visao-geral'] = '      <div class="section-title"><span class="section-icon">🌎</span> Overview of the American Market</div>\
      <div class="section-body">\
        <p>The United States is home to the <strong>largest and most liquid financial market in the world</strong>. The S&amp;P 500 alone represents about <strong>40–45% of global stock market capitalization</strong>. The dollar is the international reserve currency and Treasuries are the "risk-free" asset of reference for the entire global financial system.</p>\
        <p>For Brazilian investors, understanding the American market is essential for two reasons: <strong>(1)</strong> the correlation between IBOV and the S&amp;P 500 is historically high (~0.6–0.7), so what happens in New York affects São Paulo; <strong>(2)</strong> diversifying in dollars is the main way to protect wealth against real currency depreciation.</p>\
\
        <div class="cards-grid">\
          <div class="info-card">\
            <div class="info-card-icon">🏛️</div>\
            <div class="info-card-title">Market Size</div>\
            <div class="info-card-body">NYSE + NASDAQ capitalization: ~US$50 trillion. Bond market: ~US$50 trillion. US GDP: ~US$27 trillion (2024).</div>\
          </div>\
          <div class="info-card">\
            <div class="info-card-icon">🔗</div>\
            <div class="info-card-title">Regulators</div>\
            <div class="info-card-body"><strong>SEC</strong> (Securities and Exchange Commission): regulates exchanges and stocks.<br><strong>CFTC</strong>: regulates derivatives and commodities.<br><strong>FINRA</strong>: broker self-regulation.<br>Equivalents to Brazil&#39;s CVM and CMN.</div>\
          </div>\
          <div class="info-card">\
            <div class="info-card-icon">🕐</div>\
            <div class="info-card-title">Trading Hours</div>\
            <div class="info-card-body">Regular market: 9:30am–4:00pm (New York time, ET).<br>Pre-market: 4:00am–9:30am ET.<br>After-hours: 4:00pm–8:00pm ET.<br>Brasília time: -1h (US summer) or -2h (US winter) relative to ET.</div>\
          </div>\
          <div class="info-card">\
            <div class="info-card-icon">📊</div>\
            <div class="info-card-title">Main Indices</div>\
            <div class="info-card-body"><strong>S&amp;P 500:</strong> 500 largest companies, global benchmark.<br><strong>Dow Jones (DJIA):</strong> 30 historical blue chips, price-weighted.<br><strong>NASDAQ-100:</strong> top 100 tech/growth.<br><strong>Russell 2000:</strong> American small caps.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">💡 How the American market affects Brazil</div>\
          <ul class="hl-list">\
            <li><strong>Capital flows:</strong> when the Fed raises rates, dollars leave emerging markets (including Brazil) for the US, pressuring the exchange rate and the Brazilian stock market.</li>\
            <li><strong>Risk appetite:</strong> when the S&amp;P 500 falls sharply (risk-off), investors sell risk assets globally — including IBOV.</li>\
            <li><strong>Commodities:</strong> gold, oil, and soybeans are traded in dollars on American exchanges (CME/NYMEX/ICE), directly impacting Brazilian exporters like VALE3 and PETROBRAS.</li>\
            <li><strong>BDRs:</strong> Brazilian investors can buy receipts of American stocks directly on B3 (AAPL34, MSFT34, GOOGL34, etc.) without needing an overseas account.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['usa-fed'] = '      <div class="section-title"><span class="section-icon">🏦</span> Federal Reserve and Monetary Policy</div>\
      <div class="section-body">\
        <p>The <strong>Federal Reserve (Fed)</strong> is the American central bank, founded in 1913. Its structure differs from the Brazilian Central Bank: it is composed of 12 regional banks and a central board (Board of Governors) in Washington. The main monetary policy committee is the <strong>FOMC — Federal Open Market Committee</strong>, which meets 8 times per year.</p>\
\
        <h4>Dual Mandate</h4>\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">🎯 Inflation: 2% annual target</div>\
            <p>The Fed targets the <strong>PCE (Personal Consumption Expenditures)</strong> index — specifically Core PCE (excluding food and energy) — as its preferred inflation measure. The CPI (Consumer Price Index) is most watched by the market, but the Fed decides based on PCE.</p>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">💼 Maximum employment</div>\
            <p>The Fed has no fixed numerical unemployment target — it seeks "maximum sustainable employment." The <strong>Non-Farm Payrolls (NFP)</strong>, released on the first Friday of the month, is the main employment indicator and moves global markets.</p>\
          </div>\
        </div>\
\
        <h4>Fed Funds Rate — the American interest rate</h4>\
        <p>The equivalent of Brazil&#39;s Selic is the <strong>Fed Funds Rate</strong> — the rate American banks charge each other for overnight loans. The FOMC sets a target (25 bps range) and the Fed implements it via open market operations.</p>\
\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Tool</span> Dot Plot</div>\
            <div class="product-desc">Published quarterly: each FOMC member projects where the Fed Funds Rate will be in the future. The market analyzes the "dot plot" to anticipate the rate cycle. It is the American equivalent of the Brazilian Copom&#39;s communication.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Tool</span> QE and QT</div>\
            <div class="product-desc"><strong>QE (Quantitative Easing):</strong> the Fed buys Treasuries and MBS from the market, injecting liquidity. Used in crises (2008, 2020). Pushes down long rates and inflates risk assets.<br><br><strong>QT (Quantitative Tightening):</strong> the opposite — the Fed lets bonds mature without reinvesting, draining liquidity from the system.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Impact</span> Rate Cycle and Assets</div>\
            <div class="product-desc"><strong>Rates rising:</strong> dollar strengthens, bonds fall, growth stocks fall more than value, emerging markets suffer.<br><br><strong>Rates falling:</strong> dollar weakens, bonds rise, growth and tech lead the rally, capital flows to emerging markets.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Indicator</span> American Yield Curve</div>\
            <div class="product-desc">An inverted curve (short rate &gt; long rate, e.g., 2y &gt; 10y) has been a reliable predictor of recession over the past 50 years. Watch the <strong>10y − 2y</strong> spread — when negative, the market is pricing future economic slowdown.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Fed calendar and communication</div>\
          <ul class="hl-list">\
            <li><strong>FOMC Meeting:</strong> 8 meetings/year (January, March, May, June, July, September, November, December). Decision published at 2pm ET with a statement and, at the March/June/September/December meetings, the SEP (Summary of Economic Projections) with the Dot Plot.</li>\
            <li><strong>Press Conference:</strong> after each meeting, the Chairman (Jerome Powell) holds a press conference. Remarks are analyzed word by word by the market.</li>\
            <li><strong>Fed Minutes:</strong> 3 weeks after each meeting, the detailed minutes are published. Reveals internal debates and voting dissents.</li>\
            <li><strong>Jackson Hole:</strong> annual symposium in August, Wyoming. Chairman&#39;s speech frequently announces changes in the direction of monetary policy.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['usa-treasuries'] = '      <div class="section-title"><span class="section-icon">📄</span> Treasuries and American Fixed Income</div>\
      <div class="section-body">\
        <p><strong>Treasuries</strong> are securities issued by the US Treasury — the equivalent of Brazil&#39;s Treasury Direct, but with a fundamental difference: they are considered the global <strong>"risk-free"</strong> reference asset. The 10-year Treasury yield is the "anchor" for pricing all assets on the planet.</p>\
\
        <h4>Types of Treasuries</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">T-Bills</span> Treasury Bills</div>\
            <div class="product-desc"><strong>Maturity:</strong> up to 52 weeks (4 weeks, 13 weeks, 26 weeks, 52 weeks).<br><br><strong>How they work:</strong> sold at a discount (zero coupon). Equivalent to Selic Treasury in terms of liquidity, but with a fixed short-term return.<br><br><strong>Reference:</strong> the 3-month T-Bill yield (~5% in 2024) is the "risk-free rate" used in formulas like the Sharpe Ratio globally.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">T-Notes</span> Treasury Notes</div>\
            <div class="product-desc"><strong>Maturity:</strong> 2, 3, 5, 7, and 10 years. Pay semiannual coupon.<br><br><strong>The most important:</strong> the <strong>10y Treasury Note</strong> is the global reference interest rate. American mortgages, corporate credit, stock valuation — everything is priced relative to it.<br><br><strong>Brazil analogy:</strong> similar to IPCA+ Treasury or Pre-fixed Treasury, but without inflation correction (except TIPS).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">T-Bonds</span> Treasury Bonds</div>\
            <div class="product-desc"><strong>Maturity:</strong> 20 and 30 years. Semiannual coupon.<br><br><strong>Characteristics:</strong> maximum duration and rate sensitivity. A 1pp rise in yield can cause a 15–20% drop in the price of a 30-year T-Bond. High price volatility despite zero credit risk.<br><br><strong>Use:</strong> pension funds and insurance companies use them for duration matching with long-term liabilities.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">TIPS</span> Treasury Inflation-Protected</div>\
            <div class="product-desc"><strong>How it works:</strong> the principal is adjusted by the US CPI. Coupon × adjusted principal = real inflation protection.<br><br><strong>Negative TIPS yield:</strong> when inflation expectations are very high, TIPS are so in demand that their nominal yield turns negative (like Brazil&#39;s pre-fixed IPCA+ Treasury).<br><br><strong>Breakeven inflation:</strong> T-Note yield − TIPS yield = market inflation expectation.</div>\
          </div>\
        </div>\
\
        <h4>Private Credit in the US</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Investment Grade</span> IG Corporate Bonds</div>\
            <div class="product-desc">Securities from companies rated BBB- or above (S&amp;P) / Baa3 or above (Moody&#39;s). <strong>Ex.:</strong> Apple, Microsoft, J&amp;J. Spread over Treasury of 80–200 bps (under normal conditions). Reference ETF: LQD (iShares).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">High Yield</span> Junk Bonds</div>\
            <div class="product-desc">Rating below BB+ (S&amp;P). Higher yield, higher default risk. Spread over Treasury of 300–600+ bps. Behaves more like equities in crises. Reference ETFs: HYG, JNK. Rough equivalent to higher-risk debentures in Brazil.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Munis</span> Municipal Bonds</div>\
            <div class="product-desc">Issued by American states and municipalities. Main attraction: <strong>federal income tax exemption</strong> (and often state-level too). Attractive for investors in high tax brackets (37%). Brazilian equivalent: LCI/LCA in terms of tax benefit.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Agency</span> Agency Bonds / MBS</div>\
            <div class="product-desc">Issued by GSEs (Fannie Mae, Freddie Mac, Ginnie Mae). <strong>MBS (Mortgage-Backed Securities):</strong> packages of residential mortgages. The US MBS market (~US$12 trillion) is the largest private fixed income market in the world.</div>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['usa-bolsas'] = '      <div class="section-title"><span class="section-icon">📈</span> American Stock Exchanges: NYSE and NASDAQ</div>\
      <div class="section-body">\
        <p>The US has two major stock exchanges and several electronic trading systems (ECNs). Unlike Brazil, which has a single exchange (B3), the American market is fragmented — an order can be executed in dozens of different venues.</p>\
\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">🏛️ NYSE — New York Stock Exchange</div>\
            <p>Founded in 1792, it is the world&#39;s largest stock exchange by capitalization (~US$25 tri). Located on Wall Street. Uses the <strong>Designated Market Makers (DMMs)</strong> system, the modern successors of the old human "specialists." Lists mainly traditional companies and large conglomerates: JPMorgan, Berkshire Hathaway, Coca-Cola, Walmart.</p>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">💻 NASDAQ — National Association of Securities Dealers</div>\
            <p>Founded in 1971, it was the world&#39;s first electronic exchange. Uses a system of competitive <strong>Market Makers</strong> — dozens of firms compete to offer the best bid/ask. Specializes in technology: Apple, Microsoft, Amazon, Google, Meta, Netflix, Tesla. Main index: NASDAQ Composite and NASDAQ-100.</p>\
          </div>\
        </div>\
\
        <h4>The Main Indices in Detail</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">S&amp;P 500</span> Standard &amp; Poor&#39;s 500</div>\
            <div class="product-desc"><strong>Composition:</strong> 500 largest-cap companies listed in the US (NYSE + NASDAQ), float-weighted.<br><br><strong>Universal benchmark:</strong> it is the benchmark of active American management — consistently beating the S&amp;P 500 is the goal of any equity manager.<br><br><strong>Historical return:</strong> ~10% p.a. nominal since 1957 (~7% real), with dividends reinvested.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">DJIA</span> Dow Jones Industrial Average</div>\
            <div class="product-desc"><strong>Composition:</strong> only 30 companies, weighted by <em>price</em> (not by capitalization — a historical anomaly).<br><br><strong>Limitations:</strong> because it is price-weighted, a company with an expensive stock has more weight than a large company with a cheap stock. Not a good market representative — S&amp;P 500 is superior for analysis.<br><br><strong>Use:</strong> historical and news reference. "The Dow rose X points" is still a daily headline.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">NASDAQ-100</span> NDX</div>\
            <div class="product-desc"><strong>Composition:</strong> 100 largest non-financials listed on NASDAQ, cap-weighted.<br><br><strong>Concentration:</strong> top 10 companies (~50% of weight): Apple, Microsoft, NVIDIA, Amazon, Meta, Tesla, Alphabet, etc.<br><br><strong>High Beta:</strong> historically more volatile than the S&amp;P 500 — rises more in bull markets and falls more in bear markets. Reference ETF: QQQ.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Russell 2000</span> Small Caps</div>\
            <div class="product-desc"><strong>Composition:</strong> 2,000 American small companies (positions 1001–3000 by capitalization).<br><br><strong>Economic indicator:</strong> small caps are more sensitive to the domestic American economy (less international exposure). When Russell 2000 leads, it generally reflects optimism about US internal growth.<br><br><strong>Reference ETF:</strong> IWM (iShares).</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 American market circuit breakers</div>\
          <ul class="hl-list">\
            <li><strong>Level 1 (−7%):</strong> 15-minute halt if the S&amp;P 500 falls 7% from the previous close.</li>\
            <li><strong>Level 2 (−13%):</strong> another 15-minute halt.</li>\
            <li><strong>Level 3 (−20%):</strong> market closes for the remainder of the day.</li>\
            <li>Implemented after the 1987 crash (Black Monday, −22.6% in one day). Triggered in March 2020 (COVID) — 4 times in 10 trading days.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['usa-acoes'] = '      <div class="section-title"><span class="section-icon">📊</span> Equities in the US: How It Works</div>\
      <div class="section-body">\
        <p>The American equity market is regulated by the SEC and has a more transparent and mature structure than most world markets. Understanding its particularities is essential for those who want to invest directly.</p>\
\
        <h4>Tickers and Nomenclature</h4>\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">American tickers</div>\
            <ul class="hl-list">\
              <li>NYSE: <strong>1–3 letter</strong> tickers. E.g.: F (Ford), T (AT&amp;T), IBM.</li>\
              <li>NASDAQ: <strong>4–5 letter</strong> tickers. E.g.: AAPL, MSFT, AMZN, GOOGL.</li>\
              <li>Share classes: <strong>A</strong> (normal voting), <strong>B</strong> (super-voting — founders). E.g.: Alphabet has GOOGL (class A) and GOOG (class C, no vote).</li>\
              <li>BDRs on B3: American ticker + <strong>34</strong> (ordinary share) or <strong>35</strong>. E.g.: AAPL34, MSFT34.</li>\
            </ul>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">S&amp;P 500 Sectors (GICS)</div>\
            <ul class="hl-list">\
              <li>Information Technology (~29%): Apple, Microsoft, NVIDIA</li>\
              <li>Health Care (~13%): UnitedHealth, J&amp;J, Eli Lilly</li>\
              <li>Financials (~13%): JPMorgan, Berkshire, Bank of America</li>\
              <li>Consumer Discretionary (~10%): Amazon, Tesla, McDonald&#39;s</li>\
              <li>Communication Services (~9%): Alphabet, Meta, Netflix</li>\
              <li>Industrials, Energy, Real Estate, Materials, Utilities, Staples</li>\
            </ul>\
          </div>\
        </div>\
\
        <h4>Earnings Season and Transparency</h4>\
        <p>Each quarter, companies publish results. The concentrated period of disclosures is called the <strong>Earnings Season</strong>:</p>\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">10-K (Annual Report)</div>\
            <div class="use-desc">Equivalent to Brazil&#39;s reference form. Audited. Includes full balance sheet, income statement, cash flow, risks, management discussion and analysis (MD&amp;A). Required by SEC 60–90 days after fiscal year end.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">10-Q (Quarterly Report)</div>\
            <div class="use-desc">Equivalent to Brazil&#39;s ITR. Not audited. Includes quarterly financial statements and risk updates. Deadline: 40–45 days after the quarter.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">8-K (Material Event)</div>\
            <div class="use-desc">Equivalent to Brazil&#39;s Fato Relevante (CVM). Discloses material events: mergers, preliminary results, CEO change, earnings guidance. Deadline: 4 business days after the event.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">EPS (Earnings Per Share)</div>\
            <div class="use-desc">Earnings per share — the most tracked metric in earnings calls. The analyst consensus (Reuters, Bloomberg) defines the "expectation" — beating consensus tends to boost the stock; missing tends to push it down.</div>\
          </div>\
        </div>\
\
        <h4>Dividends in the US vs. Brazil</h4>\
        <div class="concept-box">\
          <div class="concept-title">📌 Important differences</div>\
          <ul class="hl-list">\
            <li><strong>Lower dividend yield:</strong> the S&amp;P 500 has an average DY of ~1.5%–2% per year — much lower than IBOV (~5–7%). American companies prefer share buybacks over dividend payments.</li>\
            <li><strong>Taxation:</strong> dividends from American companies paid to foreigners are subject to <strong>30% withholding tax</strong> (or 15% with a tax treaty — Brazil has no treaty with the US). BDRs on B3 already receive the value after this deduction.</li>\
            <li><strong>Quarterly payment:</strong> unlike Brazil (semi-annual/annual), American companies typically pay dividends quarterly. American REITs often pay monthly.</li>\
            <li><strong>Dividend Aristocrats:</strong> companies that have increased dividends for 25+ consecutive years. E.g.: Coca-Cola (62 years), J&amp;J (60+ years), Procter &amp; Gamble (67+ years).</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['usa-etfs'] = '      <div class="section-title"><span class="section-icon">🗂️</span> ETFs and Funds in the US</div>\
      <div class="section-body">\
        <p>The US invented modern ETFs — the first, the <strong>SPDR S&amp;P 500 ETF (SPY)</strong>, launched in 1993. Today the American ETF market has more than US$9 trillion in assets and is the most developed in the world, with expense ratios starting at 0% per year.</p>\
\
        <h4>The Three Major Asset Managers</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">BlackRock</span> iShares</div>\
            <div class="product-desc">World&#39;s largest ETF manager (~US$3.7 tri in ETFs). Main line: iShares Core for cheap passive indexing.<br><br><strong>Main ETFs:</strong> IVV (S&amp;P 500, 0.03% p.a.), AGG (US fixed income), EEM (emerging markets), EWZ (Brazil), HYG (high yield).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Vanguard</span> The Vanguard Group</div>\
            <div class="product-desc">Founded by John Bogle (creator of passive indexing). Cooperative structure — it is "owned" by investors. Known for the lowest fees in the industry.<br><br><strong>Main ETFs:</strong> VTI (total US market, 0.03% p.a.), VOO (S&amp;P 500), VXUS (total ex-US market), BND (total US fixed income).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">State Street</span> SPDR</div>\
            <div class="product-desc">Manager of the first American ETF (SPY, 1993). Focus on sector and thematic ETFs.<br><br><strong>Main ETFs:</strong> SPY (S&amp;P 500, 0.0945% p.a. — more expensive but more liquid), GLD (physical gold), XLF/XLK/XLE (sector financials/tech/energy).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Invesco</span> PowerShares / Others</div>\
            <div class="product-desc">Specialist in thematic and factor ETFs.<br><br><strong>Main ETF:</strong> QQQ (NASDAQ-100, 0.20% p.a.) — the world&#39;s most traded ETF in certain periods, a trader favorite for extreme liquidity and big tech exposure.</div>\
          </div>\
        </div>\
\
        <h4>Essential ETFs by Category</h4>\
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:0.88em">\
          <tr style="background:var(--y);color:#000">\
            <th style="padding:8px;text-align:left;border:1px solid var(--brd2)">ETF</th>\
            <th style="padding:8px;text-align:left;border:1px solid var(--brd2)">Exposure</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--brd2)">Expense Ratio</th>\
            <th style="padding:8px;text-align:left;border:1px solid var(--brd2)">AUM</th>\
          </tr>\
          <tr><td style="padding:8px;border:1px solid var(--brd2)"><strong>SPY / IVV / VOO</strong></td><td style="padding:8px;border:1px solid var(--brd2)">S&amp;P 500 (US equities)</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.03–0.09%</td><td style="padding:8px;border:1px solid var(--brd2)">US$500–600bn each</td></tr>\
          <tr style="background:var(--bg3)"><td style="padding:8px;border:1px solid var(--brd2)"><strong>QQQ</strong></td><td style="padding:8px;border:1px solid var(--brd2)">NASDAQ-100 (big tech)</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.20%</td><td style="padding:8px;border:1px solid var(--brd2)">US$300+ bn</td></tr>\
          <tr><td style="padding:8px;border:1px solid var(--brd2)"><strong>VTI</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Total US market (~4,000 companies)</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.03%</td><td style="padding:8px;border:1px solid var(--brd2)">US$450+ bn</td></tr>\
          <tr style="background:var(--bg3)"><td style="padding:8px;border:1px solid var(--brd2)"><strong>VT</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Total global market (~9,000 companies)</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.07%</td><td style="padding:8px;border:1px solid var(--brd2)">US$45+ bn</td></tr>\
          <tr><td style="padding:8px;border:1px solid var(--brd2)"><strong>BND / AGG</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Total US fixed income</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.03–0.04%</td><td style="padding:8px;border:1px solid var(--brd2)">US$100–120bn each</td></tr>\
          <tr style="background:var(--bg3)"><td style="padding:8px;border:1px solid var(--brd2)"><strong>GLD / IAU</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Physical gold</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.25–0.40%</td><td style="padding:8px;border:1px solid var(--brd2)">US$60+ bn</td></tr>\
          <tr><td style="padding:8px;border:1px solid var(--brd2)"><strong>EEM / VWO</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Emerging market equities</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.14–0.75%</td><td style="padding:8px;border:1px solid var(--brd2)">US$60+ bn</td></tr>\
          <tr style="background:var(--bg3)"><td style="padding:8px;border:1px solid var(--brd2)"><strong>EWZ</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Brazilian equities (iShares Brazil)</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)">0.59%</td><td style="padding:8px;border:1px solid var(--brd2)">US$4–5 bn</td></tr>\
        </table>\
\
        <div class="alert-box tip" style="margin-top:20px">\
          <strong>💡 Tip for Brazilians:</strong> before opening an overseas account, check if the ETFs you want are available as BDRs on B3. Many American ETFs (IVVB11 = IVV, QQQI11 ≈ QQQ, SPXI11 ≈ SPY) have Brazilian versions that simplify taxation.\
        </div>\
      </div>\
    ';

SEC_EN['usa-como-investir'] = '      <div class="section-title"><span class="section-icon">🔑</span> How to Invest in the US as a Brazilian</div>\
      <div class="section-body">\
        <p>Brazilian investors have three main pathways to access the American market, each with distinct advantages and costs:</p>\
\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Option 1</span> BDRs on B3</div>\
            <div class="product-desc"><strong>What they are:</strong> Brazilian Depositary Receipts — receipts of foreign stocks or ETFs traded on B3 in reais.<br><br><strong>Advantages:</strong> no overseas account, no currency exchange, no declaration of foreign assets (CBE/Siscoserv), simple taxation (15% swing, 20% day trade, exemption up to R$20k/month).<br><br><strong>Disadvantages:</strong> embedded FX spread, less variety than the original market, higher management costs (BDR ETFs).<br><br><strong>Examples:</strong> AAPL34, MSFT34, AMZO34, IVVB11 (S&amp;P 500), QQQI11 (NASDAQ-100).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Option 2</span> International Brokers</div>\
            <div class="product-desc"><strong>How it works:</strong> open an account at a US-regulated broker (FINRA/SIPC). Send dollars via currency exchange. Trade American stocks and ETFs directly.<br><br><strong>Main brokers for Brazilians:</strong><br>• <strong>Interactive Brokers (IB):</strong> largest and most complete. Zero fees for American stocks. No minimum deposit (IB Lite account). Regulated in the US.<br>• <strong>Avenue Securities:</strong> broker focused on Brazilians. Interface in Portuguese. Regulated in the US and CVM.<br>• <strong>TD Ameritrade / Schwab:</strong> large American brokers open to foreigners.<br><br><strong>Protection:</strong> SIPC covers up to US$500,000 per customer in case of broker bankruptcy.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Option 3</span> Brazilian Funds and ETFs</div>\
            <div class="product-desc"><strong>How it works:</strong> investment funds in Brazil that invest abroad. The manager handles the currency exchange and management.<br><br><strong>Advantages:</strong> simplicity, private pension with international exposure, come-cotas (can be an advantage or not).<br><br><strong>Disadvantages:</strong> higher management fees (0.5%–2% p.a. vs. 0.03% for a direct American ETF). Examples: IVVB11, global equity funds from Brazilian managers.<br><br><strong>Ideal for:</strong> investors with less than US$10,000 to invest abroad or who prefer not to deal with currency exchange and CBE declaration.</div>\
          </div>\
        </div>\
\
        <h4>Sending Money Abroad</h4>\
        <div class="concept-box">\
          <div class="concept-title">📌 Rules and costs of currency exchange</div>\
          <ul class="hl-list">\
            <li><strong>IOF on remittance:</strong> 0.38% on the amount sent (reduced from 1.1% in 2023). For investment remittances, check the current rate.</li>\
            <li><strong>FX spread:</strong> difference between the official rate and the rate charged by the bank/fintech. Fintechs (Remessa Online, Wise) typically have spreads of 0.5%–1%; traditional banks may charge 2%–4%.</li>\
            <li><strong>CBE (Brazilian Capitals Abroad):</strong> mandatory to declare to the Brazilian Central Bank if holding more than US$1 million abroad (financial assets). Annual and quarterly declaration.</li>\
            <li><strong>IRPF — Assets and Rights:</strong> foreign assets must be declared in the Assets and Rights section of the annual income tax return, at acquisition cost in reais at the purchase date.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['usa-tributacao'] = '      <div class="section-title"><span class="section-icon">🧾</span> International Taxation for Brazilians</div>\
      <div class="section-body">\
        <p>Investing abroad creates tax obligations <strong>in both the US and Brazil</strong>. Understanding the rules is essential to avoid penalties and calculate the true net return.</p>\
\
        <h4>Brazilian Taxation — Capital Gains on Foreign Assets</h4>\
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:0.88em">\
          <tr style="background:var(--y);color:#000">\
            <th style="padding:8px;text-align:left;border:1px solid var(--brd2)">Gain Range</th>\
            <th style="padding:8px;text-align:center;border:1px solid var(--brd2)">Income Tax Rate</th>\
            <th style="padding:8px;text-align:left;border:1px solid var(--brd2)">Note</th>\
          </tr>\
          <tr><td style="padding:8px;border:1px solid var(--brd2)">Up to R$5,000,000</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)"><strong>15%</strong></td><td style="padding:8px;border:1px solid var(--brd2)">On gain in reais (conversion at purchase and sale date)</td></tr>\
          <tr style="background:var(--bg3)"><td style="padding:8px;border:1px solid var(--brd2)">R$5M – R$10M</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)"><strong>17.5%</strong></td><td style="padding:8px;border:1px solid var(--brd2)">Progressive capital gains table</td></tr>\
          <tr><td style="padding:8px;border:1px solid var(--brd2)">R$10M – R$30M</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)"><strong>20%</strong></td><td style="padding:8px;border:1px solid var(--brd2)"></td></tr>\
          <tr style="background:var(--bg3)"><td style="padding:8px;border:1px solid var(--brd2)">Above R$30M</td><td style="padding:8px;text-align:center;border:1px solid var(--brd2)"><strong>22.5%</strong></td><td style="padding:8px;border:1px solid var(--brd2)"></td></tr>\
        </table>\
\
        <div class="concept-box" style="margin-top:16px">\
          <div class="concept-title">⚠️ Critical points of international taxation</div>\
          <ul class="hl-list">\
            <li><strong>FX variation is taxed:</strong> if the dollar appreciates between purchase and sale, the gain in reais includes the currency gain — and is taxed. Even if the asset fell in dollars, you may have a taxable gain in reais.</li>\
            <li><strong>Withholding Tax on dividends:</strong> American companies withhold 30% income tax at source on dividends paid to non-US residents (no Brazil-US tax treaty). This credit <strong>can be offset against Brazilian income tax due</strong> — keep the receipts.</li>\
            <li><strong>Monthly DARF:</strong> unlike Brazil (where tax is withheld at source in many cases), income tax on foreign capital gains must be paid via DARF by the taxpayer in the month following the sale.</li>\
            <li><strong>US$35,000 exemption:</strong> gains up to the equivalent of US$35,000 per month in foreign disposals are exempt (Law 14.754/2023). Above that, the progressive table applies.</li>\
            <li><strong>American Estate Tax:</strong> non-residents with US assets &gt;US$60,000 may be subject to the American inheritance tax (Estate Tax). Structures via ETF domiciled in Ireland (like CSPX on LSE) avoid this exposure.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['mundo-intro'] = '      <div class="section-title"><span class="section-icon">🗺️</span> Global Markets: Overview</div>\
      <div class="section-body">\
        <p>The global financial market moves more than <strong>US$100 trillion in assets</strong>. Although the US accounts for ~40% of this total, the rest of the world offers diversification opportunities, exposure to different economic cycles, and protection against concentration in a single country.</p>\
\
        <h4>Main Financial Centers of the World</h4>\
        <div class="cards-grid">\
          <div class="info-card">\
            <div class="info-card-icon">🇺🇸</div>\
            <div class="info-card-title">United States</div>\
            <div class="info-card-body">NYSE + NASDAQ: ~US$48 tri in capitalization. Dollar as reserve currency. S&amp;P 500: global benchmark. See Module 7 for details.</div>\
          </div>\
          <div class="info-card">\
            <div class="info-card-icon">🇪🇺</div>\
            <div class="info-card-title">Europe</div>\
            <div class="info-card-body">London, Frankfurt, Paris, Amsterdam, Zurich exchanges: ~US$15 tri combined. ECB controls monetary policy for the eurozone. Focus in this module.</div>\
          </div>\
          <div class="info-card">\
            <div class="info-card-icon">🇨🇳</div>\
            <div class="info-card-title">China</div>\
            <div class="info-card-body">Shanghai + Shenzhen + Hong Kong: ~US$12–15 tri. Fixed income market: ~US$22 tri (2nd largest in the world). Growing global importance. Focus in this module.</div>\
          </div>\
          <div class="info-card">\
            <div class="info-card-icon">🇯🇵</div>\
            <div class="info-card-title">Japan</div>\
            <div class="info-card-body">Tokyo Stock Exchange (TSE): ~US$6 tri. Nikkei 225 as main index. BOJ (Bank of Japan) with a history of ultra-loose policy. 3rd largest stock exchange in the world.</div>\
          </div>\
        </div>\
\
        <h4>Global Trading Hours and Correlations</h4>\
        <div class="concept-box">\
          <div class="concept-title">🕐 Sequence of trading sessions (Brasília time, no daylight saving)</div>\
          <ul class="hl-list">\
            <li><strong>2:00am – 9:00am:</strong> Tokyo (TSE). Yen and Nikkei set the tone for the start of the day.</li>\
            <li><strong>4:00am – 10:00am:</strong> China (Shanghai/Shenzhen). Opens alongside Tokyo, closed 7am–8am (lunch break).</li>\
            <li><strong>5:00am – 10:00am:</strong> Hong Kong (HKEX). Closes at 10:30am Brasília time.</li>\
            <li><strong>5:00am – 2:00pm:</strong> Europe (Frankfurt opens at 5am, London at 6am, close at 2–3pm).</li>\
            <li><strong>10:30am – 5:00pm:</strong> US (NYSE/NASDAQ). Highest volume and volatility of the day.</li>\
            <li><strong>Key overlap:</strong> 10:30am–2:00pm — European and American markets open simultaneously, highest global volume of the day.</li>\
          </ul>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Correlations between global markets (approximate, historical data)</div>\
          <div class="cards-grid-2" style="margin-top:12px">\
            <div>\
              <ul class="hl-list">\
                <li><strong>S&amp;P 500 × DAX (Germany):</strong> ~0.75 — high correlation, especially in crises.</li>\
                <li><strong>S&amp;P 500 × IBOV:</strong> ~0.65 — moderate-high correlation.</li>\
                <li><strong>S&amp;P 500 × Nikkei:</strong> ~0.60 — moderate correlation.</li>\
              </ul>\
            </div>\
            <div>\
              <ul class="hl-list">\
                <li><strong>S&amp;P 500 × CSI 300 (China):</strong> ~0.35 — low correlation, better diversification.</li>\
                <li><strong>S&amp;P 500 × Gold:</strong> ~-0.10 to +0.10 — almost no correlation (that&#39;s why gold diversifies).</li>\
                <li><strong>IBOV × Brent Oil:</strong> ~0.55 — due to PETROBRAS and exporters.</li>\
              </ul>\
            </div>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['mundo-europa'] = '      <div class="section-title"><span class="section-icon">🏰</span> Europe: ECB, Exchanges, and Instruments</div>\
      <div class="section-body">\
        <p>Europe has mature and diversified financial markets, with characteristics distinct from the American model: greater presence of banks, a strong industrial sector, and a unified regulatory framework for the eurozone coexisting with independent national markets (notably the UK).</p>\
\
        <h4>European Central Bank (ECB)</h4>\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">🏦 Structure and Mandate</div>\
            <p>The ECB, headquartered in Frankfurt, controls monetary policy for the <strong>20 eurozone countries</strong>. Its primary mandate is <strong>price stability</strong> — inflation target of 2% per year (measured by the HICP, the European equivalent of CPI). Unlike the Fed, the ECB has a single mandate — it does not need to balance inflation with employment.</p>\
            <p style="margin-top:8px">The decision-making body is the <strong>ECB Governing Council</strong>, composed of the national central bank presidents + six Directorate members. Decisions by majority.</p>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">🔧 ECB Tools</div>\
            <ul class="hl-list">\
              <li><strong>Deposit Rate:</strong> main policy rate. Equivalent to Brazil&#39;s Selic for the European banking system.</li>\
              <li><strong>TLTRO:</strong> subsidized loans to banks conditional on credit extension.</li>\
              <li><strong>APP/PEPP (QE):</strong> asset purchase programs. PEPP was launched to combat COVID-19 (€1.85 tri).</li>\
              <li><strong>TPI (Transmission Protection Instrument):</strong> mechanism to prevent fragmentation — buys bonds from crisis-hit countries to contain spreads within the eurozone.</li>\
            </ul>\
          </div>\
        </div>\
\
        <h4>Main European Exchanges and Indices</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">🇩🇪 DAX</span> Germany — Frankfurt (XETRA)</div>\
            <div class="product-desc"><strong>40 largest German companies.</strong> Peculiarity: includes reinvested dividends in the calculation (Total Return Index) — unlike the S&amp;P 500 Price Return. Companies: SAP, Siemens, Volkswagen, BMW, Allianz, BASF, Mercedes-Benz.<br><br><strong>Characteristic:</strong> strongly industrial and export-oriented — very sensitive to global growth and, especially, the Chinese economy (which buys German machinery, cars, and chemicals).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">🇫🇷 CAC 40</span> France — Euronext Paris</div>\
            <div class="product-desc"><strong>40 largest French companies by capitalization.</strong> Companies: LVMH (largest by cap), TotalEnergies, Hermès, Sanofi, BNP Paribas, Airbus, L&#39;Oréal.<br><br><strong>Highlight:</strong> concentration in luxury and premium consumer goods. LVMH, Hermès, and Kering make the CAC 40 sensitive to Chinese luxury consumption — when China grows, the CAC tends to benefit disproportionately.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">🇬🇧 FTSE 100</span> UK — London Stock Exchange</div>\
            <div class="product-desc"><strong>100 largest companies listed in London.</strong> Outside the EU since Brexit (2020). Companies: Shell, AstraZeneca, HSBC, Unilever, BP, Rio Tinto, GSK.<br><br><strong>Unique characteristic:</strong> very internationalized — ~70% of FTSE 100 companies&#39; revenues come from outside the UK. Therefore, a weaker pound tends to <em>boost</em> the FTSE 100 in nominal terms (foreign revenues in pounds increase).</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">🌍 EURO STOXX 50</span> Pan-European</div>\
            <div class="product-desc"><strong>50 largest eurozone companies</strong> — the "European S&amp;P 500". Companies from Germany, France, Netherlands, Spain, Italy, Belgium, Finland.<br><br><strong>Derivatives:</strong> the Euro STOXX 50 future (traded on Eurex) is one of the world&#39;s most liquid derivatives. Reference ETF: EXW1 (Deutsche Börse), SX5E on Euronext.</div>\
          </div>\
        </div>\
\
        <h4>European Sovereign Bonds</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">🇩🇪 Bunds</span> German Bonds</div>\
            <div class="product-desc"><strong>Bunds</strong> (Bundesanleihe) are Europe&#39;s "risk-free" asset — the European equivalent of American Treasuries. The 10-year Bund yield is the benchmark of European fixed income. Issued by Germany, considered the safest credit in the eurozone.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">🇬🇧 Gilts</span> British Bonds</div>\
            <div class="product-desc">Issued by the British government in pound sterling. Outside the eurozone since Brexit. The Bank of England (BoE) sets British interest rates independently of the ECB. The 2022 Gilt crisis (Truss mini-budget) showed the vulnerability of sovereign debt even in developed countries.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">🇫🇷 OATs</span> French Bonds</div>\
            <div class="product-desc"><strong>Obligations Assimilables du Trésor.</strong> Second largest sovereign issuance in the eurozone after Germany. The OAT-Bund spread (yield difference) is monitored as an indicator of France&#39;s political and fiscal risk.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">🇮🇹🇪🇸 Peripherals</span> BTPs and Bonos</div>\
            <div class="product-desc"><strong>Italian BTPs and Spanish Bonos</strong> offer higher yields than Bunds due to the perception of greater fiscal risk. The BTP-Bund spread (Italy-Germany yield difference) is the main eurozone stress thermometer — when it rises above 250 bps, the ECB has historically intervened.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 European Market Particularities</div>\
          <ul class="hl-list">\
            <li><strong>Currency fragmentation eliminated (within the euro):</strong> companies from Germany and France trade in the same currency — no FX risk within the eurozone. But there is EUR/USD FX risk for the Brazilian investor.</li>\
            <li><strong>MIFID II:</strong> European regulation requiring transparency in brokerage costs and restricting certain products for retail investors. More stringent than the SEC in consumer protection.</li>\
            <li><strong>UCITS funds:</strong> European regulated investment vehicles recognized across the EU. ETFs domiciled in Ireland (e.g.: CSPX, VUSA) are UCITS — avoid the American Estate Tax and pay 15% withholding (vs. 30% for American ETFs).</li>\
            <li><strong>Higher dividends:</strong> European companies typically pay higher dividend yields than American ones (3–5% vs. 1.5–2%), with less focus on share buybacks.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['mundo-china'] = '      <div class="section-title"><span class="section-icon">🐉</span> China: Markets, Regulation, and Opportunities</div>\
      <div class="section-body">\
        <p>China has the <strong>2nd largest fixed income market in the world</strong> and the <strong>2nd largest equity market</strong> by capitalization (depending on methodology). However, it is also the most <strong>regulated, opaque, and politically sensitive</strong> among major economies. Understanding China is indispensable — it profoundly impacts commodities, emerging markets, and global supply chains.</p>\
\
        <h4>Structure of Chinese Equity Markets</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">A Shares</span> Shanghai + Shenzhen (CNY)</div>\
            <div class="product-desc">Traded on the <strong>Shanghai (SSE)</strong> and <strong>Shenzhen (SZSE)</strong> exchanges in renminbi (CNY). Historically restricted to Chinese or qualified foreign investors (QFII/RQFII). With the <strong>Stock Connect</strong> program (2014–2016), Hong Kong investors (and indirectly, global investors via HK) can access selected A shares.<br><br>Main index: <strong>CSI 300</strong> (300 largest A shares from both exchanges). The Chinese onshore equivalent of the S&amp;P 500.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">H Shares</span> Hong Kong (HKD)</div>\
            <div class="product-desc">Chinese companies listed on the <strong>Hong Kong Stock Exchange (HKEX)</strong> in Hong Kong dollars. More accessible to foreign investors and with a regulatory framework closer to international standards.<br><br>Main index: <strong>Hang Seng Index (HSI)</strong> — 80 largest companies listed in Hong Kong, including Chinese companies (H-shares) and Hong Kong companies.<br><br>Notable companies: Alibaba (HK listing), Tencent, Meituan, HSBC.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">ADRs / ADS</span> Listed in the US</div>\
            <div class="product-desc">Many large Chinese companies have ADRs (American Depositary Receipts) listed on NYSE or NASDAQ. Allow direct dollar investment without a Hong Kong account.<br><br>Examples: <strong>Alibaba (BABA)</strong>, <strong>JD.com (JD)</strong>, <strong>Baidu (BIDU)</strong>, <strong>PDD Holdings (PDD — Pinduoduo/Temu)</strong>.<br><br><strong>Delisting risk:</strong> US-China tensions generated threats to remove ADRs from American exchanges (HFCAA). Several companies created secondary listings in Hong Kong as a contingency.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">ChiNext / STAR</span> Innovation Markets</div>\
            <div class="product-desc"><strong>ChiNext</strong> (Shenzhen): focus on growth and innovation companies. Created in 2009, similar to the American NASDAQ. Lower profitability requirements for listing.<br><br><strong>STAR Market</strong> (Shanghai, 2019): created to attract cutting-edge technology companies with standards closer to NASDAQ. Allows IPOs of companies not yet profitable. Includes semiconductor, biotech, and AI companies.</div>\
          </div>\
        </div>\
\
        <h4>People&#39;s Bank of China (PBOC) and Monetary Policy</h4>\
        <div class="concept-box">\
          <div class="concept-title">🏦 How Chinese monetary policy works</div>\
          <ul class="hl-list">\
            <li><strong>LPR (Loan Prime Rate):</strong> reference rate for bank loans in China. Functional equivalent of the Selic. Set monthly by the PBOC based on rates from 18 reference banks. There are two LPRs: 1 year (general credit) and 5 years (mortgages).</li>\
            <li><strong>RRR (Reserve Requirement Ratio):</strong> bank reserve requirement. The PBOC uses RRR cuts to inject liquidity into the economy — a policy tool that the American Fed abandoned as an active tool decades ago.</li>\
            <li><strong>MLF (Medium-term Lending Facility):</strong> 1-year PBOC loans to banks, used to control medium-term liquidity conditions.</li>\
            <li><strong>Currency control:</strong> the yuan is not fully convertible. The PBOC daily sets a "midpoint" and allows ±2% variation from it. The CNH (offshore yuan, traded in Hong Kong) is freer than the onshore CNY.</li>\
          </ul>\
        </div>\
\
        <h4>Opportunities and Risks of the Chinese Market</h4>\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">✅ Opportunities</div>\
            <ul class="hl-list">\
              <li><strong>Discounted valuation:</strong> Chinese stocks historically trade at P/E much lower than American equivalents. The CSI 300 has traded at 10–12× P/E when the S&amp;P 500 was at 20–25×.</li>\
              <li><strong>Structural growth:</strong> growing middle class, urbanization, leadership in EVs (BYD, CATL), solar energy, and semiconductors.</li>\
              <li><strong>Low correlation:</strong> the Chinese economic cycle often diverges from the American one — good portfolio diversification.</li>\
              <li><strong>Fixed income:</strong> Chinese government bonds offered positive real yield when American and European equivalents were negative (2020–2021).</li>\
            </ul>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">⚠️ China-Specific Risks</div>\
            <ul class="hl-list">\
              <li><strong>Regulatory risk:</strong> the government can change rules abruptly. E.g.: 2021 crackdown that wiped 70–90% of the value of tutoring education companies (New Oriental), tech (Alibaba, Didi), and gaming companies overnight.</li>\
              <li><strong>Geopolitical risk:</strong> tensions over Taiwan, potential US sanctions, ADR delisting, semiconductor restrictions.</li>\
              <li><strong>Data opacity:</strong> less transparency than Western markets. GDP, growth, and state-owned company result data should be analyzed with skepticism.</li>\
              <li><strong>Real estate crisis:</strong> the real estate sector represented ~25–30% of Chinese GDP. The collapse of Evergrande (2021+) and other developers created systemic risks still being resolved.</li>\
            </ul>\
          </div>\
        </div>\
\
        <h4>How to Access the Chinese Market</h4>\
        <div class="cards-grid">\
          <div class="use-item">\
            <div class="use-label">China ETFs via B3 / BDRs</div>\
            <div class="use-desc">Simplest way for Brazilians: Chinese stock ETFs traded on B3. E.g.: KEUA11 (general emerging market, includes China). Also available via American ETFs: MCHI (iShares MSCI China), KWEB (KraneShares — focused on Chinese internet).</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">ADRs of Chinese companies (US)</div>\
            <div class="use-desc">Via account at American broker (IB, Avenue): BABA, JD, BIDU, PDD, NIO. High liquidity, traded in dollars, delisting risk. Always check if there is a secondary listing in Hong Kong.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Hong Kong via Stock Connect</div>\
            <div class="use-desc">For sophisticated investors with access to Hong Kong brokers: direct access to H shares and, via Southbound Connect, some A shares. Greater variety, lower liquidity for non-residents.</div>\
          </div>\
          <div class="use-item">\
            <div class="use-label">Funds from Brazilian managers</div>\
            <div class="use-desc">Emerging market equity funds from Brazilian managers like Vinland, Ibiuna, Apex, etc. Frequently have China exposure as part of a diversified emerging portfolio.</div>\
          </div>\
        </div>\
      </div>\
    ';

SEC_EN['mundo-outros'] = '      <div class="section-title"><span class="section-icon">🌏</span> Other Relevant Markets</div>\
      <div class="section-body">\
        <p>Beyond the US, Europe, and China, other markets offer opportunities and deserve attention from the global investor — especially Japan, India, and other emerging markets with their own dynamics.</p>\
\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">🇯🇵 Japan</span> Tokyo Stock Exchange (TSE)</div>\
            <div class="product-desc"><strong>3rd largest stock exchange in the world</strong> by capitalization (~US$6 tri). Main index: <strong>Nikkei 225</strong> (price-weighted, like the DJIA) and <strong>TOPIX</strong> (cap-weighted — more representative).<br><br><strong>Unique characteristics:</strong><br>• BOJ (Bank of Japan) maintained a Yield Curve Control (YCC) policy for years — buying bonds to keep the 10-year rate near zero. Abandoned in 2024.<br>• Yen "carry trade": investors borrowed in cheap yen to buy higher-yield assets. When the BOJ signals rate hikes, the carry trade unwinds — causing global volatility (August 2024).<br>• Corporate governance reforms (2023+): TSE pushing companies to raise ROE and reduce cross-shareholdings — potential value unlock.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">🇮🇳 India</span> NSE / BSE</div>\
            <div class="product-desc"><strong>Fastest-growing economy among large countries.</strong> Two main markets: <strong>NSE (National Stock Exchange)</strong> and <strong>BSE (Bombay Stock Exchange)</strong>. Indices: <strong>NIFTY 50</strong> (NSE) and <strong>SENSEX</strong> (BSE).<br><br><strong>Advantages:</strong> favorable demographics (world&#39;s largest young population), accelerated digitalization, GDP growth of 6–7% p.a., regulated and transparent financial system (SEBI).<br><br><strong>Challenges:</strong> expensive exchange (historically high P/E), volatile currency (rupee), complex direct access for foreigners. Access via ETFs: INDA (iShares MSCI India).<br><br><strong>Notable cases:</strong> Reliance Industries, Tata Group, Infosys, HDFC Bank.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">🌍 Other Emerging Markets</span> LATAM, Africa, Southeast Asia</div>\
            <div class="product-desc"><strong>Mexico (BMV, IPC):</strong> beneficiary of nearshoring — companies relocating production from China closer to the US. Relatively stable peso. Companies: América Móvil, Femsa, Grupo México.<br><br><strong>South Korea (KOSPI):</strong> advanced technology (Samsung, SK Hynix — memory and semiconductor leaders). Strategic relationship with the US in the chip supply chain.<br><br><strong>Taiwan (TWSE):</strong> TSMC dominates advanced chip manufacturing worldwide. Geopolitical risk (China-Taiwan tensions) is the main risk factor.<br><br><strong>Southeast Asia:</strong> Vietnam, Indonesia, Thailand — emerging markets with robust industrial growth, beneficiaries of post-COVID supply chain diversification.</div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">🥇 Commodities</span> Raw Materials Markets</div>\
            <div class="product-desc">Global markets traded mainly on American exchanges in dollars:<br><br><strong>CME (Chicago Mercantile Exchange):</strong> wheat, corn, soybean, cattle, WTI crude oil, natural gas futures.<br><strong>ICE (Intercontinental Exchange):</strong> Brent crude, coffee, sugar, cocoa, cotton.<br><strong>COMEX:</strong> gold, silver, copper.<br><strong>LME (London Metal Exchange):</strong> copper, aluminum, zinc, nickel.<br><br><strong>Relevance for Brazil:</strong> soybeans, iron ore, and oil represent a significant portion of Brazilian exports — their global prices directly affect the exchange rate and the performance of VALE3, PETROBRAS, and agricultural exporters.</div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 MSCI and FTSE Russell: the indices that move global capital</div>\
          <ul class="hl-list">\
            <li><strong>MSCI World:</strong> ~1,500 companies from 23 developed countries (~67% US). Base for trillions of dollars in global passive funds.</li>\
            <li><strong>MSCI All Country World (ACWI):</strong> World + 24 emerging markets. ~2,900 companies. Reference ETF: ACWI (iShares).</li>\
            <li><strong>MSCI Emerging Markets (EM):</strong> ~1,400 companies from 24 emerging markets. China (~25–30%), India (~18%), Taiwan (~16%), South Korea (~12%), Brazil (~5%). ETFs: EEM, VWO.</li>\
            <li><strong>MSCI Inclusion/Exclusion:</strong> when a country is included or has its weight increased in MSCI indices, billions of dollars in passive funds need to buy that country&#39;s stocks — creating artificial short-term buying pressure.</li>\
          </ul>\
        </div>\
      </div>\
    ';

SEC_EN['mundo-diversificacao'] = '      <div class="section-title"><span class="section-icon">🌐</span> Global Diversification in Practice</div>\
      <div class="section-body">\
        <p>Understanding global markets is one thing; building a truly global portfolio is another. This practical guide shows how Brazilian investors can add international exposure efficiently and appropriately for their wealth level.</p>\
\
        <h4>Why Diversify Geographically?</h4>\
        <div class="cards-grid-2">\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">✅ Benefits of global diversification</div>\
            <ul class="hl-list">\
              <li><strong>Currency protection:</strong> assets in dollars, euros, or yen protect against real currency depreciation.</li>\
              <li><strong>Access to sectors non-existent in Brazil:</strong> semiconductors (TSMC, NVIDIA), luxury (LVMH), innovative pharma (Pfizer, Novo Nordisk), global software.</li>\
              <li><strong>Political risk reduction:</strong> Brazil has high regulatory and political risk — diversifying into more stable countries reduces this risk.</li>\
              <li><strong>Different economic cycles:</strong> when Brazil is in recession, the US or India may be growing.</li>\
            </ul>\
          </div>\
          <div class="concept-box" style="margin:0">\
            <div class="concept-title">⚠️ Costs and risks of global diversification</div>\
            <ul class="hl-list">\
              <li><strong>Two-way FX risk:</strong> real appreciation negatively impacts returns from foreign assets (in reais).</li>\
              <li><strong>Tax complexity:</strong> taxes in both countries, withholding tax, monthly DARF, CBE declaration.</li>\
              <li><strong>Lower familiarity:</strong> analyzing an American or European company requires understanding another country&#39;s accounting and regulation.</li>\
              <li><strong>Correlation in crises:</strong> in systemic events (2008, 2020), correlations rise — geographic diversification does not work exactly when most needed.</li>\
            </ul>\
          </div>\
        </div>\
\
        <h4>Global Portfolios by Profile</h4>\
        <div class="cards-grid">\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rf">Conservative</span> Focus on currency preservation</div>\
            <div class="product-desc">\
              <ul class="hl-list">\
                <li>70% Brazilian Fixed Income (IPCA+ Treasury + CDB)</li>\
                <li>15% ETF BDRs: IVVB11 (S&amp;P 500) + SPXI11</li>\
                <li>10% RendA+ Treasury or global pension funds</li>\
                <li>5% Gold (via ETF: GOLD11 or BDR)</li>\
              </ul>\
              <p style="margin-top:8px"><strong>Objective:</strong> purchasing power preservation with basic currency hedge.</p>\
            </div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag rv">Moderate</span> Structural diversification</div>\
            <div class="product-desc">\
              <ul class="hl-list">\
                <li>35% Brazilian Fixed Income</li>\
                <li>25% Brazilian Equities (IBOV — blue chips + dividends)</li>\
                <li>25% International: 15% S&amp;P 500 + 5% Europe (IWDA/EXW1) + 5% Emerging (EEM)</li>\
                <li>10% REITs (FIIs)</li>\
                <li>5% Gold</li>\
              </ul>\
              <p style="margin-top:8px"><strong>Access:</strong> via BDRs on B3 or overseas account (IB / Avenue).</p>\
            </div>\
          </div>\
          <div class="product-card">\
            <div class="product-header"><span class="product-tag der">Aggressive</span> Real global portfolio</div>\
            <div class="product-desc">\
              <ul class="hl-list">\
                <li>15% Brazilian Fixed Income (reserve + long IPCA+)</li>\
                <li>20% Selected Brazilian Equities</li>\
                <li>30% US: 20% S&amp;P 500 (IVV) + 10% NASDAQ (QQQ)</li>\
                <li>15% Europe: DAX ETF + EURO STOXX ETF</li>\
                <li>10% China/Emerging: MCHI + VWO</li>\
                <li>5% Japan (EWJ) + India (INDA)</li>\
                <li>5% Gold + commodities</li>\
              </ul>\
            </div>\
          </div>\
        </div>\
\
        <div class="concept-box">\
          <div class="concept-title">📌 Practical rules for the global portfolio</div>\
          <ul class="hl-list">\
            <li><strong>Start with ETFs, not individual stocks:</strong> selecting stocks from a market you know little about is dangerous. An S&amp;P 500 or MSCI World ETF gives you instant global diversification.</li>\
            <li><strong>Define the % dollarization as a long-term target:</strong> do not react to the day&#39;s exchange rate. If the target is 30% in dollars, maintain it regardless of whether the rate is R$4.80 or R$6.20.</li>\
            <li><strong>Regular contributions in hard currency:</strong> converting a fixed portion of monthly income to dollars (currency DCA) eliminates FX timing risk.</li>\
            <li><strong>Don&#39;t neglect Brazil:</strong> IBOV in dollars has beaten the S&amp;P 500 in certain decades (2000s). The global asset does not always outperform the local one — diversify, but do not abandon the domestic market.</li>\
            <li><strong>Review FX exposure annually:</strong> with wealth growth and currency variation, the international % may drift from the target. Rebalance annually.</li>\
          </ul>\
        </div>\
\
        <div class="cta-box" style="margin-top:32px">\
          <div class="cta-title">You have completed the Global Financial Markets Course</div>\
          <div class="cta-sub">From the Brazilian market to the American, European, Chinese, and beyond — you now have the complete map of the world financial system to invest with intelligence and true diversification.</div>\
          <a href="../index.html" class="cta-btn">Explore the Slope platform</a>\
        </div>\
      </div>\
    ';
