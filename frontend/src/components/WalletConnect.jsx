import { useState } from 'react'
import { Wallet, CheckCircle, LogOut } from 'lucide-react'

function WalletConnect({ connectText = 'Connect Wallet', connectedText = 'Connected' }) {
  const [walletAddress, setWalletAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window.okxwallet === 'undefined') {
        setError('OKX Wallet not installed')
        setIsConnecting(false)
        return
      }

      const accounts = await window.okxwallet.request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
        window.dispatchEvent(new CustomEvent('walletConnected', { 
          detail: { address: accounts[0] } 
        }))
      } else {
        setError('No accounts found. Unlock your wallet.')
      }
      
    } catch (err) {
      console.error('Error:', err)
      setError(`❌ ${err.message || 'Failed to connect'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setIsConnected(false)
    setError(null)
    window.dispatchEvent(new CustomEvent('walletDisconnected'))
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          style={{
            padding: '8px 20px',
            background: isConnecting ? '#e9ecef' : '#0052ff',
            color: isConnecting ? '#6c757d' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isConnecting) {
              e.target.style.background = '#0037cc'
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnecting) {
              e.target.style.background = '#0052ff'
            }
          }}
        >
          {isConnecting ? (
            <>
              <span className="spinner" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={16} />
              {connectText}
            </>
          )}
        </button>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px 6px 16px',
          background: '#d4edda',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <CheckCircle size={16} color="#155724" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#155724' }}>
            {formatAddress(walletAddress)}
          </span>
          <button
            onClick={disconnectWallet}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6c757d',
              borderRadius: '4px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f5f5f5'
              e.target.style.color = '#1a1a2e'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#6c757d'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#f8d7da',
          borderRadius: '6px',
          color: '#721c24',
          fontSize: '13px'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}

export default WalletConnect