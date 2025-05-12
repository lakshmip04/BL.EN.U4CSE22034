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
  CircularProgress,
  IconButton,
  Alert,
  Slider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart } from '@mui/x-charts/LineChart';
import { getStockCorrelation, getAvailableStocks } from '../services/stockService';
import './StockPage.css';

const StockCorrelation = () => {
  const [timeInterval, setTimeInterval] = useState(30);
  const [selectedStocks, setSelectedStocks] = useState(['AAPL', 'MSFT']);
  const [correlationData, setCorrelationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocks = await getAvailableStocks();
        setAvailableStocks(stocks);
      } catch (err) {
        console.error("Error loading available stocks:", err);
        setError("Failed to load stock options. Please refresh the page.");
      }
    };
    
    loadStocks();
  }, []);
  
  useEffect(() => {
    if (selectedStocks[0] && selectedStocks[1]) {
      loadCorrelationData();
    }
  }, [timeInterval, selectedStocks]);
  
  const loadCorrelationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStockCorrelation(selectedStocks[0], selectedStocks[1], timeInterval);
      setCorrelationData(data);
    } catch (error) {
      console.error("Error fetching correlation data:", error);
      setError("Failed to fetch correlation data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeIntervalChange = (event) => {
    setTimeInterval(event.target.value);
  };
  
  const handleStockChange = (index) => (event) => {
    const newSelectedStocks = [...selectedStocks];
    newSelectedStocks[index] = event.target.value;
    setSelectedStocks(newSelectedStocks);
  };
  
  const handleRefresh = () => {
    loadCorrelationData();
  };

  const handleChartClick = (event, data) => {
    if (data) {
      setSelectedPoint(data);
    }
  };
  
  const getChartData = () => {
    if (!correlationData || !correlationData.stocks) return { stock1Data: [], stock2Data: [], xLabels: [] };
    
    const stock1 = correlationData.stocks[selectedStocks[0]];
    const stock2 = correlationData.stocks[selectedStocks[1]];
    
    if (!stock1 || !stock2 || !stock1.priceHistory || !stock2.priceHistory) {
      return { stock1Data: [], stock2Data: [], xLabels: [] };
    }
    
    if (stock1.priceHistory.length === 0 || stock2.priceHistory.length === 0) {
      return { stock1Data: [], stock2Data: [], xLabels: [] };
    }
    
    try {
      
      const stock1Max = Math.max(...stock1.priceHistory.map(item => item.price));
      const stock2Max = Math.max(...stock2.priceHistory.map(item => item.price));
      
      const minLength = Math.min(stock1.priceHistory.length, stock2.priceHistory.length);
      
      
      const stock1Data = stock1.priceHistory.slice(0, minLength).map(item => (item.price / stock1Max) * 100);
      const stock2Data = stock2.priceHistory.slice(0, minLength).map(item => (item.price / stock2Max) * 100);
      
      
      const xLabels = stock1.priceHistory.slice(0, minLength).map(item => 
        new Date(item.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      
      
      const rawPrices1 = stock1.priceHistory.slice(0, minLength).map(item => item.price);
      const rawPrices2 = stock2.priceHistory.slice(0, minLength).map(item => item.price);
      
      return { stock1Data, stock2Data, xLabels, rawPrices1, rawPrices2 };
    } catch (error) {
      console.error("Error preparing chart data:", error);
      return { stock1Data: [], stock2Data: [], xLabels: [] };
    }
  };
  
  
  const getCorrelationColor = (correlation) => {
    if (correlation === undefined || correlation === null) return 'text.primary';
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation > 0.7) return 'success.main';
    if (absCorrelation > 0.3) return 'warning.main'; 
    return 'error.main'; 
  };
  
 
  const getCorrelationDescription = (correlation) => {
    if (correlation === undefined || correlation === null) return 'No correlation data available';
    const absCorrelation = Math.abs(correlation);
    const direction = correlation >= 0 ? 'positive' : 'negative';
    
    if (absCorrelation > 0.7) return `Strong ${direction} correlation`;
    if (absCorrelation > 0.3) return `Moderate ${direction} correlation`;
    return `Weak ${direction} correlation`;
  };
  
  
  const hasValidCorrelation = correlationData && 
    typeof correlationData.correlation === 'number' && 
    !isNaN(correlationData.correlation);
  
 
  const { stock1Data, stock2Data, xLabels, rawPrices1, rawPrices2 } = getChartData();
  const hasChartData = stock1Data.length > 0 && stock2Data.length > 0;
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Stock Price Correlation Analysis</Typography>
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
              <Typography variant="h6">Select Stocks to Compare</Typography>
              
              <Box sx={{ mb: 2, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="stock-1-label">First Stock</InputLabel>
                  <Select
                    labelId="stock-1-label"
                    value={selectedStocks[0]}
                    label="First Stock"
                    onChange={handleStockChange(0)}
                  >
                    {availableStocks.map(stock => (
                      <MenuItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="stock-2-label">Second Stock</InputLabel>
                  <Select
                    labelId="stock-2-label"
                    value={selectedStocks[1]}
                    label="Second Stock"
                    onChange={handleStockChange(1)}
                  >
                    {availableStocks.map(stock => (
                      <MenuItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Typography variant="h6">Time Interval</Typography>
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
              
              {!loading && hasValidCorrelation && (
                <Box sx={{ mt: 3 }} className="info-section">
                  <Typography variant="h6">Correlation Analysis</Typography>
                  <Typography variant="h4" color={getCorrelationColor(correlationData.correlation)}>
                    {correlationData.correlation.toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    {getCorrelationDescription(correlationData.correlation)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Correlation ranges from -1 to 1, where:
                  </Typography>
                  <Typography variant="body2">
                    • 1: Perfect positive correlation
                  </Typography>
                  <Typography variant="body2">
                    • 0: No correlation
                  </Typography>
                  <Typography variant="body2">
                    • -1: Perfect negative correlation
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Normalized Price Comparison</Typography>
              <Typography variant="body2" gutterBottom>
                (Prices normalized to 0-100% scale for better comparison)
              </Typography>
              <Box sx={{ height: 400 }} className="chart-container">
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : hasChartData ? (
                  <LineChart
                    height={400}
                    series={[
                      {
                        data: stock1Data,
                        label: selectedStocks[0],
                        color: '#8884d8',
                      },
                      {
                        data: stock2Data,
                        label: selectedStocks[1],
                        color: '#82ca9d',
                      },
                    ]}
                    xAxis={[
                      {
                        data: xLabels,
                        scaleType: 'point',
                      },
                    ]}
                    onClick={handleChartClick}
                    axisHighlight={{
                      y: 'none',
                      x: 'line',
                    }}
                    leftAxis={{
                      label: 'Normalized Price (%)',
                    }}
                    sx={{
                      '.MuiLineElement-root': {
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
              
              {selectedPoint && !loading && hasChartData && selectedPoint.dataIndex >= 0 && (
                <Box sx={{ mt: 2 }} className="info-section">
                  <Typography variant="subtitle1">Selected Point:</Typography>
                  <Typography>
                    Time: {xLabels[selectedPoint.dataIndex]}
                  </Typography>
                  <Typography color="#8884d8">
                    {selectedStocks[0]}: ${rawPrices1 && rawPrices1[selectedPoint.dataIndex]?.toFixed(2)}
                  </Typography>
                  <Typography color="#82ca9d">
                    {selectedStocks[1]}: ${rawPrices2 && rawPrices2[selectedPoint.dataIndex]?.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StockCorrelation; 