/**
 * Pure functions for portfolio optimization logic.
 * No side effects.
 */

import { mean, stdDev, covariance, correlation } from './financial_math';

/**
 * Calculates the expected return and volatility of a portfolio given weights.
 * @param {Object[]} assets - Array of asset objects: { ticker, returns: [], meanReturn, stdDev }
 * @param {number[]} weights - Array of weights corresponding to assets (sum should be 1)
 * @param {Array<Array<number>>} covMatrix - Covariance matrix of asset returns
 */
export const calculatePortfolioPerformance = (assets, weights, covMatrix) => {
    if (!assets || !weights || assets.length !== weights.length) return { return: 0, risk: 0 };

    // Portfolio Return = Sum(Weight_i * MeanReturn_i)
    let portReturn = 0;
    for (let i = 0; i < assets.length; i++) {
        portReturn += weights[i] * assets[i].meanReturn;
    }

    // Portfolio Variance = Weights_Transpose * CovMatrix * Weights
    // Sum(Sum(w_i * w_j * cov_ij))
    let portVar = 0;
    for (let i = 0; i < assets.length; i++) {
        for (let j = 0; j < assets.length; j++) {
            portVar += weights[i] * weights[j] * covMatrix[i][j];
        }
    }

    return {
        expectedReturn: portReturn,
        risk: Math.sqrt(portVar), // Standard Deviation
        weights: weights
    };
};

/**
 * Generates the Covariance Matrix for a set of assets.
 * @param {Object[]} assets - Array of assets with 'returns' property.
 */
export const buildCovarianceMatrix = (assets) => {
    const n = assets.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = covariance(assets[i].returns, assets[j].returns);
        }
    }
    return matrix;
};

/**
 * Generates the Correlation Matrix for a set of assets.
 * @param {Object[]} assets 
 */
export const buildCorrelationMatrix = (assets) => {
    const n = assets.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = correlation(assets[i].returns, assets[j].returns);
        }
    }
    return matrix;
};

/**
 * Generates random portfolios for Monte Carlo simulation / Efficient Frontier visualization.
 * @param {Object[]} assets 
 * @param {number} numPortfolios 
 */
export const generateRandomPortfolios = (assets, numPortfolios = 1000) => {
    const covMatrix = buildCovarianceMatrix(assets);
    const portfolios = [];

    for (let k = 0; k < numPortfolios; k++) {
        // Generate random weights
        let weights = assets.map(() => Math.random());
        const sumWeights = weights.reduce((a, b) => a + b, 0);
        weights = weights.map(w => w / sumWeights); // Normalize to sum to 1

        const perf = calculatePortfolioPerformance(assets, weights, covMatrix);

        // Add Sharpe Ratio for coloring/sorting (assuming 0 risk free for simplicity here)
        const sharpe = perf.risk === 0 ? 0 : perf.expectedReturn / perf.risk;

        portfolios.push({
            ...perf,
            sharpe
        });
    }

    return portfolios;
};
