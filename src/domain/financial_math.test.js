import {
    mean,
    variance,
    stdDev,
    covariance,
    correlation,
    calculateReturns,
    calculateSharpeRatio,
    calculateSortinoRatio,
    calculateVaR
} from './financial_math';

describe('Financial Math Utils', () => {

    describe('Basic Stats', () => {
        test('mean calculates correctly', () => {
            expect(mean([1, 2, 3])).toBe(2);
            expect(mean([10, 20])).toBe(15);
            expect(mean([])).toBe(0);
        });

        test('variance calculates correctly', () => {
            // [1, 2, 3] mean=2. diffs=[-1, 0, 1]. sq=[1, 0, 1]. sum=2. var = 2/2 = 1.
            expect(variance([1, 2, 3])).toBe(1);
        });

        test('stdDev calculates correctly', () => {
            expect(stdDev([1, 2, 3])).toBe(1);
        });
    });

    describe('calculateReturns', () => {
        test('calculates correct percentage changes', () => {
            const prices = [100, 110, 99];
            const returns = calculateReturns(prices);
            expect(returns.length).toBe(2);
            expect(returns[0]).toBeCloseTo(0.1); // 10%
            expect(returns[1]).toBeCloseTo(-0.1); // -11/110 = -0.1 (-10%)
        });

        test('handles empty or single price', () => {
            expect(calculateReturns([])).toEqual([]);
            expect(calculateReturns([100])).toEqual([]);
        });
    });

    describe('Financial Metrics', () => {
        test('calculateSharpeRatio', () => {
            // Returns: [0, 0, 0]. Mean=0, Std=0. Should handle div by zero gracefully?
            // My implementation returns 0 if vol is 0.
            expect(calculateSharpeRatio([0.1, 0.1])).toBe(0);

            // Returns: [0.1, 0.2]. Mean=0.15. Std=0.0707. Sharpe = 0.15 / 0.0707 = ~2.12
            const ret = [0.1, 0.2];
            const result = calculateSharpeRatio(ret);
            expect(result).toBeGreaterThan(2);
        });

        test('calculateSortinoRatio', () => {
            // Returns with no downside.
            const ret = [0.1, 0.2];
            expect(calculateSortinoRatio(ret)).toBe(0); // Simplified impl for no risk

            // Returns with downside
            const retDown = [0.1, -0.1];
            // Returns < 0: [-0.1]. Sq = 0.01. Avg Sq = 0.005. DownsideDev = 0.0707.
            // Mean = 0. Ratio = 0 / 0.0707 = 0.
            expect(calculateSortinoRatio(retDown)).toBe(0);

            const retDown2 = [0.1, -0.2];
            // Mean = -0.05.
            // Downside: [-0.2]. Sq=0.04. Avg=0.02. DownDev=0.1414.
            // Ratio = -0.05 / 0.1414 = -0.35
            expect(calculateSortinoRatio(retDown2)).toBeCloseTo(-0.35, 1);
        });

        test('calculateVaR', () => {
            // Sorted: [-0.05, -0.02, 0.01, 0.03]
            // Conf 0.95 -> index floor(0.05 * 4) = 0.
            // VaR = abs(-0.05) = 0.05
            const returns = [0.03, -0.02, 0.01, -0.05];
            expect(calculateVaR(returns, 0.95)).toBe(0.05);
        });
    });
});
