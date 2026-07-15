// AI Service - Personalizes based on REAL wallet data

class AIService {
  constructor() {
    this.apiKey = null
    this.isEnabled = false
  }

  initialize(apiKey) {
    this.apiKey = apiKey
    this.isEnabled = true
    console.log('🤖 AI Service initialized')
    return true
  }

  async generateExplanation(risk, walletAddress, walletData) {
    console.log('🤖 Generating personalized AI explanation...')
    
    const balance = walletData?.balances?.[0]?.balance || 0
    const hasBalance = balance > 0
    
    // ✅ ALWAYS use real wallet data
    const context = this.buildPersonalizedContext(risk, walletData)
    
    if (!this.isEnabled || !this.apiKey) {
      return this.getPersonalizedFallback(risk, walletData)
    }

    try {
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      })

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are VaultIQ, an AI financial advisor. Analyze the wallet data and provide specific, personalized recommendations.`
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })

      return {
        explanation: response.choices[0].message.content,
        confidence: this.calculateConfidence(risk, walletData),
        impactReduction: this.calculateImpactReduction(risk),
        isPersonalized: true
      }

    } catch (error) {
      console.error('AI Error:', error)
      return this.getPersonalizedFallback(risk, walletData)
    }
  }

  buildPersonalizedContext(risk, walletData) {
    const balance = walletData?.balances?.[0]?.balance || 0
    const balanceStr = balance > 0 ? `${balance.toFixed(4)} OKB` : 'no OKB'
    const tokens = walletData?.tokens?.map(t => t.symbol).join(', ') || 'none'
    
    return `
      Wallet Data:
      - Balance: ${balanceStr}
      - Tokens: ${tokens}
      
      Risk:
      - Type: ${risk.type}
      - Title: ${risk.title}
      - Severity: ${risk.severity}
      - Description: ${risk.description}
      
      Generate a specific, actionable recommendation for THIS wallet.
    `
  }

  getPersonalizedFallback(risk, walletData) {
    const balance = walletData?.balances?.[0]?.balance || 0
    const balanceStr = balance > 0 ? `${balance.toFixed(4)} OKB` : 'no OKB'
    
    const messages = {
      'market': {
        explanation: `📊 Market risk with ${balanceStr} in wallet. ${balance > 0 ? 'Consider adjusting positions.' : 'Monitor for entry points.'}`,
        confidence: 85,
        impactReduction: '75%'
      },
      'approval': {
        explanation: `⚠️ Unlimited approval with ${balanceStr} at risk. Revoke immediately to secure funds.`,
        confidence: 94,
        impactReduction: '92%'
      },
      'idle': {
        explanation: `💡 ${balance > 0 ? `${balanceStr} can earn yield.` : 'No idle funds.'} Stake for passive income.`,
        confidence: 88,
        impactReduction: '85%'
      }
    }
    
    return messages[risk.type] || {
      explanation: `📊 ${risk.title}: ${risk.description}`,
      confidence: 80,
      impactReduction: '85%'
    }
  }

  calculateConfidence(risk, walletData) {
    let confidence = 85
    if (risk.type === 'approval') confidence += 5
    if (risk.severity === 'critical') confidence += 5
    if (walletData?.balances?.length > 0) confidence += 5
    return Math.min(confidence, 99)
  }

  calculateImpactReduction(risk) {
    const reductions = {
      'approval': '92%',
      'liquidation': '87%',
      'idle': '85%',
      'gas': '78%',
      'market': '75%'
    }
    return reductions[risk.type] || '85%'
  }
}

const aiService = new AIService()
export default aiService