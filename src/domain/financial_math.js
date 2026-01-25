/**
 * Pure functions for financial mathematics.
 * No side effects.
 */

// Basic Statistics

/**
 * Calculates percentage returns from a list of prices.
 * @param {number[]} prices - Array of historical prices.
 * @returns {number[]} Array of returns (length - 1).
 */
export const calculateReturns = (prices) => {
    if (!prices || prices.length < 2) return [];
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        const current = prices[i];
        const prev = prices[i - 1];
        if (prev === 0) returns.push(0);
        else returns.push((current - prev) / prev);
    }
    return returns;
};

export const mean = (numbers) => {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

export const variance = (numbers) => {
    if (!numbers || numbers.length < 2) return 0;
    const m = mean(numbers);
    const sumSquaredDiffs = numbers.reduce((sum, n) => sum + Math.pow(n - m, 2), 0);
    return sumSquaredDiffs / (numbers.length - 1); // Sample variance
};

export const stdDev = (numbers) => {
    return Math.sqrt(variance(numbers));
};

export const covariance = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length < 2) return 0;
    const m1 = mean(arr1);
    const m2 = mean(arr2);
    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
        sum += (arr1[i] - m1) * (arr2[i] - m2);
    }
    return sum / (arr1.length - 1);
};

export const correlation = (arr1, arr2) => {
    const cov = covariance(arr1, arr2);
    const std1 = stdDev(arr1);
    const std2 = stdDev(arr2);
    if (std1 === 0 || std2 === 0) return 0;
    return cov / (std1 * std2);
};

// Financial Metrics

/**
 * Calculates the Sharpe Ratio.
 * @param {number[]} returns - Array of historical returns (e.g., daily %).
 * @param {number} riskFreeRate - The risk-free rate per period (default 0).
 */
export const calculateSharpeRatio = (returns, riskFreeRate = 0) => {
    const excessReturns = returns.map(r => r - riskFreeRate);
    const avgExcessReturn = mean(excessReturns);
    const volatility = stdDev(excessReturns);

    if (volatility === 0) return 0;
    // Annualized Sharpe (assuming daily returns input, strictly mostly used as comparative metric)
    // Often reported annualized: Ratio * sqrt(252)
    return avgExcessReturn / volatility;
};

/**
 * Calculates the Sortino Ratio.
 * Similar to Sharpe but only penalizes downside volatility.
 * @param {number[]} returns 
 * @param {number} targetReturn 
 */
export const calculateSortinoRatio = (returns, targetReturn = 0) => {
    const avgReturn = mean(returns);
    const downsideReturns = returns.filter(r => r < targetReturn).map(r => r - targetReturn);

    // If no downside returns, risk is 0 (theoretically infinite ratio, return null or high cap)
    if (downsideReturns.length === 0) return 0; // Simplified

    const downsideDeviation = Math.sqrt(
        downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length
    );

    if (downsideDeviation === 0) return 0;
    return (avgReturn - targetReturn) / downsideDeviation;
}

/**
 * Calculates Beta relative to a benchmark.
 * @param {number[]} assetReturns 
 * @param {number[]} marketReturns 
 */
export const calculateBeta = (assetReturns, marketReturns) => {
    const cov = covariance(assetReturns, marketReturns);
    const marketVar = variance(marketReturns);
    if (marketVar === 0) return 0;
    return cov / marketVar;
};

/**
 * Calculates Value at Risk (VaR) using historical method.
 * @param {number[]} returns 
 * @param {number} confidenceLevel - e.g., 0.95 or 0.99
 */
export const calculateVaR = (returns, confidenceLevel = 0.95) => {
    if (!returns || returns.length === 0) return 0;
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    // VaR is positive number representing loss
    return Math.abs(sortedReturns[index]);
};
