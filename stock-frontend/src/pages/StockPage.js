import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Tooltip,
  CircularProgress,
  IconButton,
  TextField,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart } from '@mui/x-charts/LineChart';
import { fetchStockData, getAvailableStocks } from '../services/stockService';
import './StockPage.css';

const StockPage = () => {
  const [timeInterval, setTimeInterval] = useState(30); // Default 30 minutes
  const [stockData, setStockData] = useState({ priceData: [], average: 0, marketData: {} });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('AAPL'); // Default to Apple
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStocks = async () => {
      const stocks = await getAvailableStocks();
      setAvailableStocks(stocks);
    };
    
    loadStocks();
  }, []);
  
  useEffect(() => {
    loadStockData();
  }, [timeInterval, selectedStock]);
  
  const loadStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStockData(selectedStock, timeInterval);
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Failed to fetch stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeIntervalChange = (event) => {
    setTimeInterval(event.target.value);
  };
  
  const handleStockChange = (event) => {
    setSelectedStock(event.target.value);
  };
  
  const handleRefresh = () => {
    loadStockData();
  };
  
  const handleChartClick = (event, data) => {
    if (data) {
      setSelectedPoint(data);
    }
  };
  
  const getChartData = () => {
    if (!stockData.priceData || stockData.priceData.length === 0) {
      return { data: [], xLabels: [] };
    }
    
    const data = stockData.priceData.map(item => item.price);
    const xLabels = stockData.priceData.map(item => item.time);
    
    return { data, xLabels };
  };
  
  // Determine if the stock is up or down
  const isStockUp = stockData.marketData?.change > 0;
  const changeColor = isStockUp ? "success.main" : "error.main";
  const changeSymbol = isStockUp ? "+" : "";
  
  // Get chart data
  const { data: chartData, xLabels } = getChartData();
  
  // Create a series of average price points
  const averageSeries = chartData.length > 0 ? Array(chartData.length).fill(stockData.average) : [];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Stock Price Analysis</Typography>
        <IconButton onClick={handleRefresh} color="primary" aria-label="refresh data">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card className="stock-card" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="stock-symbol-label">Stock Symbol</InputLabel>
                  <Select
                    labelId="stock-symbol-label"
                    id="stock-symbol-select"
                    value={selectedStock}
                    label="Stock Symbol"
                    onChange={handleStockChange}
                  >
                    {availableStocks.map(stock => (
                      <MenuItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            
              <Typography variant="h6">Stock Details</Typography>
              <div className="info-section">
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <>
                    <Typography variant="body1">Symbol: {stockData.symbol}</Typography>
                    <Typography variant="body1">Current Price: ${stockData.priceData.length ? stockData.priceData[stockData.priceData.length - 1].price : '-'}</Typography>
                    <Typography variant="body1">Average Price: ${stockData.average}</Typography>
                    <Typography variant="body1" color={changeColor}>
                      Change: {changeSymbol}${stockData.marketData?.change} ({changeSymbol}{stockData.marketData?.changePercent}%)
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">Open: ${stockData.marketData?.open}</Typography>
                      <Typography variant="body2">High: ${stockData.marketData?.high}</Typography>
                      <Typography variant="body2">Low: ${stockData.marketData?.low}</Typography>
                    </Box>
                  </>
                )}
              </div>
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth className="time-selector">
                  <InputLabel id="time-interval-label">Time Interval (minutes)</InputLabel>
                  <Select
                    labelId="time-interval-label"
                    id="time-interval-select"
                    value={timeInterval}
                    label="Time Interval (minutes)"
                    onChange={handleTimeIntervalChange}
                  >
                    <MenuItem value={15}>Last 15 minutes</MenuItem>
                    <MenuItem value={30}>Last 30 minutes</MenuItem>
                    <MenuItem value={60}>Last 1 hour</MenuItem>
                    <MenuItem value={120}>Last 2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Price Chart</Typography>
              <Box sx={{ height: 400 }} className="chart-container">
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : chartData.length > 0 ? (
                  <LineChart
                    height={400}
                    series={[
                      {
                        data: chartData,
                        label: 'Stock Price',
                        color: '#8884d8',
                        showMark: false,
                      },
                      {
                        data: averageSeries,
                        label: 'Average Price',
                        color: '#ff7300',
                        showMark: false,
                        curve: 'linear',
                      },
                    ]}
                    xAxis={[
                      {
                        data: xLabels,
                        scaleType: 'point',
                      },
                    ]}
                    onClick={handleChartClick}
                    sx={{
                      '.MuiLineElement-root': {
                        strokeWidth: 2,
                      },
                      '.MuiMarkElement-root': {
                        stroke: '#8884d8',
                        scale: '0.6',
                        fill: '#fff',
                        strokeWidth: 2,
                      },
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography>No data available</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {selectedPoint && !loading && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }} className="info-section">
              <Typography variant="h6">Selected Data Point</Typography>
              <Typography>Time: {selectedPoint.dataIndex >= 0 && xLabels[selectedPoint.dataIndex]}</Typography>
              <Typography>Price: ${selectedPoint.dataIndex >= 0 && chartData[selectedPoint.dataIndex]}</Typography>
              {selectedPoint.dataIndex >= 0 && stockData.priceData[selectedPoint.dataIndex] && (
                <Typography>Volume: {stockData.priceData[selectedPoint.dataIndex].volume.toLocaleString()}</Typography>
              )}
              {selectedPoint.dataIndex >= 0 && (
                <Typography color={chartData[selectedPoint.dataIndex] > stockData.average ? "success.main" : "error.main"}>
                  {chartData[selectedPoint.dataIndex] > stockData.average 
                    ? `$${(chartData[selectedPoint.dataIndex] - stockData.average).toFixed(2)} above average` 
                    : `$${(stockData.average - chartData[selectedPoint.dataIndex]).toFixed(2)} below average`}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StockPage; 