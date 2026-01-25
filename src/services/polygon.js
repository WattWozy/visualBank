import axios from 'axios';

const API_KEY = process.env.REACT_APP_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

export const searchStocks = async (query) => {
  if (!query) return [];
  try {
    const response = await apiClient.get(`/v3/reference/tickers`, {
      params: {
        search: query,
        active: true,
        sort: 'ticker',
        order: 'asc',
        limit: 10,
        apiKey: API_KEY,
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

/**
 * Fetches historical data and returns a clean domain-ready structure.
 * @returns {Promise<{ticker: string, dates: string[], prices: number[]}>}
 */
export const getHistoricalData = async (ticker, fromDate, toDate, timespan = 'day', multiplier = 1) => {
  try {
    const response = await apiClient.get(`/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}`, {
      params: {
        adjusted: true,
        sort: 'asc',
        apiKey: API_KEY,
      },
    });

    const results = response.data.results || [];

    // Map to clean arrays for domain usage
    const dates = results.map(r => new Date(r.t).toISOString().split('T')[0]);
    const prices = results.map(r => r.c); // using 'c' for close price

    return {
      ticker,
      dates,
      prices
    };

  } catch (error) {
    console.error('Error fetching historical data:', error);
    return { ticker, dates: [], prices: [] };
  }
};
