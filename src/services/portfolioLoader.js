/**
 * Service to fetch available bank portfolios.
 * Simulates an API call by fetching a static JSON file from the public directory.
 */

export const fetchBanks = async () => {
    try {
        const response = await fetch('/data/portfolios.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch portfolios: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading portfolios:", error);
        throw error;
    }
};
