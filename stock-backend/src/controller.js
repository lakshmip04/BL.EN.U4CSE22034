import { fetchStockDataForTicker, pearsonCorrelation } from "./utils/index.js";

export const getAverageStockPriceInTimeRange = async (req, res) => {
  const { ticker } = req.params;
  const { minutes, aggregation } = req.query;

  if (!ticker || !minutes || aggregation !== "average") {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  const stockData = await fetchStockDataForTicker(ticker, minutes);
  return res.json(stockData);
};

export const getStockPriceCorrelation = async (req, res) => {
  const { minutes, ticker } = req.query;

  if (!ticker || !minutes || !Array.isArray(ticker) || ticker.length !== 2) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  const tickers = ticker.map((ticker) =>
    ticker.replace("{", "").replace("}", ""),
  );

  try {
    const ticker1 = tickers[0];
    const ticker2 = tickers[1];

    const [stockData1, stockData2] = await Promise.all([
      fetchStockDataForTicker(ticker1, minutes),
      fetchStockDataForTicker(ticker2, minutes),
    ]);

    const pricesX = stockData1.priceHistory.map((item) => item.price);
    const pricesY = stockData2.priceHistory.map((item) => item.price);

    const minLength = Math.min(pricesX.length, pricesY.length);

    const xTrimmed = pricesX.slice(0, minLength);
    const yTrimmed = pricesY.slice(0, minLength);

    const correlation = pearsonCorrelation(xTrimmed, yTrimmed);

    return res.json({
      correlation,
      stocks: {
        [ticker1]: stockData1,
        [ticker2]: stockData2,
      },
    });
  } catch (error) {
    console.error("Error calculating correlation:", error);
    return res.status(500).json({ error: "Failed to calculate correlation" });
  }
};
