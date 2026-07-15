const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json());

// ============================================
// ASP AUTHENTICATION
// ============================================

// Simple API key authentication for ASP endpoints
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
    agentId: 'agent_mrllmb7z',
    aspId: 'asp_mrllmb7z'
  })
})

// ASP Analyze Endpoint (A2MCP)
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

    // Generate risk analysis
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

    // Response in OKX ASP format
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
        agentId: 'agent_mrllmb7z',
        aspId: 'asp_mrllmb7z',
        source: 'REAL OKX Data',
        chainId: chainId
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

// ASP Resolve Endpoint (A2MCP)
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

    // Simulate resolution
    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    res.json({
      success: true,
      data: {
        riskId: riskId,
        status: 'resolved',
        transactionHash: txHash,
        resolvedAt: new Date().toISOString(),
        action: action || 'monitor'
      },
      metadata: {
        agentId: 'agent_mrllmb7z',
        aspId: 'asp_mrllmb7z'
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ VaultIQ ASP running on http://localhost:${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Agent ID: agent_mrllmb7z`)
  console.log(`🔐 ASP ID: asp_mrllmb7z`)
  console.log(`🔑 API Key: ${ASP_API_KEY}`)
})

// ============================================
// PAYMENT ENDPOINTS (A2MCP)
// ============================================

// Create payment request
app.post('/api/payment/create', authenticateASP, async (req, res) => {
  try {
    const { amount, currency, payer, metadata } = req.body
    
    // Import payment service dynamically
    const { default: paymentService } = await import('./frontend/src/services/paymentService.js')
    
    const payment = await paymentService.createPaymentRequest({
      amount: amount || '0.01',
      currency: currency || 'OKB',
      payer: payer || 'unknown',
      metadata: metadata || {}
    })
    
    res.json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString()
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

// Process payment
app.post('/api/payment/process/:paymentId', authenticateASP, async (req, res) => {
  try {
    const { paymentId } = req.params
    
    const { default: paymentService } = await import('./frontend/src/services/paymentService.js')
    
    const result = await paymentService.processPayment(paymentId)
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Payment processing error:', error)
    res.status(500).json({
      success: false,
      error: 'PAYMENT_ERROR',
      message: error.message
    })
  }
})

// Get payment status
app.get('/api/payment/status/:paymentId', authenticateASP, async (req, res) => {
  try {
    const { paymentId } = req.params
    
    const { default: paymentService } = await import('./frontend/src/services/paymentService.js')
    
    const status = await paymentService.getPaymentStatus(paymentId)
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Payment status error:', error)
    res.status(500).json({
      success: false,
      error: 'PAYMENT_ERROR',
      message: error.message
    })
  }
})