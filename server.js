const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://egbujor-emmanuel.github.io',
    process.env.FRONTEND_URL || '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json());

// ============================================
// ASP AUTHENTICATION
// ============================================

const ASP_API_KEY = process.env.ASP_API_KEY || 'vaultiq-asp-key-2026'

const authenticateASP = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey
  if (!apiKey || apiKey !== ASP_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Valid API key required'
    })
  }
  next()
}

// ============================================
// ASP ENDPOINTS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'VaultIQ ASP is alive!',
    version: '1.0.0',
    agentId: process.env.AGENT_ID || 'agent_mrllmb7z',
    aspId: process.env.ASP_ID || 'asp_mrllmb7z'
  })
})

// ASP Analyze Endpoint
app.post('/api/analyze', authenticateASP, async (req, res) => {
  try {
    const { address, chainId = '1952' } = req.body
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Address is required'
      })
    }

    console.log(`📊 Analyzing wallet: ${address} on chain: ${chainId}`)

    // Fetch real market data
    const priceResponse = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT')
    const priceData = await priceResponse.json()
    
    const prices = {}
    if (priceData.code === '0' && priceData.data) {
      priceData.data.forEach(ticker => {
        prices[ticker.instId] = parseFloat(ticker.last)
      })
    }

    const risks = []
    
    if (prices['BTC-USDT'] > 60000) {
      risks.push({
        id: Date.now().toString() + '1',
        type: 'market',
        severity: 'medium',
        title: `Bitcoin at $${prices['BTC-USDT'].toLocaleString()}`,
        impact: 'High volatility',
        action: 'monitor'
      })
    }
    
    if (prices['ETH-USDT'] > 3000) {
      risks.push({
        id: Date.now().toString() + '2',
        type: 'market',
        severity: 'medium',
        title: `Ethereum at $${prices['ETH-USDT'].toLocaleString()}`,
        impact: 'Monitor for volatility',
        action: 'monitor'
      })
    }

    if (prices['OKB-USDT']) {
      risks.push({
        id: Date.now().toString() + '3',
        type: 'opportunity',
        severity: 'low',
        title: `OKB at $${prices['OKB-USDT'].toFixed(2)}`,
        impact: 'Ecosystem token',
        action: 'monitor'
      })
    }

    res.json({
      success: true,
      data: {
        risks: risks,
        summary: {
          total: risks.length,
          critical: 0,
          high: 0,
          medium: risks.length,
          low: 0
        },
        marketData: {
          btc: prices['BTC-USDT'],
          eth: prices['ETH-USDT'],
          okb: prices['OKB-USDT']
        },
        timestamp: new Date().toISOString()
      },
      metadata: {
        agentId: process.env.AGENT_ID || 'agent_mrllmb7z',
        aspId: process.env.ASP_ID || 'asp_mrllmb7z',
        source: 'REAL OKX Data'
      }
    })

  } catch (error) {
    console.error('❌ Analysis error:', error)
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'Analysis failed'
    })
  }
})

// ASP Resolve Endpoint
app.post('/api/resolve', authenticateASP, async (req, res) => {
  try {
    const { riskId, action } = req.body
    
    if (!riskId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'riskId is required'
      })
    }

    console.log(`🔧 Resolving risk: ${riskId}`)

    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    res.json({
      success: true,
      data: {
        riskId: riskId,
        status: 'resolved',
        transactionHash: txHash,
        resolvedAt: new Date().toISOString()
      },
      metadata: {
        agentId: process.env.AGENT_ID || 'agent_mrllmb7z',
        aspId: process.env.ASP_ID || 'asp_mrllmb7z'
      }
    })

  } catch (error) {
    console.error('❌ Resolve error:', error)
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'Resolution failed'
    })
  }
})

// ============================================
// PAYMENT ENDPOINTS
// ============================================

app.post('/api/payment/create', authenticateASP, async (req, res) => {
  try {
    const { amount = '0.01', currency = 'OKB', payer, metadata } = req.body
    
    const paymentId = 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)
    
    res.json({
      success: true,
      data: {
        id: paymentId,
        amount: amount,
        currency: currency,
        payer: payer || 'unknown',
        payee: process.env.ASP_ID || 'asp_mrllmb7z',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Payment creation error:', error)
    res.status(500).json({
      success: false,
      error: 'PAYMENT_ERROR',
      message: error.message
    })
  }
})

// ============================================
// SERVE STATIC FRONTEND (for Railway)
// ============================================

// Serve frontend static files from dist folder
const distPath = path.join(__dirname, 'frontend', 'dist')
app.use(express.static(distPath))

// Catch-all route to serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ VaultIQ ASP running on http://localhost:${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Agent ID: ${process.env.AGENT_ID || 'agent_mrllmb7z'}`)
  console.log(`🔐 ASP ID: ${process.env.ASP_ID || 'asp_mrllmb7z'}`)
})