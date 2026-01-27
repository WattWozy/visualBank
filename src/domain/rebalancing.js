/**
 * Rebalancing engine logic.
 * Handles drift calculation, suggested trades, and risk impact assessment.
 */

/**
 * Calculates drift for each asset.
 * @param {Object[]} portfolio - Array of { ticker, currentWeight, targetWeight }
 */
export const calculateDrift = (portfolio) => {
    return portfolio.map(item => {
        const drift = (item.currentWeight || 0) - (item.targetWeight || 0);
        return {
            ...item,
            drift: drift,
            absDrift: Math.abs(drift)
        };
    });
};

/**
 * Generates rebalancing suggestions.
 * @param {Object[]} portfolio - Array of { ticker, currentWeight, targetWeight }
 * @param {number} threshold - Threshold for rebalancing (e.g., 0.05 for 5%)
 */
export const suggestTrades = (portfolio, threshold = 0) => {
    const driftData = calculateDrift(portfolio);

    return driftData.map(item => {
        if (item.absDrift > threshold) {
            return {
                ticker: item.ticker,
                trade: -item.drift, // Negative drift means we need to buy (add weight)
                action: item.drift > 0 ? 'SELL' : 'BUY',
                amount: Math.abs(item.drift)
            };
        }
        return null;
    }).filter(Boolean);
};

/**
 * Previews the impact of rebalancing on risk/return.
 * @param {Object} currentStats - Current portfolio performance stats
 * @param {Object} targetStats - Target portfolio performance stats
 * @param {number} estimatedCostPerTrade - Flat cost estimate per trade
 * @param {number} rebalanceCount - Number of trades in rebalance
 */
export const calculateRebalanceImpact = (currentStats, targetStats, estimatedCostPerTrade = 0.001) => {
    const returnDiff = targetStats.expectedReturn - currentStats.expectedReturn;
    const riskDiff = targetStats.risk - currentStats.risk;

    // Simple cost estimate: 0.1% per rebalanced percentage point (very simplified)
    // In a real app we'd need trade volume
    const estimatedCost = 0.05; // Placeholder for now

    return {
        returnImpact: returnDiff,
        riskImpact: riskDiff,
        sharpeImpact: targetStats.sharpe - currentStats.sharpe,
        estimatedCost
    };
};

/**
 * Checks if risk exceeds a budget.
 * @param {number} currentRisk - Portfolio volatility
 * @param {number} riskBudget - Max allowed volatility
 */
export const checkRiskBudget = (currentRisk, riskBudget) => {
    if (!riskBudget || riskBudget <= 0) return { withinBudget: true, percentage: 0 };

    const exceeded = currentRisk > riskBudget;
    const percentage = exceeded ? ((currentRisk - riskBudget) / riskBudget) * 100 : 0;

    return {
        withinBudget: !exceeded,
        percentage: percentage.toFixed(1)
    };
};
