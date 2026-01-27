import React, { useState, useEffect } from 'react';
import StockSearch from './components/StockSearch';
import PortfolioList from './components/PortfolioList';
import PortfolioSelector from './components/PortfolioSelector';
import OptimizationDashboard from './components/OptimizationDashboard';
import { getHistoricalData } from './services/polygon';
import { calculateReturns, mean, stdDev, calculateSortinoRatio, calculateVaR } from './domain/financial_math';
import { calculatePortfolioPerformance, buildCovarianceMatrix, generateRandomPortfolios, buildCorrelationMatrix } from './domain/portfolio_optimizer';
import { calculateRiskMetrics } from './domain/risk_metrics';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [dashboardData, setDashboardData] = useState({ stats: null, chartData: [], loading: false, error: null });

  const handleAddStock = (ticker) => {
    if (portfolio.find(s => s.ticker === ticker)) return;
    setPortfolio([...portfolio, { ticker, weight: 0 }]);
  };

  const handleRemoveStock = (ticker) => {
    setPortfolio(portfolio.filter(s => s.ticker !== ticker));
  };

  const handleUpdateWeight = (ticker, weight) => {
    setPortfolio(portfolio.map(s =>
      s.ticker === ticker ? { ...s, weight: weight } : s
    ));
  };

  const handleLoadPortfolio = (newPortfolio) => {
    setPortfolio(newPortfolio);
  };

  // Main Orchestration Effect
  useEffect(() => {
    const runAnalysis = async () => {
      if (portfolio.length === 0) {
        setDashboardData({ stats: null, chartData: [], loading: false, error: null });
        return;
      }

      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Delay helper
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        // 1. Fetch Data
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // 3 months history
        const fromDate = startDate.toISOString().split('T')[0];

        const assets = [];
        const fetchedTickers = [];

        for (let i = 0; i < portfolio.length; i++) {
          const stock = portfolio[i];
          if (i > 0) await delay(13000); // Rate limit for free tier

          const data = await getHistoricalData(stock.ticker, fromDate, endDate);
          if (data.prices && data.prices.length > 0) {
            // 2. Process Data via Domain Layer
            const returns = calculateReturns(data.prices);
            const meanRet = mean(returns);
            const std = stdDev(returns);

            assets.push({
              ticker: stock.ticker,
              returns, // Daily returns
              meanReturn: meanRet,
              stdDev: std
            });
            fetchedTickers.push(stock.ticker);
          } else {
            console.warn(`No data for ${stock.ticker}`);
          }
        }

        if (assets.length === 0) {
          setDashboardData(prev => ({ ...prev, loading: false, error: "No data available." }));
          return;
        }

        // 3. Align Data (Simplified: assume same length/dates for MVP)
        // Truncate to shortest length to ensure alignment
        const minLen = Math.min(...assets.map(a => a.returns.length));
        assets.forEach(a => {
          a.returns = a.returns.slice(a.returns.length - minLen);
        });

        // 4. Calculate Portfolio Stats
        const covMatrix = buildCovarianceMatrix(assets);
        const corrMatrix = buildCorrelationMatrix(assets); // NEW

        // Efficient Frontier / Monte Carlo
        const simPortfolios = generateRandomPortfolios(assets, 500);
        const simChartData = simPortfolios.map(p => ({
          x: p.risk * Math.sqrt(252) * 100,
          y: p.expectedReturn * 252 * 100,
          name: 'Simulation'
        }));

        // Filter weights for assets we actually have data for
        const weights = assets.map(a => {
          const p = portfolio.find(p => p.ticker === a.ticker);
          return p ? parseFloat(p.weight) / 100 : 0;
        });

        // Normalize weights if not summing to 1 (just to be safe for calculation)
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const normWeights = totalWeight > 0 ? weights.map(w => w / totalWeight) : weights;

        const perf = calculatePortfolioPerformance(assets, normWeights, covMatrix);

        // Annualize (approximate)
        const annReturn = perf.expectedReturn * 252;
        const annVol = perf.risk * Math.sqrt(252);
        const sharpe = annVol === 0 ? 0 : annReturn / annVol;

        // Current Portfolio Point
        const currentChartPoint = {
          x: annVol * 100,
          y: annReturn * 100,
          name: 'Current Portfolio',
          isCurrent: true
        };

        const finalChartData = [...simChartData, currentChartPoint];

        // Calculate Portfolio Series for Sortino/VaR
        const portfolioReturns = [];
        for (let t = 0; t < minLen; t++) {
          let dailySum = 0;
          for (let i = 0; i < assets.length; i++) {
            dailySum += assets[i].returns[t] * normWeights[i];
          }
          portfolioReturns.push(dailySum);
        }

        const dailySortino = calculateSortinoRatio(portfolioReturns, 0);
        const annSortino = dailySortino * Math.sqrt(252);

        const var95 = calculateVaR(portfolioReturns, 0.95); // Daily VaR

        // Calculate Risk Metrics
        const riskMetrics = calculateRiskMetrics(portfolioReturns);

        setDashboardData({
          loading: false,
          error: null,
          stats: {
            expectedReturn: (annReturn * 100).toFixed(2),
            risk: (annVol * 100).toFixed(2),
            sharpe: sharpe.toFixed(2),
            sortino: annSortino.toFixed(2),
            var: (var95 * 100).toFixed(2)
          },
          chartData: finalChartData,
          correlationMatrix: {
            tickers: assets.map(a => a.ticker),
            matrix: corrMatrix
          },
          riskMetrics: riskMetrics
        });

      } catch (err) {
        console.error(err);
        setDashboardData(prev => ({ ...prev, loading: false, error: "Analysis failed." }));
      }
    };

    // Debounce analysis triggering or just run when portfolio changes (with check)
    // To prevent rapid firing while typing weight, maybe waiting for a button click is better?
    // For now, adhering to user's "website where you can perform..." - auto-update is nice but dangerous with rate limits.
    // I'll add a check that weights > 0.

    // We'll use a timeout debounce
    const timeoutId = setTimeout(() => {
      if (portfolio.length > 0 && portfolio.some(p => p.weight > 0)) {
        runAnalysis();
      } else {
        setDashboardData({ stats: null, chartData: [], loading: false, error: null });
      }
    }, 2000); // 2s debounce

    return () => clearTimeout(timeoutId);

  }, [portfolio]);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            VisualBank
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Pure & Functional Portfolio Analytics
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <PortfolioSelector onLoadPortfolio={handleLoadPortfolio} />
          <StockSearch onAdd={handleAddStock} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: portfolio.length > 0 ? 'repeat(auto-fit, minmax(450px, 1fr))' : '1fr',
          gap: '2rem',
          alignItems: 'start'
        }}>
          <div>
            <PortfolioList
              portfolio={portfolio}
              onUpdateWeight={handleUpdateWeight}
              onRemove={handleRemoveStock}
            />
          </div>

          {portfolio.length > 0 && (
            <div>
              <OptimizationDashboard
                stats={dashboardData.stats}
                chartData={dashboardData.chartData}
                correlationMatrix={dashboardData.correlationMatrix}
                riskMetrics={dashboardData.riskMetrics}
                loading={dashboardData.loading}
                error={dashboardData.error}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
