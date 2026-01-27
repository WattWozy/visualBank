import React, { useState, useEffect } from 'react';
import StockSearch from './components/StockSearch';
import PortfolioList from './components/PortfolioList';
import PortfolioSelector from './components/PortfolioSelector';
import OptimizationDashboard from './components/OptimizationDashboard';
import { getHistoricalData } from './services/polygon';
import { calculateReturns, mean, stdDev } from './domain/financial_math';
import { calculatePortfolioPerformance, buildCovarianceMatrix, buildCorrelationMatrix } from './domain/portfolio_optimizer';
import { calculateRiskMetrics } from './domain/risk_metrics';
import GoalPlanning from './components/GoalPlanning';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [riskBudget, setRiskBudget] = useState(15); // Default 15% annual vol
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    targetStats: null,
    chartData: [],
    rebalanceInfo: null,
    riskBudgetStatus: null,
    loading: false,
    error: null
  });

  const handleAddStock = (ticker) => {
    if (portfolio.find(s => s.ticker === ticker)) return;
    setPortfolio([...portfolio, { ticker, currentWeight: 0, targetWeight: 0 }]);
  };

  const handleRemoveStock = (ticker) => {
    setPortfolio(portfolio.filter(s => s.ticker !== ticker));
  };

  const handleUpdateWeight = (ticker, type, weight) => {
    setPortfolio(portfolio.map(s =>
      s.ticker === ticker ? { ...s, [type]: weight } : s
    ));
  };

  const handleLoadPortfolio = (newPortfolio) => {
    // Adapter if loaded portfolio has old structure
    const adapted = newPortfolio.map(p => ({
      ...p,
      currentWeight: p.currentWeight ?? p.weight ?? 0,
      targetWeight: p.targetWeight ?? p.weight ?? 0
    }));
    setPortfolio(adapted);
  };

  // Main Orchestration Effect
  useEffect(() => {
    const runAnalysis = async () => {
      if (portfolio.length === 0) {
        setDashboardData({ stats: null, targetStats: null, chartData: [], loading: false, error: null });
        return;
      }

      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        const fromDate = startDate.toISOString().split('T')[0];

        const assets = [];
        for (let i = 0; i < portfolio.length; i++) {
          const stock = portfolio[i];
          if (i > 0) await delay(13000);

          const data = await getHistoricalData(stock.ticker, fromDate, endDate);
          if (data.prices && data.prices.length > 0) {
            const returns = calculateReturns(data.prices);
            assets.push({
              ticker: stock.ticker,
              returns,
              meanReturn: mean(returns),
              stdDev: stdDev(returns)
            });
          }
        }

        if (assets.length === 0) {
          setDashboardData(prev => ({ ...prev, loading: false, error: "No data available." }));
          return;
        }

        const minLen = Math.min(...assets.map(a => a.returns.length));
        assets.forEach(a => {
          a.returns = a.returns.slice(a.returns.length - minLen);
        });

        const covMatrix = buildCovarianceMatrix(assets);
        const corrMatrix = buildCorrelationMatrix(assets);

        // Helper to calculate performance for a given weight set
        const getPerformance = (weightKey) => {
          const weights = assets.map(a => {
            const p = portfolio.find(p => p.ticker === a.ticker);
            return p ? parseFloat(p[weightKey]) / 100 : 0;
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          const normWeights = totalWeight > 0 ? weights.map(w => w / totalWeight) : weights;
          const perf = calculatePortfolioPerformance(assets, normWeights, covMatrix);

          const annReturn = perf.expectedReturn * 252;
          const annVol = perf.risk * Math.sqrt(252);
          const sharpe = annVol === 0 ? 0 : annReturn / annVol;

          // Calculate Portfolio Returns series
          const pReturns = [];
          for (let t = 0; t < minLen; t++) {
            let dailySum = 0;
            for (let i = 0; i < assets.length; i++) {
              dailySum += assets[i].returns[t] * normWeights[i];
            }
            pReturns.push(dailySum);
          }

          return {
            expectedReturn: (annReturn * 100).toFixed(2),
            risk: (annVol * 100).toFixed(2),
            sharpe: sharpe.toFixed(2),
            pReturns // Raw series
          };
        };

        const currentPerf = getPerformance('currentWeight');
        const targetPerf = getPerformance('targetWeight');

        // Risk Budget Check
        const riskVal = parseFloat(currentPerf.risk);
        const budgetExceeded = riskVal > riskBudget;
        const budgetPercent = budgetExceeded ? ((riskVal - riskBudget) / riskBudget) * 100 : 0;

        // Rebalance Info
        const drift = portfolio.map(p => ({
          ticker: p.ticker,
          current: parseFloat(p.currentWeight) || 0,
          target: parseFloat(p.targetWeight) || 0,
          drift: (parseFloat(p.currentWeight) || 0) - (parseFloat(p.targetWeight) || 0)
        }));

        setDashboardData({
          loading: false,
          error: null,
          stats: currentPerf,
          targetStats: targetPerf,
          chartData: [
            { x: currentPerf.risk, y: currentPerf.expectedReturn, name: 'Current', isCurrent: true },
            { x: targetPerf.risk, y: targetPerf.expectedReturn, name: 'Target', isTarget: true }
          ],
          correlationMatrix: { tickers: assets.map(a => a.ticker), matrix: corrMatrix },
          riskMetrics: calculateRiskMetrics(currentPerf.pReturns),
          rebalanceInfo: { drift },
          riskBudgetStatus: { exceeded: budgetExceeded, percent: budgetPercent.toFixed(1), budget: riskBudget }
        });

      } catch (err) {
        console.error(err);
        setDashboardData(prev => ({ ...prev, loading: false, error: "Analysis failed." }));
      }
    };

    const timeoutId = setTimeout(() => {
      if (portfolio.length > 0 && portfolio.some(p => p.currentWeight > 0 || p.targetWeight > 0)) {
        runAnalysis();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [portfolio, riskBudget]);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VisualBank
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', letterSpacing: '1px' }}>
            INTELLIGENT REBALANCING & RISK ENGINE
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <PortfolioSelector onLoadPortfolio={handleLoadPortfolio} />
          <StockSearch onAdd={handleAddStock} />

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem' }}>
            <span className="stat-label" style={{ margin: 0 }}>Risk Budget (Volatility %)</span>
            <input
              type="number"
              value={riskBudget}
              onChange={(e) => setRiskBudget(parseFloat(e.target.value) || 0)}
              className="input"
              style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: portfolio.length > 0 ? 'repeat(auto-fit, minmax(500px, 1fr))' : '1fr',
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
                targetStats={dashboardData.targetStats}
                chartData={dashboardData.chartData}
                correlationMatrix={dashboardData.correlationMatrix}
                riskMetrics={dashboardData.riskMetrics}
                rebalanceInfo={dashboardData.rebalanceInfo}
                riskBudgetStatus={dashboardData.riskBudgetStatus}
                loading={dashboardData.loading}
                error={dashboardData.error}
              />
            </div>
          )}
        </div>

        {/* Wealth Goals Section */}
        {portfolio.length > 0 && dashboardData.stats && (
          <div style={{ marginTop: '2rem' }}>
            <GoalPlanning currentPortfolioStats={dashboardData.stats} />
          </div>
        )}
      </div>
    </div>
  );
}


export default App;
