import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const OptimizationDashboard = ({ stats, chartData, correlationMatrix, loading, error }) => {

    if (loading) {
        return (
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Calculating optimal metrics... (Slow due to free API limits)</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--danger)' }}>{error}</div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 className="title" style={{ fontSize: '1.5rem' }}>Portfolio Analysis</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Expected Annual Return</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.expectedReturn}%</div>
                </div>
                <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Annual Volatility</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.risk}%</div>
                </div>
                <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sharpe Ratio</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.sharpe}</div>
                </div>
                {stats.sortino !== undefined && (
                    <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sortino Ratio</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.sortino}</div>
                    </div>
                )}
                {stats.var !== undefined && (
                    <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>VaR (95%)</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.var}%</div>
                    </div>
                )}
            </div>

            {chartData && chartData.length > 0 && (
                <div style={{ marginTop: '2rem', height: '300px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Efficient Frontier (Monte Carlo)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" dataKey="x" name="Volatility" unit="%" stroke="var(--text-secondary)" />
                            <YAxis type="number" dataKey="y" name="Return" unit="%" stroke="var(--text-secondary)" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius)' }} />
                            {/* Simulations */}
                            <Scatter name="Simulations" data={chartData.filter(d => !d.isCurrent)} fill="#ffffff" opacity={0.3} />
                            {/* Current Portfolio */}
                            <Scatter name="Current Portfolio" data={chartData.filter(d => d.isCurrent)} fill="var(--accent)" shape="star" r={10} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}

            {correlationMatrix && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Correlation Matrix</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0.5rem' }}></th>
                                    {correlationMatrix.tickers.map(t => (
                                        <th key={t} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{t}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {correlationMatrix.matrix.map((row, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{correlationMatrix.tickers[i]}</td>
                                        {row.map((val, j) => {
                                            // Color code correlation
                                            const intensity = Math.abs(val);
                                            const color = val > 0 ? `rgba(34, 197, 94, ${intensity})` : `rgba(239, 68, 68, ${intensity})`;
                                            return (
                                                <td key={j} style={{ padding: '0.5rem', textAlign: 'center', backgroundColor: color, borderRadius: '4px' }}>
                                                    {val.toFixed(2)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptimizationDashboard;
