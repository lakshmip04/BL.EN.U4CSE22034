import { LineChart } from '@mui/x-charts/LineChart';

const API_BASE_URL = 'http://localhost:8080';

export const fetchStockData = async (symbol, minutes) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}?minutes=${minutes}&aggregation=average`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data.priceHistory)) {
      console.error("Invalid data format from API:", data);
      throw new Error("Invalid data format from API");
    }
    
    const priceData = data.priceHistory.map(item => ({
      time: new Date(item.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: item.price,
      timestamp: new Date(item.lastUpdatedAt),
      volume: Math.floor(Math.random() * 10000) + 5000 
    }));
    
   
    if (priceData.length === 0) {
      console.warn("No price data returned from API for", symbol);
      throw new Error("No price data returned from API");
    }
  
    const marketData = {
      open: priceData[0]?.price || 0,
      close: priceData[priceData.length - 1]?.price || 0,
      high: Math.max(...priceData.map(item => item.price)),
      low: Math.min(...priceData.map(item => item.price)),
      change: priceData.length > 1 ? (priceData[priceData.length - 1].price - priceData[0].price) : 0,
      changePercent: priceData.length > 1 ? ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100 : 0
    };
    
    return { 
      symbol,
      priceData, 
      average: data.averagePrice || 0,
      marketData
    };

};


export const getAvailableStocks = async () => {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' }
  ];
};

export const getStockCorrelation = async (ticker1, ticker2, minutes) => {
  if (!ticker1 || !ticker2) {
    console.error("Invalid ticker symbols:", ticker1, ticker2);
    return { correlation: 0, stocks: {} };
  }
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/stockcorrelation?ticker=${ticker1}&ticker=${ticker2}&minutes=${minutes}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data.correlation !== 'number' || !data.stocks) {
      console.error("Invalid correlation data format:", data);
      return { 
        correlation: 0, 
        stocks: {
          [ticker1]: { priceHistory: [] },
          [ticker2]: { priceHistory: [] }
        } 
      };
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching correlation data:", error);
    return { 
      correlation: 0, 
      stocks: {
        [ticker1]: { priceHistory: [] },
        [ticker2]: { priceHistory: [] }
      } 
    };
  }
};
