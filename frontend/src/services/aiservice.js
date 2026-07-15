// Enhanced AI Service - Personalized reasoning with wallet context

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

  // Generate personalized risk explanation with context
  async generateExplanation(risk, walletAddress, walletData) {
    console.log('🤖 Generating personalized AI explanation...')
    
    // Extract wallet context
    const balance = walletData?.balances?.[0]?.balance || 0
    const hasBalance = balance > 0
    
    // If no API key, use enhanced fallback
    if (!this.isEnabled || !this.apiKey) {
      return this.getEnhancedFallback(risk, walletData)
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
            content: `You are VaultIQ, a trusted AI financial advisor for Web3. 
                      You analyze wallet risks and provide specific, actionable recommendations.
                      Consider the user's wallet context in your response.
                      Be concise, professional, and data-driven.`
          },
          {
            role: 'user',
            content: this.buildContext(risk, walletData)
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })

      const explanation = response.choices[0].message.content
      
      return {
        explanation: explanation,
        confidence: this.calculateConfidence(risk, walletData),
        impactReduction: this.calculateImpactReduction(risk),
        isPersonalized: true,
        context: {
          balance: balance,
          hasBalance: hasBalance
        }
      }

    } catch (error) {
      console.error('AI Error:', error)
      return this.getEnhancedFallback(risk, walletData)
    }
  }

  // Build context-aware prompt
  buildContext(risk, walletData) {
    const balance = walletData?.balances?.[0]?.balance || 0
    const balanceStr = balance > 0 ? `${balance.toFixed(4)} OKB` : 'no OKB'
    
    return `
      Wallet Context:
      - Balance: ${balanceStr}
      
      Risk Detected:
      - Type: ${risk.type}
      - Title: ${risk.title}
      - Severity: ${risk.severity}
      - Description: ${risk.description}
      - Impact: ${risk.impact}
      
      Generate a personalized recommendation that considers the user's wallet context.
      ${balance > 0 ? 'The user has funds available to take action.' : 'The user has minimal funds - focus on monitoring.'}
    `
  }

  // Enhanced fallback with context
  getEnhancedFallback(risk, walletData) {
    const balance = walletData?.balances?.[0]?.balance || 0
    const balanceStr = balance > 0 ? `${balance.toFixed(4)} OKB` : 'no OKB'
    
    const messages = {
      'market': {
        explanation: `📊 Market risk detected with ${balanceStr} in wallet. ${balance > 0 ? 'Consider adjusting positions to protect your funds.' : 'Monitor market conditions for optimal entry points.'}`,
        confidence: 85,
        impactReduction: '75%'
      },
      'approval': {
        explanation: `⚠️ Unlimited approval detected with ${balanceStr} at risk. ${balance > 0 ? 'Revoke this approval immediately to secure your funds.' : 'Revoke approval to prevent future risk.'}`,
        confidence: 94,
        impactReduction: '92%'
      },
      'idle': {
        explanation: `💡 ${balance > 0 ? `You have ${balanceStr} that could be earning yield.` : 'No idle funds detected.'} Consider staking for passive income.`,
        confidence: 88,
        impactReduction: '85%'
      },
      'gas': {
        explanation: `⛽ Gas optimization could save you ${balance > 0 ? '~$47/month' : 'future fees'}. ${balance > 0 ? 'Optimize now to maximize value.' : 'Set up optimization for when you have funds.'}`,
        confidence: 82,
        impactReduction: '78%'
      }
    }
    
    return messages[risk.type] || {
      explanation: `📊 ${risk.title}: ${risk.description}`,
      confidence: 80,
      impactReduction: '85%'
    }
  }

  // Calculate confidence score
  calculateConfidence(risk, walletData) {
    let confidence = 85
    if (risk.type === 'approval') confidence += 5
    if (risk.type === 'liquidation') confidence += 3
    if (risk.severity === 'critical') confidence += 5
    if (walletData?.balances?.length > 0) confidence += 5
    return Math.min(confidence, 99)
  }

  // Calculate impact reduction
  calculateImpactReduction(risk) {
    const reductions = {
      'approval': '92%',
      'liquidation': '87%',
      'idle': '85%',
      'gas': '78%',
      'market': '75%',
      'opportunity': '70%'
    }
    return reductions[risk.type] || '85%'
  }
}

const aiService = new AIService()
export default aiService