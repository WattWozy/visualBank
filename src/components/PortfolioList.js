import React from 'react';

const PortfolioList = ({ portfolio, onUpdateWeight, onRemove }) => {
    const totalWeight = portfolio.reduce((sum, stock) => sum + (parseFloat(stock.weight) || 0), 0);

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="title" style={{ margin: 0, fontSize: '1.5rem' }}>Your Portfolio</h2>
                <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius)',
                    backgroundColor: totalWeight > 100 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: totalWeight > 100 ? 'var(--danger)' : 'var(--success)',
                    fontWeight: 'bold'
                }}>
                    Total Allocation: {totalWeight.toFixed(2)}%
                </div>
            </div>

            {portfolio.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                    No stocks added yet. Use the search bar to build your portfolio.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {portfolio.map((stock) => (
                        <div key={stock.ticker} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                    {stock.ticker}
                                </div>
                                {/* We might not have the name if just searching, but we'll try to pass it down */}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Weight (%)</span>
                                    <input
                                        type="number"
                                        value={stock.weight}
                                        onChange={(e) => onUpdateWeight(stock.ticker, e.target.value)}
                                        className="input"
                                        style={{ width: '80px', padding: '0.5rem', textAlign: 'right' }}
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                <button
                                    onClick={() => onRemove(stock.ticker)}
                                    style={{
                                        color: 'var(--danger)',
                                        padding: '0.5rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="Remove"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortfolioList;
