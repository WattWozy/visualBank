import React, { useState, useEffect } from 'react';
import { simulateGoalOutcome, suggestGoalAdjustments } from '../domain/goal_planning';

const GoalPlanning = ({ currentPortfolioStats }) => {
    const [goalParams, setGoalParams] = useState({
        name: 'Retirement fund',
        targetAmount: 1000000,
        initialAmount: 50000,
        monthlyContribution: 2000,
        horizonYears: 20
    });

    const [result, setResult] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (!currentPortfolioStats) return;

        const params = {
            ...goalParams,
            expectedReturnAnn: parseFloat(currentPortfolioStats.expectedReturn) / 100,
            expectedVolAnn: parseFloat(currentPortfolioStats.risk) / 100,
            simulationsCount: 1000
        };

        const outcome = simulateGoalOutcome(params);
        setResult(outcome);

        const adj = suggestGoalAdjustments(params, parseFloat(outcome.probability));
        setSuggestions(adj);
    }, [goalParams, currentPortfolioStats]);

    const handleChange = (field, value) => {
        setGoalParams(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    if (!currentPortfolioStats) {
        return (
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Add some assets to your portfolio to start goal planning.</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="card-header">
                <h2 className="section-title">🎯 Wealth Goal Planning</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Inputs */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>GOAL NAME</label>
                        <input
                            className="input"
                            type="text"
                            value={goalParams.name}
                            onChange={(e) => setGoalParams(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>TARGET AMOUNT ($)</label>
                            <input
                                className="input"
                                type="number"
                                value={goalParams.targetAmount}
                                onChange={(e) => handleChange('targetAmount', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>INITIAL DEPOSIT ($)</label>
                            <input
                                className="input"
                                type="number"
                                value={goalParams.initialAmount}
                                onChange={(e) => handleChange('initialAmount', e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>MONTHLY SAVINGS ($)</label>
                            <input
                                className="input"
                                type="number"
                                value={goalParams.monthlyContribution}
                                onChange={(e) => handleChange('monthlyContribution', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="stat-label" style={{ display: 'block', marginBottom: '0.4rem' }}>TIME HORIZON (YRS)</label>
                            <input
                                className="input"
                                type="number"
                                value={goalParams.horizonYears}
                                onChange={(e) => handleChange('horizonYears', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div style={{ position: 'relative' }}>
                    {result && (
                        <div className="stat-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div className="stat-label">PROBABILITY OF SUCCESS</div>
                            <div style={{
                                fontSize: '4rem',
                                fontWeight: '900',
                                margin: '0.5rem 0',
                                color: result.probability > 75 ? 'var(--success)' : result.probability > 50 ? 'var(--accent)' : 'var(--danger)',
                                textShadow: '0 0 20px rgba(255,255,255,0.1)'
                            }}>
                                {result.probability}%
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Estimated median outcome: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>${Math.round(result.medianOutcome).toLocaleString()}</span>
                            </p>

                            <div style={{
                                marginTop: '1.5rem',
                                height: '4px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${result.probability}%`,
                                    height: '100%',
                                    background: 'var(--accent)',
                                    boxShadow: '0 0 10px var(--accent)'
                                }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && result?.probability < 80 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🛠️ Optimization Required</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {suggestions.map((s, idx) => (
                            <div key={idx} style={{
                                padding: '1.2rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{s.text}</div>
                                <button className="btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)' }}>
                                    {s.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalPlanning;
