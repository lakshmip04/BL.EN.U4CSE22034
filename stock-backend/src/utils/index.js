import { getAccessToken } from "./access-token.js";

export async function fetchStockDataForTicker(ticker, minutes) {
  const stockData = await getStockData({
    url: `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`,
    method: "GET",
  });

  const prices = stockData?.map((stock) => stock.price);
  const averagePrice =
    prices.reduce((acc, curr) => acc + curr, 0) / prices.length;

  return {
    averagePrice,
    priceHistory: stockData,
  };
}

export function alignStockDataByTimestamp(stockData1, stockData2) {
  const alignedData = [];
  let history1, history2;

  //   find whichevers 0th item has earlier updatedAt set that as history1

  if (
    new Date(stockData1.priceHistory[0].lastUpdatedAt) <
    new Date(stockData2.priceHistory[0].lastUpdatedAt)
  ) {
    history1 = stockData2.priceHistory;
    history2 = stockData1.priceHistory;
  } else {
    history1 = stockData1.priceHistory;
    history2 = stockData2.priceHistory;
  }

  for (let i = 0; i < history1.length; i++) {
    const time1 = new Date(history1[i].lastUpdatedAt).getTime();
    const price1 = history1[i].price;

    let latestPrice2 = null;

    for (let j = 0; j < history2.length; j++) {
      const time2 = new Date(history2[j].lastUpdatedAt).getTime();

      // If this price update is before or at the current timestamp from stock1
      if (time2 <= time1) {
        latestPrice2 = history2[j].price;
      } else {
        // Stop once we've passed the timestamp
        break;
      }
    }

    if (latestPrice2 !== null) {
      alignedData.push({
        price1: price1,
        price2: latestPrice2,
      });
    }
  }

  return alignedData;
}

export const getStockData = async ({ url, method }) => {
  const accessToken = await getAccessToken();

  const data = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      method,
    },
  });

  const jsonData = await data.json();
  return jsonData;
};

const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

function covariance(x, y) {
  const meanX = mean(x);
  const meanY = mean(y);
  return (
    x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) /
    (x.length - 1)
  );
}

function stdDev(arr) {
  const avg = mean(arr);
  return Math.sqrt(
    arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / (arr.length - 1),
  );
}

export function pearsonCorrelation(x, y) {
  return covariance(x, y) / (stdDev(x) * stdDev(y));
}
