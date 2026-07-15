// Real Wallet Service - Fetches REAL wallet data on X Layer testnet (Chain ID: 1952)

class RealWalletService {
  constructor() {
    this.address = null
    this.isConnected = false
    this.balances = []
    this.chainId = '1952' // X Layer Testnet
    this.chainIdHex = '0x7a0' // 1952 in hex
    this.tokens = []
    this.networkName = 'X Layer Testnet'
  }

  // Connect to real OKX Wallet
  async connect() {
    console.log(`🔵 Connecting to real OKX Wallet...`)
    
    try {
      if (typeof window.okxwallet === 'undefined') {
        throw new Error('OKX Wallet not installed')
      }

      // STEP 1: Request account connection
      const accounts = await window.okxwallet.request({
        method: 'eth_requestAccounts'
      })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }
      
      this.address = accounts[0]
      this.isConnected = true
      
      console.log('✅ Connected to wallet:', this.address)

      // STEP 2: Add AND switch to X Layer Testnet (Chain ID: 1952)
      await this.addAndSwitchToXLayer()
      
      // STEP 3: Fetch real balances
      await this.fetchRealBalances()
      
      window.dispatchEvent(new CustomEvent('realWalletConnected', {
        detail: {
          address: this.address,
          chainId: this.chainId,
          network: this.networkName,
          balances: this.balances
        }
      }))
      
      return {
        address: this.address,
        chainId: this.chainId,
        network: this.networkName,
        balances: this.balances
      }
      
    } catch (error) {
      console.error('❌ Wallet connection failed:', error)
      throw error
    }
  }

  // Add AND Switch to X Layer Testnet (Chain ID: 1952)
  async addAndSwitchToXLayer() {
    console.log('🔄 Adding and switching to X Layer Testnet (Chain ID: 1952)...')
    
    try {
      // First, try to add the network
      await window.okxwallet.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: this.chainIdHex, // 0x7a0 for 1952
          chainName: 'X Layer Testnet',
          nativeCurrency: {
            name: 'OKB',
            symbol: 'OKB',
            decimals: 18
          },
          rpcUrls: ['https://testrpc.xlayer.tech'],
          blockExplorerUrls: ['https://www.okx.com/web3/explorer/xlayer-test']
        }]
      })
      
      console.log('✅ X Layer Testnet added (Chain ID: 1952)')
      
      // Then switch to it
      await window.okxwallet.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.chainIdHex }]
      })
      
      console.log('✅ Switched to X Layer Testnet (Chain ID: 1952)')
      
    } catch (error) {
      console.log('⚠️ Network issue:', error.message)
      
      // If already added, just try switching
      try {
        await window.okxwallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.chainIdHex }]
        })
        console.log('✅ Switched to X Layer Testnet (Chain ID: 1952)')
      } catch (switchError) {
        console.log('⚠️ Could not switch to X Layer Testnet')
        console.log('ℹ️ Please manually switch to X Layer Testnet (Chain ID: 1952) in your wallet')
      }
    }
  }

  // Fetch REAL OKB balance
  async fetchRealBalances() {
    try {
      const balanceHex = await window.okxwallet.request({
        method: 'eth_getBalance',
        params: [this.address, 'latest']
      })
      
      const balance = parseInt(balanceHex, 16) / 1e18
      this.balances = [{ symbol: 'OKB', balance: balance, chain: 'X Layer Testnet (1952)' }]
      
      console.log(`✅ Balance: ${balance} OKB on X Layer Testnet (1952)`)
      return this.balances
      
    } catch (error) {
      console.error('❌ Balance fetch failed:', error)
      this.balances = [{ symbol: 'OKB', balance: 0, chain: 'X Layer Testnet (1952)' }]
      return this.balances
    }
  }

  // Get address
  getAddress() {
    return this.address
  }

  // Disconnect
  async disconnect() {
    this.isConnected = false
    this.address = null
    this.balances = []
    console.log('👋 Wallet disconnected')
    window.dispatchEvent(new CustomEvent('realWalletDisconnected'))
  }
}

const realWalletService = new RealWalletService()
export default realWalletService