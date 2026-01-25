import React, { useState } from 'react';
import StockSearch from './components/StockSearch';
import PortfolioList from './components/PortfolioList';
import OptimizationDashboard from './components/OptimizationDashboard';

function App() {
  const [portfolio, setPortfolio] = useState([]);

  const handleAddStock = (ticker) => {
    if (portfolio.find(s => s.ticker === ticker)) return; // Prevent duplicates
    // Add with default weight, e.g., 0 or distribute evenly? 
    // Let's add with 0 initially to force user to set it, or simple logic.
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

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            Portfolio Optimizer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Build and analyze your optimal efficient portfolio
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
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
              <OptimizationDashboard portfolio={portfolio} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
