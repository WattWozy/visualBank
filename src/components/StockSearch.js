import React, { useState, useEffect } from 'react';
import { searchStocks } from '../services/polygon';

const StockSearch = ({ onAdd }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    // Search effect
    useEffect(() => {
        const fetchStocks = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            const data = await searchStocks(debouncedQuery);
            setResults(data);
            setLoading(false);
        };

        fetchStocks();
    }, [debouncedQuery]);

    const handleAdd = (ticker) => {
        onAdd(ticker);
        setQuery('');
        setResults([]);
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <div className="input-group">
                <input
                    type="text"
                    className="input"
                    placeholder="Search for stocks (e.g., AAPL)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div style={{ position: 'absolute', right: '1rem', color: 'var(--text-secondary)' }}>
                        Loading...
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="card" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    padding: 0, // Reset padding for list
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 50,
                    border: '1px solid var(--bg-tertiary)'
                }}>
                    {results.map((stock) => (
                        <div
                            key={stock.ticker}
                            onClick={() => handleAdd(stock.ticker)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--bg-tertiary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div>
                                <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{stock.ticker}</span>
                                <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>{stock.name}</span>
                            </div>
                            <span style={{ fontSize: '1.2rem', color: 'var(--success)' }}>+</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockSearch;
