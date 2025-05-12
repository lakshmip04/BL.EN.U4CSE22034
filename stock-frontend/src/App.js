import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import StockPage from './pages/StockPage';
import StockCorrelation from './pages/StockCorrelation';

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Stock Analyzer
            </Typography>
            <Button color="inherit" href="/">Home</Button>
            <Button color="inherit" href="/stocks">Stocks</Button>
            <Button color="inherit" href="/correlation">Correlation</Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/stocks" element={<StockPage />} />
            <Route path="/correlation" element={<StockCorrelation />} />
            <Route path="/" element={
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  Welcome to Stock Analyzer
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    href="/stocks"
                  >
                    View Stocks
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    href="/correlation"
                  >
                    Analyze Correlation
                  </Button>
                </Box>
              </Box>
            } />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}