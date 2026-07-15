// Guardian Engine - Uses ONLY REAL OKX data, no mock fallback

import onchainService from './onchainService'

class Guardian {
  constructor(wallet) {
    this.wallet = wallet
    this.risks = []
    this.isRealData = false
    this.riskIdCounter = 0
    this.marketData = null
  }

  generateId() {
    this.riskIdCounter += 1
    return Date.now() * 1000 + this.riskIdCounter
  }

  async scanWallet() {
    console.log('🔍 Guardian analyzing vault with REAL OKX data...')
    
    try {
      // Fetch real market data - throws error if fails
      const prices = await onchainService.getPrices()
      if (!prices || prices.length === 0) {
        throw new Error('No market data received')
      }
      
      this.marketData = prices
      console.log('📊 Real market data received:', prices.length, 'tokens')
      
      // Fetch real wallet data - throws error if fails
      const data = await onchainService.scanWallet(this.wallet.address)
      if (!data || !data.isReal) {
        throw new Error('No real wallet data received')
      }
      
      this.isRealData = true
      
      // Generate risks ONLY from real data
      this.risks = this.generateRisksFromRealData(prices, data)
      
      // Ensure unique IDs
      this.risks = this.risks.map(risk => ({
        ...risk,
        id: risk.id || this.generateId(),
        isReal: true
      }))
      
      const timeline = this.generateTimelineFromMarketData(prices)
      
      return {
        risks: this.risks,
        timeline: timeline,
        summary: this.generateSummary(),
        marketData: prices,
        isRealData: true,
        message: '✅ Using REAL OKX market data'
      }
      
    } catch (error) {
      console.error('❌ Guardian analysis failed:', error)
      // ✅ NO MOCK FALLBACK - throw error
      throw new Error('Real data unavailable: ' + error.message)
    }
  }

  generateRisksFromRealData(prices, walletData) {
    const risks = []
    
    if (!prices || prices.length === 0) return risks
    
    const addedSymbols = new Set()
    
    prices.forEach(price => {
      const symbol = price.symbol || ''
      const currentPrice = price.price || 0
      const change24h = price.change24h || 0
      
      if (!currentPrice || currentPrice <= 0) return
      
      // BTC
      if (symbol.includes('BTC') && !addedSymbols.has('BTC')) {
        addedSymbols.add('BTC')
        risks.push({
          id: this.generateId(),
          type: 'market',
          severity: currentPrice > 60000 ? 'medium' : 'low',
          title: `Bitcoin (BTC) at $${currentPrice.toLocaleString()}`,
          description: `Real-time BTC price from OKX: $${currentPrice.toLocaleString()} (${change24h > 0 ? '+' : ''}${change24h.toFixed(1)}% 24h)`,
          impact: `$${currentPrice.toFixed(0)}`,
          protocol: 'OKX',
          action: 'monitor',
          token: 'BTC',
          amount: currentPrice,
          isReal: true
        })
      }
      
      // ETH
      if (symbol.includes('ETH') && !addedSymbols.has('ETH')) {
        addedSymbols.add('ETH')
        risks.push({
          id: this.generateId(),
          type: 'market',
          severity: currentPrice > 3000 ? 'medium' : 'low',
          title: `Ethereum (ETH) at $${currentPrice.toLocaleString()}`,
          description: `Real-time ETH price from OKX: $${currentPrice.toLocaleString()} (${change24h > 0 ? '+' : ''}${change24h.toFixed(1)}% 24h)`,
          impact: `$${currentPrice.toFixed(0)}`,
          protocol: 'OKX',
          action: 'monitor',
          token: 'ETH',
          amount: currentPrice,
          isReal: true
        })
      }
      
      // OKB
      if (symbol.includes('OKB') && !addedSymbols.has('OKB')) {
        addedSymbols.add('OKB')
        risks.push({
          id: this.generateId(),
          type: 'opportunity',
          severity: 'low',
          title: `OKB at $${currentPrice.toFixed(2)}`,
          description: `Real-time OKB price: $${currentPrice.toFixed(2)} (${change24h > 0 ? '+' : ''}${change24h.toFixed(1)}% 24h)`,
          impact: `$${currentPrice.toFixed(2)}`,
          protocol: 'OKX',
          action: 'monitor',
          token: 'OKB',
          amount: currentPrice,
          isReal: true
        })
      }
    })
    
    // Add real wallet data risks
    if (walletData.analysis && walletData.analysis.risks) {
      const existingTypes = risks.map(r => r.type)
      walletData.analysis.risks.forEach(risk => {
        if (!existingTypes.includes(risk.type)) {
          risks.push({
            ...risk,
            id: this.generateId(),
            isReal: true
          })
        }
      })
    }
    
    return risks
  }

  generateTimelineFromMarketData(prices) {
    const timeline = []
    const now = new Date()
    
    if (!prices || prices.length === 0) return timeline
    
    const btc = prices.find(p => p.symbol && p.symbol.includes('BTC'))
    if (btc && btc.price) {
      timeline.push({
        date: now.toISOString().split('T')[0],
        event: `🔵 BTC at $${btc.price.toFixed(0)} - Real-time market data`,
        risk: { severity: 'low' },
        isResolution: false
      })
    }
    
    const eth = prices.find(p => p.symbol && p.symbol.includes('ETH'))
    if (eth && eth.price) {
      timeline.push({
        date: now.toISOString().split('T')[0],
        event: `🟣 ETH at $${eth.price.toFixed(0)} - Real-time market data`,
        risk: { severity: 'low' },
        isResolution: false
      })
    }
    
    timeline.push({
      date: now.toISOString().split('T')[0],
      event: `✅ Guardian active - Real-time monitoring`,
      risk: { severity: 'low' },
      isResolution: true
    })
    
    return timeline
  }

  generateSummary() {
    return {
      total: this.risks.length,
      critical: this.risks.filter(r => r.severity === 'critical').length,
      high: this.risks.filter(r => r.severity === 'high').length,
      medium: this.risks.filter(r => r.severity === 'medium').length,
      low: this.risks.filter(r => r.severity === 'low').length
    }
  }
}

export default Guardian