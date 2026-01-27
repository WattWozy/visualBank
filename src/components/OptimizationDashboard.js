import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import RiskAnalysis from './RiskAnalysis';

const OptimizationDashboard = ({ stats, targetStats, chartData, correlationMatrix, riskMetrics, rebalanceInfo, riskBudgetStatus, loading, error }) => {
    const [activeTab, setActiveTab] = useState('performance');

    if (loading) {
        return (
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="loader" style={{ margin: '2rem auto' }}></div>
                <div style={{ color: 'var(--text-secondary)' }}>Calculating advanced portfolio metrics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center', border: '1px solid var(--danger)' }}>
                <div style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{error}</div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(20, 20, 25, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>

            {/* Risk Budget Alert */}
            {riskBudgetStatus?.exceeded && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: 'pulse 2s infinite'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Risk Budget Exceeded</div>
                        <div style={{ fontSize: '0.9rem' }}>You are exceeding your risk budget by {riskBudgetStatus.percent}%</div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '2rem'
            }}>
                {['performance', 'risk', 'rebalance'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent',
                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {tab === 'performance' && '📈 Performance'}
                        {tab === 'risk' && '⚠️ Risk'}
                        {tab === 'rebalance' && '⚖️ Rebalance'}
                    </button>
                ))}
            </div>

            {/* Performance Tab */}
            {activeTab === 'performance' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Expected Return</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.expectedReturn}%</div>
                        </div>
                        <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Volatility</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.risk}%</div>
                        </div>
                        <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sharpe Ratio</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.sharpe}</div>
                        </div>
                    </div>

                    {chartData && (
                        <div style={{ height: '350px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Risk-Return Profile</h3>
                            <ResponsiveContainer width="100%" height="85%">
                                <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis type="number" dataKey="x" name="Volatility" unit="%" stroke="var(--text-secondary)" fontSize={12} />
                                    <YAxis type="number" dataKey="y" name="Return" unit="%" stroke="var(--text-secondary)" fontSize={12} />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)' }}
                                    />
                                    <Scatter name="Current" data={chartData.filter(d => d.isCurrent)} fill="var(--success)" shape="circle" />
                                    <Scatter name="Target" data={chartData.filter(d => d.isTarget)} fill="var(--accent)" shape="triangle" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Risk Tab */}
            {activeTab === 'risk' && <RiskAnalysis riskMetrics={riskMetrics} />}

            {/* Rebalance Tab */}
            {activeTab === 'rebalance' && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                        {/* Drift Analysis */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Asset Drift</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {rebalanceInfo?.drift.map(item => {
                                    const driftVal = Math.abs(item.drift);
                                    const isDriftHigh = driftVal > 5;
                                    return (
                                        <div key={item.ticker} style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius)',
                                            borderLeft: `4px solid ${item.drift > 0 ? 'var(--danger)' : 'var(--success)'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 'bold' }}>{item.ticker}</span>
                                                <span style={{ color: isDriftHigh ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                                    {item.drift > 0 ? '+' : ''}{item.drift.toFixed(1)}% Drift
                                                </span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${Math.min(100, (item.current / (item.current + Math.abs(item.drift))) * 100)}%`,
                                                    height: '100%',
                                                    backgroundColor: item.drift > 0 ? 'var(--danger)' : 'var(--success)',
                                                    opacity: 0.7
                                                }}></div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                                                <span>Current: {item.current.toFixed(1)}%</span>
                                                <span>Target: {item.target.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Trades & Impact */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Recommended Trades</h3>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '2rem' }}>
                                {rebalanceInfo?.drift.filter(d => Math.abs(d.drift) > 0.1).map(item => (
                                    <div key={item.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                backgroundColor: item.drift > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                                color: item.drift > 0 ? 'var(--danger)' : 'var(--success)'
                                            }}>
                                                {item.drift > 0 ? 'SELL' : 'BUY'}
                                            </span>
                                            <span style={{ fontWeight: 'bold' }}>{item.ticker}</span>
                                        </div>
                                        <span style={{ fontFamily: 'monospace' }}>{Math.abs(item.drift).toFixed(2)}% of Portfolio</span>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Impact Preview</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Return Delta</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: (targetStats.expectedReturn - stats.expectedReturn) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {(targetStats.expectedReturn - stats.expectedReturn).toFixed(2)}%
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Risk Delta</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: (targetStats.risk - stats.risk) <= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {(targetStats.risk - stats.risk).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Analysis:</div>
                                Rebalancing will {targetStats.sharpe > stats.sharpe ? 'improve' : 'reduce'} your risk-adjusted return (Sharpe) from {stats.sharpe} to {targetStats.sharpe}.
                                <span style={{ color: 'var(--accent)', marginLeft: '0.5rem', cursor: 'pointer' }}>View Detailed Cost/Benefit →</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default OptimizationDashboard;
