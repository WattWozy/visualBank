import React, { useEffect, useState } from 'react';
import { getHistoricalData } from '../services/polygon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { mean, std } from 'mathjs';

const OptimizationDashboard = ({ portfolio }) => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const calculateStats = async () => {
            if (!portfolio || portfolio.length === 0) {
                setStats(null);
                setChartData([]);
                return;
            }

            setLoading(true);
            setError(null);

            // Delay helper for rate limiting
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            try {
                // Use last 3 months to be safe with data limits and speed
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                const fromDate = startDate.toISOString().split('T')[0];

                const stockResults = [];

                // Fetch sequentially to respect rate limit
                for (let i = 0; i < portfolio.length; i++) {
                    const stock = portfolio[i];
                    try {
                        // If not the first request, wait for rate limit (5 req/min = 12s delay)
                        // We add a small buffer -> 13s
                        if (i > 0) {
                            await delay(13000);
                        }
                        const data = await getHistoricalData(stock.ticker, fromDate, endDate);
                        stockResults.push({ ticker: stock.ticker, weight: parseFloat(stock.weight) / 100, data });
                    } catch (e) {
                        console.warn(`Failed to fetch for ${stock.ticker}`, e);
                    }
                }

                // Filter out stocks with no data
                const validResults = stockResults.filter(s => s.data && s.data.length > 0);

                if (validResults.length === 0) {
                    setError("No data available. Note: Free API tier processes requests slowly (12s delay).");
                    setLoading(false);
                    return;
                }

                // Align dates (using the first stock's dates as reference, purely for simplicity in this MVP)
                // In a production app, we'd need more robust alignment
                const refDates = validResults[0].data.map(d => d.t); // timestamps

                // Calculate daily portfolio returns
                const dailyReturns = [];

                // Helper to get price for a specific date
                const getPrice = (stockResult, timestamp) => {
                    const bar = stockResult.data.find(d => d.t === timestamp);
                    return bar ? bar.c : null;
                };

                for (let i = 1; i < refDates.length; i++) {
                    let dayReturn = 0;
                    let validDay = true;

                    for (const stock of validResults) {
                        const priceToday = getPrice(stock, refDates[i]);
                        const priceYesterday = getPrice(stock, refDates[i - 1]);

                        if (priceToday === null || priceYesterday === null) {
                            // Missing data for this day for this stock
                            // For MVP, we might skip this day or assume 0 return
                            // Let's skip to keep it clean
                            validDay = false;
                            break;
                        }

                        const stockReturn = (priceToday - priceYesterday) / priceYesterday;
                        dayReturn += stockReturn * stock.weight;
                    }

                    if (validDay) {
                        dailyReturns.push(dayReturn);
                    }
                }

                if (dailyReturns.length === 0) {
                    setError("Insufficient overlapping data to calculate stats.");
                    setLoading(false);
                    return;
                }

                // Annualized Stats
                const avgDailyReturn = mean(dailyReturns);
                const stdDailyReturn = std(dailyReturns);

                const annReturn = avgDailyReturn * 252;
                const annVol = stdDailyReturn * Math.sqrt(252);
                const sharpe = annReturn / annVol; // Assuming 0 risk-free rate for MVP

                setStats({
                    return: (annReturn * 100).toFixed(2),
                    volatility: (annVol * 100).toFixed(2),
                    sharpe: sharpe.toFixed(2)
                });

                // Dummy Efficient Frontier Data generation (Monte Carlo simulation ideally, but just illustrative points here)
                // We will just plot a single point for the current portfolio for now, 
                // effectively showing where it stands.
                setChartData([
                    { x: annVol * 100, y: annReturn * 100, name: 'Current Portfolio' }
                ]);

            } catch (err) {
                console.error(err);
                setError("Failed to calculate portfolio statistics.");
            } finally {
                setLoading(false);
            }
        };

        calculateStats();
    }, [portfolio]);

    if (!portfolio || portfolio.length === 0) return null;

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 className="title" style={{ fontSize: '1.5rem' }}>Portfolio Analysis</h2>

            {loading && <div style={{ color: 'var(--text-secondary)' }}>Calculating optimal metrics... (Slow due to free API limits)</div>}
            {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

            {!loading && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Expected Annual Return</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.return}%</div>
                    </div>
                    <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Annual Volatility</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.volatility}%</div>
                    </div>
                    <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sharpe Ratio</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.sharpe}</div>
                    </div>
                </div>
            )}

            {/* Placeholder for Efficient Frontier Chart if we had more simulation data */}
            {/* For now, maybe just a text or simple placeholder, as single point scatter is boring */}
            {!loading && stats && (
                <div style={{ marginTop: '2rem', height: '300px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Risk / Return Profile</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" dataKey="x" name="Volatility" unit="%" stroke="var(--text-secondary)" />
                            <YAxis type="number" dataKey="y" name="Return" unit="%" stroke="var(--text-secondary)" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius)' }} />
                            <Scatter name="Portfolio" data={chartData} fill="var(--accent)">
                                {/* Only one point currently */}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default OptimizationDashboard;
