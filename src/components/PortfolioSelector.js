import React, { useState, useEffect } from 'react';
import { fetchBanks } from '../services/portfolioLoader';

const PortfolioSelector = ({ onLoadPortfolio }) => {
    const [banks, setBanks] = useState([]);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchBanks();
                setBanks(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load bank portfolios.");
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleBankChange = (e) => {
        setSelectedBankId(e.target.value);
        setSelectedPortfolioId(''); // Reset portfolio when bank changes
    };

    const handleLoad = () => {
        const bank = banks.find(b => b.id === selectedBankId);
        if (bank) {
            const portfolio = bank.portfolios.find(p => p.id === selectedPortfolioId);
            if (portfolio) {
                onLoadPortfolio(portfolio.assets);
            }
        }
    };

    const selectedBank = banks.find(b => b.id === selectedBankId);

    if (loading) return <div>Loading available portfolios...</div>;
    if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

    return (
        <div style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Import Bank Portfolio</h3>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Bank</label>
                    <select
                        value={selectedBankId}
                        onChange={handleBankChange}
                        className="input"
                        style={{ padding: '0.5rem', minWidth: '200px' }}
                    >
                        <option value="">-- Choose a Bank --</option>
                        {banks.map(bank => (
                            <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Portfolio</label>
                    <select
                        value={selectedPortfolioId}
                        onChange={(e) => setSelectedPortfolioId(e.target.value)}
                        className="input"
                        style={{ padding: '0.5rem', minWidth: '200px' }}
                        disabled={!selectedBankId}
                    >
                        <option value="">-- Choose a Portfolio --</option>
                        {selectedBank?.portfolios.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleLoad}
                    disabled={!selectedPortfolioId}
                    className="button"
                    style={{
                        height: '38px', // Visual alignment
                        opacity: !selectedPortfolioId ? 0.5 : 1,
                        cursor: !selectedPortfolioId ? 'not-allowed' : 'pointer'
                    }}
                >
                    Load Portfolio
                </button>
            </div>

            {/* description preview */}
            {selectedBank && selectedPortfolioId && (
                <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {selectedBank.portfolios.find(p => p.id === selectedPortfolioId)?.description}
                </div>
            )}
        </div>
    );
};

export default PortfolioSelector;
