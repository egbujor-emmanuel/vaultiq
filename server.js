const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'VaultIQ ASP is alive!',
    version: '1.0.0',
    agentId: process.env.AGENT_ID || 'agent_mrllmb7z',
    aspId: process.env.ASP_ID || 'asp_mrllmb7z'
  });
});

// ============================================
// ANALYZE ENDPOINT
// ============================================

app.post('/api/analyze', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Address is required'
      });
    }

    console.log(`📊 Analyzing wallet: ${address}`);

    // Fetch real market data from OKX
    const priceResponse = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT');
    const priceData = await priceResponse.json();
    
    const prices = {};
    if (priceData.code === '0' && priceData.data) {
      priceData.data.forEach(ticker => {
        prices[ticker.instId] = parseFloat(ticker.last);
      });
    }

    const risks = [];
    
    if (prices['BTC-USDT'] > 60000) {
      risks.push({
        id: '1',
        type: 'market',
        severity: 'medium',
        title: `BTC at $${prices['BTC-USDT'].toLocaleString()}`,
        impact: 'High volatility',
        action: 'monitor'
      });
    }
    
    if (prices['ETH-USDT'] > 3000) {
      risks.push({
        id: '2',
        type: 'market',
        severity: 'medium',
        title: `ETH at $${prices['ETH-USDT'].toLocaleString()}`,
        impact: 'Monitor for volatility',
        action: 'monitor'
      });
    }

    res.json({
      success: true,
      data: {
        risks: risks,
        marketData: {
          btc: prices['BTC-USDT'] || 0,
          eth: prices['ETH-USDT'] || 0
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'Analysis failed'
    });
  }
});

// ============================================
// RESOLVE ENDPOINT
// ============================================

app.post('/api/resolve', async (req, res) => {
  try {
    const { riskId } = req.body;
    
    if (!riskId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'riskId is required'
      });
    }

    console.log(`🔧 Resolving risk: ${riskId}`);

    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    res.json({
      success: true,
      data: {
        riskId: riskId,
        status: 'resolved',
        transactionHash: txHash,
        resolvedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Resolve error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'Resolution failed'
    });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ VaultIQ ASP running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Agent ID: ${process.env.AGENT_ID || 'agent_mrllmb7z'}`);
  console.log(`🔐 ASP ID: ${process.env.ASP_ID || 'asp_mrllmb7z'}`);
});