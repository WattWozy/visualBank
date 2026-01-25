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

export const getHistoricalData = async (ticker, fromDate, toDate, timespan = 'day', multiplier = 1) => {
  try {
    const response = await apiClient.get(`/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}`, {
      params: {
        adjusted: true,
        sort: 'asc',
        apiKey: API_KEY,
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};
