// AI Service - Handles OpenAI integration
// OpenAI is imported dynamically to avoid build issues

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

  // Generate explanation using OpenAI (dynamic import)
  async generateExplanation(risk, walletAddress, walletData) {
    console.log('🤖 Generating AI explanation...')
    
    if (!this.isEnabled || !this.apiKey) {
      return this.getFallbackExplanation(risk, walletData)
    }

    try {
      // Dynamic import for OpenAI (only loads when needed)
      const { default: OpenAI } = await import('openai')
      
      const openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      })

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are VaultIQ, an AI financial advisor for Web3. Provide concise, actionable advice.`
          },
          {
            role: 'user',
            content: this.buildPrompt(risk, walletData)
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })

      return {
        explanation: response.choices[0].message.content,
        confidence: 85,
        impactReduction: '85%',
        isPersonalized: true
      }

    } catch (error) {
      console.error('AI Error:', error)
      return this.getFallbackExplanation(risk, walletData)
    }
  }

  buildPrompt(risk, walletData) {
    const balance = walletData?.balances?.[0]?.balance || 0
    return `
      Risk: ${risk.title}
      Description: ${risk.description}
      Wallet Balance: ${balance} OKB
      
      Provide a brief, actionable recommendation.
    `
  }

  getFallbackExplanation(risk, walletData) {
    const balance = walletData?.balances?.[0]?.balance || 0
    const balanceStr = balance > 0 ? `${balance.toFixed(4)} OKB` : 'no OKB'
    
    const messages = {
      'market': {
        explanation: `📊 Market risk detected with ${balanceStr} in wallet. ${balance > 0 ? 'Consider adjusting positions.' : 'Monitor market conditions.'}`,
        confidence: 85,
        impactReduction: '75%'
      },
      'approval': {
        explanation: `⚠️ Unlimited approval detected with ${balanceStr} at risk. ${balance > 0 ? 'Revoke this approval immediately.' : 'Revoke approval to prevent future risk.'}`,
        confidence: 94,
        impactReduction: '92%'
      },
      'idle': {
        explanation: `💡 ${balance > 0 ? `You have ${balanceStr} that could be earning yield.` : 'No idle funds detected.'}`,
        confidence: 88,
        impactReduction: '85%'
      },
      'gas': {
        explanation: `⛽ Gas optimization could save you ${balance > 0 ? '~$47/month' : 'future fees'}.`,
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
}

const aiService = new AIService()
export default aiService