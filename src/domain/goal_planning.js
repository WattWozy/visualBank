/**
 * Goal planning and Monte Carlo simulation logic.
 */

/**
 * Simulates portfolio growth over time.
 * @param {Object} params
 * @param {number} params.targetAmount - The financial goal
 * @param {number} params.initialAmount - Starting balance
 * @param {number} params.monthlyContribution - Amount saved each month
 * @param {number} params.horizonYears - Time till goal
 * @param {number} params.expectedReturnAnn - Annualized return (decimal, e.g. 0.08 for 8%)
 * @param {number} params.expectedVolAnn - Annualized volatility (decimal, e.g. 0.15 for 15%)
 * @param {number} params.simulations - Number of paths to simulate
 */
export const simulateGoalOutcome = ({
    targetAmount,
    initialAmount,
    monthlyContribution,
    horizonYears,
    expectedReturnAnn,
    expectedVolAnn,
    simulationsCount = 1000
}) => {
    const months = horizonYears * 12;
    const monthlyReturn = expectedReturnAnn / 12;
    const monthlyVol = expectedVolAnn / Math.sqrt(12);

    let successCount = 0;
    const finalValues = [];
    const representativePaths = []; // Store a few paths for charting

    for (let s = 0; s < simulationsCount; s++) {
        let balance = initialAmount;
        const path = [balance];

        for (let m = 0; m < months; m++) {
            // Geometric Brownian Motion step
            // Use normal distribution for returns (simplified)
            const random = normalRandom();
            const periodicReturn = monthlyReturn + monthlyVol * random;

            balance = balance * (1 + periodicReturn) + monthlyContribution;

            // Only store path data for a small subset of simulations to save memory
            if (s < 5 && (m % 3 === 0)) path.push(balance);
        }

        finalValues.push(balance);
        if (balance >= targetAmount) successCount++;
        if (s < 5) representativePaths.push(path);
    }

    const probability = (successCount / simulationsCount) * 100;
    const medianOutcome = finalValues.sort((a, b) => a - b)[Math.floor(simulationsCount / 2)];

    return {
        probability: probability.toFixed(1),
        medianOutcome,
        representativePaths,
        isSuccessful: probability >= 70 // 70% is a common threshold for "on track"
    };
};

/**
 * Standard Normal variate using Box-Muller transform.
 */
function normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Suggests adjustments to reach the goal.
 */
export const suggestGoalAdjustments = (params, currentSuccess) => {
    if (currentSuccess >= 80) return "You're on track! Consider increasing your risk budget if you want to reach your goal even faster.";

    const suggestions = [];

    // 1. More contribution
    const higherContribution = simulateGoalOutcome({
        ...params,
        monthlyContribution: params.monthlyContribution * 1.5
    });
    if (higherContribution.probability > currentSuccess) {
        suggestions.push({
            type: 'CONTRIBUTION',
            text: `Increasing monthly savings by 50% boosts success to ${higherContribution.probability}%`,
            action: 'Increase monthly contribution'
        });
    }

    // 2. More time
    const longerHorizon = simulateGoalOutcome({
        ...params,
        horizonYears: params.horizonYears + 2
    });
    if (longerHorizon.probability > currentSuccess) {
        suggestions.push({
            type: 'TIME',
            text: `Extending your horizon by 2 years boosts success to ${longerHorizon.probability}%`,
            action: 'Extend time horizon'
        });
    }

    // 3. More risk (if currently low risk)
    const higherRisk = simulateGoalOutcome({
        ...params,
        expectedReturnAnn: params.expectedReturnAnn + 0.02,
        expectedVolAnn: params.expectedVolAnn + 0.05
    });
    if (higherRisk.probability > currentSuccess) {
        suggestions.push({
            type: 'RISK',
            text: `Adjusting to a growth portfolio (+2% exp return) boosts success to ${higherRisk.probability}%`,
            action: 'Optimize for Higher Yield'
        });
    }

    return suggestions;
};
