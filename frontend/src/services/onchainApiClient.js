// Onchain OS API Client - Uses your API key directly

class OnchainApiClient {
  constructor(apiKey, secretKey, passphrase) {
    this.apiKey = apiKey
    this.secretKey = secretKey
    this.passphrase = passphrase
    this.baseUrl = 'https://web3.okx.com/api/v1'
  }

  // Generate authentication headers
  getHeaders() {
    const timestamp = Date.now().toString()
    const signature = this.generateSignature(timestamp)
    
    return {
      'Content-Type': 'application/json',
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase
    }
  }

  // Generate signature (simplified for demo)
  generateSignature(timestamp) {
    // In production, use crypto.createHmac('sha256', secretKey)
    return 'simulated_signature_' + timestamp
  }

  // Register Agent Identity
  async registerAgentIdentity(name, description, role = 'asp') {
    console.log(`📝 Registering Agent Identity: ${name}`)
    
    try {
      const response = await fetch(`${this.baseUrl}/agent/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: name,
          description: description,
          role: role
        })
      })
      
      const data = await response.json()
      console.log('✅ Agent Identity registered:', data)
      return data
      
    } catch (error) {
      console.error('❌ Agent registration failed:', error)
      throw error
    }
  }

  // Register as ASP
  async registerASP(agentId, serviceName, serviceType = 'A2MCP') {
    console.log(`📝 Registering ASP: ${serviceName}`)
    
    try {
      const response = await fetch(`${this.baseUrl}/asp/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          agentId: agentId,
          name: serviceName,
          type: serviceType,
          pricing: {
            model: 'pay-per-request',
            price: '0.01',
            currency: 'OKB'
          }
        })
      })
      
      const data = await response.json()
      console.log('✅ ASP registered:', data)
      return data
      
    } catch (error) {
      console.error('❌ ASP registration failed:', error)
      throw error
    }
  }

  // Submit listing
  async submitListing(aspId, manifest) {
    console.log(`📤 Submitting listing for ASP: ${aspId}`)
    
    try {
      const response = await fetch(`${this.baseUrl}/asp/submit-listing`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          aspId: aspId,
          manifest: manifest
        })
      })
      
      const data = await response.json()
      console.log('✅ Listing submitted:', data)
      return data
      
    } catch (error) {
      console.error('❌ Listing submission failed:', error)
      throw error
    }
  }

  // Check status
  async getStatus(aspId) {
    try {
      const response = await fetch(`${this.baseUrl}/asp/status/${aspId}`, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      const data = await response.json()
      console.log('📊 Status:', data)
      return data
      
    } catch (error) {
      console.error('❌ Status check failed:', error)
      throw error
    }
  }
}

export default OnchainApiClient