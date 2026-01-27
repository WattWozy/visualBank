/**
 * Risk metrics calculation functions.
 * Pure functions for calculating various risk indicators.
 */

/**
 * Calculates the maximum drawdown from a cumulative returns series.
 * @param {number[]} returns - Array of returns (e.g., daily returns)
 * @returns {number} Maximum drawdown (positive number representing loss %)
 */

export const calculateMaxDrawdown = (returns) => {
    if (!returns || returns.length === 0) return 0;

    // Calculate cumulative wealth
    let wealth = 1.0;
    const cumulativeWealth = [wealth];

    for (let i = 0; i < returns.length; i++) {
        wealth *= (1 + returns[i]);
        cumulativeWealth.push(wealth);
    }

    // Calculate running maximum and drawdowns
    let runningMax = cumulativeWealth[0];
    let maxDrawdown = 0;

    for (let i = 0; i < cumulativeWealth.length; i++) {
        if (cumulativeWealth[i] > runningMax) {
            runningMax = cumulativeWealth[i];
        }
        const drawdown = (runningMax - cumulativeWealth[i]) / runningMax;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return maxDrawdown;
};

/**
 * Calculates recovery time after the maximum drawdown.
 * @param {number[]} returns - Array of returns (e.g., daily returns)
 * @returns {number} Number of periods to recover from max drawdown (0 if not recovered)
 */
export const calculateRecoveryTime = (returns) => {
    if (!returns || returns.length === 0) return 0;

    // Calculate cumulative wealth
    let wealth = 1.0;
    const cumulativeWealth = [wealth];

    for (let i = 0; i < returns.length; i++) {
        wealth *= (1 + returns[i]);
        cumulativeWealth.push(wealth);
    }

    // Find the maximum drawdown period
    let runningMax = cumulativeWealth[0];
    let maxDrawdown = 0;
    let maxDrawdownEnd = 0;
    let maxDrawdownStart = 0;

    for (let i = 0; i < cumulativeWealth.length; i++) {
        if (cumulativeWealth[i] > runningMax) {
            runningMax = cumulativeWealth[i];
        }
        const drawdown = (runningMax - cumulativeWealth[i]) / runningMax;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            maxDrawdownEnd = i;
            // Find start of drawdown (when we were at runningMax)
            for (let j = i; j >= 0; j--) {
                if (cumulativeWealth[j] === runningMax) {
                    maxDrawdownStart = j;
                    break;
                }
            }
        }
    }

    // Find recovery time (when we reach the previous high again)
    const peakValue = cumulativeWealth[maxDrawdownStart];
    for (let i = maxDrawdownEnd; i < cumulativeWealth.length; i++) {
        if (cumulativeWealth[i] >= peakValue) {
            return i - maxDrawdownEnd;
        }
    }

    // Not yet recovered
    return 0;
};

/**
 * Calculates the underwater curve (drawdown over time).
 * @param {number[]} returns - Array of returns
 * @returns {Array<{period: number, drawdown: number}>} Array of drawdown values over time
 */
export const calculateUnderwaterCurve = (returns) => {
    if (!returns || returns.length === 0) return [];

    // Calculate cumulative wealth
    let wealth = 1.0;
    const cumulativeWealth = [wealth];

    for (let i = 0; i < returns.length; i++) {
        wealth *= (1 + returns[i]);
        cumulativeWealth.push(wealth);
    }

    // Calculate drawdown at each point
    let runningMax = cumulativeWealth[0];
    const underwaterCurve = [];

    for (let i = 0; i < cumulativeWealth.length; i++) {
        if (cumulativeWealth[i] > runningMax) {
            runningMax = cumulativeWealth[i];
        }
        const drawdown = (runningMax - cumulativeWealth[i]) / runningMax;
        underwaterCurve.push({
            period: i,
            drawdown: drawdown * 100 // Convert to percentage
        });
    }

    return underwaterCurve;
};

/**
 * Calculates the probability of loss (percentage of negative returns).
 * @param {number[]} returns - Array of returns
 * @returns {number} Probability of loss (0-1)
 */
export const calculateLossProbability = (returns) => {
    if (!returns || returns.length === 0) return 0;

    const lossCount = returns.filter(r => r < 0).length;
    return lossCount / returns.length;
};

/**
 * Calculates comprehensive risk metrics.
 * @param {number[]} returns - Array of portfolio returns
 * @returns {Object} Object containing all risk metrics
 */
export const calculateRiskMetrics = (returns) => {
    return {
        maxDrawdown: calculateMaxDrawdown(returns),
        recoveryTime: calculateRecoveryTime(returns),
        underwaterCurve: calculateUnderwaterCurve(returns),
        lossProbability: calculateLossProbability(returns)
    };
};
