import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const RiskAnalysis = ({ riskMetrics }) => {
    if (!riskMetrics) return null;

    const { maxDrawdown, recoveryTime, underwaterCurve, lossProbability } = riskMetrics;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Risk Analysis</h2>

            {/* Risk Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="card" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    textAlign: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Max Drawdown
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--danger)',
                        marginBottom: '0.25rem'
                    }}>
                        {(maxDrawdown * 100).toFixed(2)}%
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        opacity: 0.7
                    }}>
                        Worst peak-to-trough decline
                    </div>
                </div>

                <div className="card" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    textAlign: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Recovery Time
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--accent)',
                        marginBottom: '0.25rem'
                    }}>
                        {recoveryTime}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        opacity: 0.7
                    }}>
                        {recoveryTime === 0 ? 'Not yet recovered' : 'Days to recover from max DD'}
                    </div>
                </div>

                <div className="card" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    textAlign: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Loss Probability
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: lossProbability > 0.5 ? 'var(--danger)' : 'var(--success)',
                        marginBottom: '0.25rem'
                    }}>
                        {(lossProbability * 100).toFixed(2)}%
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        opacity: 0.7
                    }}>
                        Frequency of negative returns
                    </div>
                </div>
            </div>

            {/* Underwater Curve Chart */}
            {underwaterCurve && underwaterCurve.length > 0 && (
                <div className="card" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '1.5rem',
                    marginTop: '2rem'
                }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        marginBottom: '1rem',
                        color: 'var(--text-primary)'
                    }}>
                        Underwater Curve
                    </h3>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1.5rem',
                        opacity: 0.8
                    }}>
                        Portfolio drawdown over time (distance from peak wealth)
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={underwaterCurve}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.1)"
                                />
                                <XAxis
                                    dataKey="period"
                                    stroke="var(--text-secondary)"
                                    label={{
                                        value: 'Trading Days',
                                        position: 'insideBottom',
                                        offset: -5,
                                        fill: 'var(--text-secondary)'
                                    }}
                                />
                                <YAxis
                                    stroke="var(--text-secondary)"
                                    label={{
                                        value: 'Drawdown %',
                                        angle: -90,
                                        position: 'insideLeft',
                                        fill: 'var(--text-secondary)'
                                    }}
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        padding: '0.75rem'
                                    }}
                                    formatter={(value) => [`${value.toFixed(2)}%`, 'Drawdown']}
                                    labelFormatter={(label) => `Day ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="drawdown"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#drawdownGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Risk Interpretation Guide */}
            <div className="card" style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1.5rem',
                marginTop: '2rem'
            }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                }}>
                    📊 Understanding Risk Metrics
                </h3>
                <div style={{
                    display: 'grid',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div>
                        <strong style={{ color: 'var(--danger)' }}>Max Drawdown:</strong> The largest peak-to-trough decline.
                        Lower is better. A 20% drawdown means your portfolio lost 20% from its highest value.
                    </div>
                    <div>
                        <strong style={{ color: 'var(--accent)' }}>Recovery Time:</strong> Days needed to recover from the max drawdown.
                        Shorter is better. Zero means the portfolio hasn't recovered yet.
                    </div>
                    <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Underwater Curve:</strong> Shows when and how deep your portfolio
                        was in drawdown. Flat at zero means you're at peak wealth. Deeper = worse performance.
                    </div>
                    <div>
                        <strong style={{ color: 'var(--success)' }}>Loss Probability:</strong> Percentage of days with negative returns.
                        Lower is better, but some volatility is normal in healthy portfolios.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysis;
