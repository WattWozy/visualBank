import React from 'react';

const PortfolioList = ({ portfolio, onUpdateWeight, onRemove }) => {
    const totalCurrent = portfolio.reduce((sum, stock) => sum + (parseFloat(stock.currentWeight) || 0), 0);
    const totalTarget = portfolio.reduce((sum, stock) => sum + (parseFloat(stock.targetWeight) || 0), 0);

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="title" style={{ margin: 0, fontSize: '1.5rem' }}>Holdings & Targets</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        backgroundColor: totalCurrent > 100 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: totalCurrent > 100 ? 'var(--danger)' : 'var(--success)',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                    }}>
                        CUR: {totalCurrent.toFixed(1)}%
                    </div>
                    <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        backgroundColor: totalTarget > 100 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: totalTarget > 100 ? 'var(--danger)' : 'var(--success)',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                    }}>
                        TGT: {totalTarget.toFixed(1)}%
                    </div>
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
                            padding: '1.2rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                                    {stock.ticker}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current %</span>
                                    <input
                                        type="number"
                                        value={stock.currentWeight}
                                        onChange={(e) => onUpdateWeight(stock.ticker, 'currentWeight', e.target.value)}
                                        className="input"
                                        style={{ width: '70px', padding: '0.4rem', textAlign: 'right', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                    <span style={{ color: 'var(--accent)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Target %</span>
                                    <input
                                        type="number"
                                        value={stock.targetWeight}
                                        onChange={(e) => onUpdateWeight(stock.ticker, 'targetWeight', e.target.value)}
                                        className="input"
                                        style={{ width: '70px', padding: '0.4rem', textAlign: 'right', fontSize: '0.9rem', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                                    />
                                </div>

                                <button
                                    onClick={() => onRemove(stock.ticker)}
                                    style={{
                                        color: 'rgba(239, 68, 68, 0.5)',
                                        padding: '0.5rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                        e.currentTarget.style.color = 'var(--danger)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'rgba(239, 68, 68, 0.5)';
                                    }}
                                    title="Remove"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
