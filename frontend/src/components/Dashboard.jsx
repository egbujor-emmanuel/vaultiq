import { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Zap,
  Coins,
  TrendingUp,
  Globe,
  Wallet,
  PartyPopper
} from 'lucide-react'
import Timeline from './Timeline'
import Guardian from '../services/guardian'
import aiService from '../services/aiService'
import executionService from '../services/executionService'
import realWalletService from '../services/realWalletService'
import paymentService from '../services/paymentService'

function Dashboard() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [walletBalances, setWalletBalances] = useState([])
  const [walletChainId, setWalletChainId] = useState(null)
  const [walletNetwork, setWalletNetwork] = useState(null)
  const [isRealWallet, setIsRealWallet] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [guardian, setGuardian] = useState(null)
  const [aiExplanations, setAiExplanations] = useState({})
  const [isAiEnabled, setIsAiEnabled] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [executionResults, setExecutionResults] = useState({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isConnectingReal, setIsConnectingReal] = useState(false)
  const [allResolved, setAllResolved] = useState(false)
  const [resolvedRisks, setResolvedRisks] = useState(new Set())

  const translations = {
    en: {
      title: 'VaultIQ',
      subtitle: 'The Trust Layer for Autonomous Finance',
      connect: 'Connect Real Wallet',
      connected: 'Connected',
      scan: 'Scan My Wallet',
      scanning: 'Scanning...',
      risksFound: 'Risks Found',
      potentialSavings: 'Potential Savings',
      lastScan: 'Last Scan',
      never: 'Never',
      portfolio: 'Portfolio Value',
      walletHealth: 'Wallet Health Scanner',
      scanDescription: 'Analyze your wallet for approvals, positions, and idle assets',
      aiActive: 'AI Active',
      enableAI: 'Enable AI',
      resolving: 'Resolving...',
      resolve: 'Resolve',
      fixAll: 'Fix All',
      noRisks: 'No Risks Found',
      healthy: 'Your wallet looks healthy!',
      timeline: 'Timeline: What Would Have Happened',
      connectFirst: 'Connect Wallet to Scan',
      aiExplanation: 'AI-generated explanation',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      executed: 'Executed successfully',
      failed: 'Failed',
      tx: 'Transaction',
      resolvingSuccess: 'VaultIQ resolved',
      allResolved: 'All Risks Resolved!',
      allResolvedDesc: 'Your wallet is fully protected. Guardian is monitoring.',
      resolved: 'Resolved',
      confidence: 'Guardian Confidence',
      impactReduction: 'Impact Reduction',
      network: 'Network',
      willResolve: 'Will resolve:',
      processingPayment: 'Processing payment...',
      paymentFailed: 'Payment failed. Please try again.',
      paymentSuccess: 'Payment confirmed!'
    },
    zh: {
      title: 'VaultIQ',
      subtitle: '自主金融的信任层',
      connect: '连接真实钱包',
      connected: '已连接',
      scan: '扫描钱包',
      scanning: '扫描中...',
      risksFound: '发现风险',
      potentialSavings: '潜在节省',
      lastScan: '上次扫描',
      never: '从未',
      portfolio: '投资组合价值',
      walletHealth: '钱包健康扫描',
      scanDescription: '分析您的钱包中的授权、头寸和闲置资产',
      aiActive: 'AI 已激活',
      enableAI: '启用 AI',
      resolving: '处理中...',
      resolve: '处理',
      fixAll: '一键修复所有',
      noRisks: '未发现风险',
      healthy: '您的钱包看起来很健康！',
      timeline: '时间线：原本可能发生的情况',
      connectFirst: '请先连接钱包',
      aiExplanation: 'AI 生成的解释',
      critical: '严重',
      high: '高',
      medium: '中',
      low: '低',
      executed: '执行成功',
      failed: '失败',
      tx: '交易',
      resolvingSuccess: 'VaultIQ 已解决',
      allResolved: '所有风险已解决！',
      allResolvedDesc: '您的钱包已完全保护。Guardian 正在监控。',
      resolved: '已解决',
      confidence: 'Guardian 置信度',
      impactReduction: '影响降低',
      network: '网络',
      willResolve: '将解决：',
      processingPayment: '处理支付中...',
      paymentFailed: '支付失败。请重试。',
      paymentSuccess: '支付已确认！'
    }
  }

  const t = translations[language] || translations.en

  // Initialize Guardian when wallet connects
  useEffect(() => {
    if (walletAddress) {
      const guardianInstance = new Guardian({ address: walletAddress })
      setGuardian(guardianInstance)
      setIsInitialized(true)
      executionService.setWalletAddress(walletAddress)
      // Initialize Payment Service
      paymentService.initialize('agent_mrllmb7z', 'asp_mrllmb7z')
    } else {
      setGuardian(null)
      setScanResult(null)
      setAiExplanations({})
      setExecutionResults({})
      setIsInitialized(false)
      setAllResolved(false)
      setResolvedRisks(new Set())
    }
  }, [walletAddress])

  // Check if all risks are resolved
  useEffect(() => {
    if (scanResult && scanResult.risks && scanResult.risks.length > 0) {
      const resolvedCount = resolvedRisks.size
      const totalRisks = scanResult.risks.length
      const allResolvedCheck = resolvedCount === totalRisks && totalRisks > 0
      setAllResolved(allResolvedCheck)
    } else {
      setAllResolved(false)
    }
  }, [scanResult, resolvedRisks])

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletConnected = (event) => {
      setWalletAddress(event.detail.address)
      if (event.detail.chainId) setWalletChainId(event.detail.chainId)
      if (event.detail.balances) setWalletBalances(event.detail.balances)
      if (event.detail.network) setWalletNetwork(event.detail.network)
      setIsRealWallet(true)
      executionService.setWalletAddress(event.detail.address)
      paymentService.initialize('agent_mrllmb7z', 'asp_mrllmb7z')
    }

    const handleWalletDisconnected = () => {
      setWalletAddress(null)
      setWalletBalances([])
      setWalletChainId(null)
      setWalletNetwork(null)
      setIsRealWallet(false)
      setAllResolved(false)
      setResolvedRisks(new Set())
    }

    window.addEventListener('realWalletConnected', handleWalletConnected)
    window.addEventListener('realWalletDisconnected', handleWalletDisconnected)

    return () => {
      window.removeEventListener('realWalletConnected', handleWalletConnected)
      window.removeEventListener('realWalletDisconnected', handleWalletDisconnected)
    }
  }, [])

  const connectRealWallet = async () => {
    setIsConnectingReal(true)
    try {
      const result = await realWalletService.connect()
      setWalletAddress(result.address)
      setWalletChainId(result.chainId)
      setWalletBalances(result.balances)
      setWalletNetwork(result.network || 'X Layer Testnet')
      setIsRealWallet(true)
      setIsInitialized(true)
      executionService.setWalletAddress(result.address)
      paymentService.initialize('agent_mrllmb7z', 'asp_mrllmb7z')
      console.log('✅ Real wallet connected:', result)
    } catch (error) {
      console.error('❌ Real wallet connection failed:', error)
      alert('Failed to connect real wallet. Please make sure OKX Wallet is installed and unlocked.')
    } finally {
      setIsConnectingReal(false)
    }
  }

  const enableAI = async () => {
    const apiKey = prompt('Enter your OpenAI API key (starts with sk-):')
    if (apiKey && apiKey.startsWith('sk-')) {
      setIsAiLoading(true)
      try {
        aiService.initialize(apiKey)
        setIsAiEnabled(true)
        alert('✅ AI enabled!')
      } catch (error) {
        alert('❌ Failed to enable AI.')
      } finally {
        setIsAiLoading(false)
      }
    }
  }

  const handleScan = async () => {
    if (!guardian) {
      alert('Please connect your wallet first')
      return
    }

    setIsScanning(true)
    setScanResult(null)
    setAiExplanations({})
    setExecutionResults({})
    setAllResolved(false)
    setResolvedRisks(new Set())

    try {
      const walletData = {
        balances: walletBalances,
        tokens: []
      }
      
      const result = await guardian.scanWallet()
      setScanResult(result)

      if (isAiEnabled && result.risks && result.risks.length > 0) {
        const explanations = {}
        for (const risk of result.risks) {
          const explanation = await aiService.generateExplanation(risk, walletAddress, walletData)
          explanations[risk.id] = explanation
        }
        setAiExplanations(explanations)
      }
    } catch (error) {
      console.error('Scan failed:', error)
      alert('Scan failed. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleExecute = async (risk) => {
    if (!isInitialized) {
      alert('Please connect your wallet first')
      return
    }

    if (isResolving) return
    if (isProcessingPayment) return
    if (resolvedRisks.has(risk.id)) return

    // Step 1: Process Payment
    setIsProcessingPayment(true)
    let paymentResult = null
    
    try {
      const payment = await paymentService.createPaymentRequest({
        amount: '0.01',
        currency: 'OKB',
        payer: walletAddress,
        metadata: { riskId: risk.id, riskTitle: risk.title }
      })
      
      console.log('💳 Payment created:', payment.id)
      
      paymentResult = await paymentService.processPayment(payment.id)
      console.log('✅ Payment processed:', paymentResult)
      
    } catch (paymentError) {
      console.error('❌ Payment failed:', paymentError)
      setIsProcessingPayment(false)
      alert(t.paymentFailed)
      return
    }
    
    setIsProcessingPayment(false)

    // Step 2: Execute Resolution
    setIsResolving(true)

    try {
      const action = {
        type: risk.action || risk.type,
        token: risk.token || 'USDC',
        amount: risk.amount || '1000',
        spender: risk.spender || '0x...',
        protocol: risk.protocol || 'OKX DeFi',
        savings: risk.savings || '$47/month',
        suggestedGasPrice: '25'
      }

      console.log(`🔄 Executing resolve for risk: ${risk.id}`)
      
      const result = await executionService.executeAction(action, risk.id)
      
      console.log(`✅ Resolve result for risk ${risk.id}:`, result)
      
      // Mark as resolved
      setResolvedRisks(prev => {
        const newSet = new Set(prev)
        newSet.add(risk.id)
        return newSet
      })

      setExecutionResults(prev => ({
        ...prev,
        [risk.id]: {
          success: true,
          successMessage: `${t.resolvingSuccess}: ${risk.title}`,
          resolvedAt: new Date().toISOString(),
          transactionHash: result.transactionHash || null,
          paymentId: paymentResult?.paymentId || null
        }
      }))

    } catch (error) {
      console.error(`❌ Execution error for risk ${risk.id}:`, error)
      setExecutionResults(prev => ({
        ...prev,
        [risk.id]: {
          success: false,
          error: error.message || 'Execution failed',
          riskId: risk.id
        }
      }))
    } finally {
      setIsResolving(false)
    }
  }

  const handleFixAll = async () => {
    if (!isInitialized || !scanResult) {
      alert('Please connect your wallet and scan first')
      return
    }

    const unresolvedRisks = scanResult.risks.filter(
      risk => !resolvedRisks.has(risk.id)
    )
    
    if (unresolvedRisks.length === 0) {
      alert('All risks already resolved!')
      return
    }

    // Process payment for all unresolved risks
    setIsProcessingPayment(true)
    try {
      const payment = await paymentService.createPaymentRequest({
        amount: (0.01 * unresolvedRisks.length).toString(),
        currency: 'OKB',
        payer: walletAddress,
        metadata: { 
          riskCount: unresolvedRisks.length,
          riskIds: unresolvedRisks.map(r => r.id)
        }
      })
      
      await paymentService.processPayment(payment.id)
    } catch (paymentError) {
      console.error('❌ Payment failed:', paymentError)
      setIsProcessingPayment(false)
      alert(t.paymentFailed)
      return
    }
    setIsProcessingPayment(false)

    // Execute all resolutions
    setIsResolving(true)
    
    try {
      const actions = unresolvedRisks.map(risk => ({
        riskId: risk.id,
        action: {
          type: risk.action || risk.type,
          token: risk.token || 'USDC',
          amount: risk.amount || '1000',
          protocol: risk.protocol || 'OKX DeFi'
        }
      }))

      const result = await executionService.executeBatch(actions)
      
      // Mark all as resolved
      setResolvedRisks(prev => {
        const newSet = new Set(prev)
        unresolvedRisks.forEach(risk => newSet.add(risk.id))
        return newSet
      })

      const results = {}
      result.results.forEach(r => {
        const risk = scanResult.risks.find(risk => risk.id === r.riskId)
        results[r.riskId] = {
          success: true,
          successMessage: `${t.resolvingSuccess}: ${risk?.title || 'risk'}`
        }
      })
      setExecutionResults(prev => ({ ...prev, ...results }))

    } catch (error) {
      console.error('❌ Batch execution failed:', error)
    } finally {
      setIsResolving(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  const getSeverityText = (severity) => {
    const map = {
      critical: t.critical,
      high: t.high,
      medium: t.medium,
      low: t.low
    }
    return map[severity] || severity
  }

  const getSeverityColor = (severity) => {
    const map = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#0dcaf0'
    }
    return map[severity] || '#6c757d'
  }

  const getSeverityBg = (severity) => {
    const map = {
      critical: '#f8d7da',
      high: '#fff3cd',
      medium: '#fff3cd',
      low: '#d1ecf1'
    }
    return map[severity] || '#f8f9fa'
  }

  const getSeverityTextColor = (severity) => {
    const map = {
      critical: '#721c24',
      high: '#856404',
      medium: '#856404',
      low: '#0c5460'
    }
    return map[severity] || '#383d41'
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '16px 24px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#0052ff',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>{t.title}</h1>
            <p style={{ fontSize: '12px', color: '#6c757d' }}>{t.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleLanguage}
            style={{
              padding: '6px 12px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#1a1a2e'
            }}
          >
            <Globe size={16} />
            {language === 'en' ? '中文' : 'English'}
          </button>
          
          {!walletAddress ? (
            <button
              onClick={connectRealWallet}
              disabled={isConnectingReal}
              style={{
                padding: '8px 20px',
                background: isConnectingReal ? '#e9ecef' : '#0052ff',
                color: isConnectingReal ? '#6c757d' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isConnectingReal ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isConnectingReal) e.target.style.background = '#0037cc'
              }}
              onMouseLeave={(e) => {
                if (!isConnectingReal) e.target.style.background = '#0052ff'
              }}
            >
              {isConnectingReal ? (
                <>
                  <span className="spinner" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  {t.connect}
                </>
              )}
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: '#d4edda',
              borderRadius: '8px',
              border: '1px solid #c3e6cb'
            }}>
              <CheckCircle size={16} color="#155724" />
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#155724' }}>
                {formatAddress(walletAddress)}
              </span>
            </div>
          )}
        </div>
      </header>

      {walletAddress && (
        <div style={{
          background: '#d4edda',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #c3e6cb',
          flexWrap: 'wrap'
        }}>
          <CheckCircle size={16} color="#155724" />
          <span style={{ color: '#155724', fontWeight: 500 }}>
            {t.connected}: {formatAddress(walletAddress)}
            {walletNetwork && ` (${t.network}: ${walletNetwork})`}
            {walletChainId && ` (Chain: ${walletChainId})`}
          </span>
          {walletBalances.length > 0 && (
            <span style={{
              fontSize: '12px',
              color: '#155724',
              background: '#c3e6cb',
              padding: '2px 10px',
              borderRadius: '12px'
            }}>
              {walletBalances.map(b => `${b.balance.toFixed(4)} ${b.symbol}`).join(' | ')}
            </span>
          )}
          {allResolved && (
            <span style={{
              fontSize: '12px',
              color: '#155724',
              background: '#c3e6cb',
              padding: '2px 10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: 'auto'
            }}>
              <PartyPopper size={14} />
              All Resolved ✅
            </span>
          )}
        </div>
      )}

      {scanResult && (
        <div style={{
          padding: '8px 16px',
          marginBottom: '16px',
          borderRadius: '8px',
          background: scanResult.isRealData ? '#d4edda' : '#fff3cd',
          border: scanResult.isRealData ? '1px solid #c3e6cb' : '1px solid #ffc107',
          fontSize: '13px',
          color: scanResult.isRealData ? '#155724' : '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {scanResult.isRealData ? (
            <>
              <CheckCircle size={16} color="#155724" />
              ✅ Using REAL OKX data - {scanResult.risks?.length || 0} risks detected
            </>
          ) : (
            <>
              <AlertTriangle size={16} color="#856404" />
              ⚠️ Using simulated data - API unavailable
            </>
          )}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ fontSize: '13px', color: '#6c757d' }}>{t.portfolio}</p>
          <p style={{ fontSize: '24px', fontWeight: 700 }}>
            {walletBalances.length > 0 
              ? `$${(walletBalances.reduce((sum, b) => sum + b.balance * 3000, 0)).toFixed(0)}`
              : '$24,850'}
          </p>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ fontSize: '13px', color: '#6c757d' }}>{t.risksFound}</p>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: allResolved ? '#28a745' : (scanResult?.risks?.length > 0 ? '#dc3545' : '#28a745')
          }}>
            {allResolved ? 0 : (scanResult?.risks?.length || 0)}
          </p>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ fontSize: '13px', color: '#6c757d' }}>{t.potentialSavings}</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#0052ff' }}>
            {scanResult?.risks?.length > 0 ? '$317' : '$0'}
          </p>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ fontSize: '13px', color: '#6c757d' }}>{t.lastScan}</p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#6c757d' }}>
            {scanResult ? 'Just now' : t.never}
          </p>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid #dee2e6',
        marginBottom: '32px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <Shield size={48} color="#0052ff" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
          {allResolved ? '✅ ' + t.allResolved : t.walletHealth}
        </h2>
        <p style={{ color: '#6c757d', marginBottom: '24px' }}>
          {allResolved ? t.allResolvedDesc : t.scanDescription}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleScan}
            disabled={isScanning || !walletAddress}
            style={{
              padding: '14px 48px',
              fontSize: '16px',
              fontWeight: 600,
              background: isScanning ? '#e9ecef' : !walletAddress ? '#e9ecef' : '#0052ff',
              color: isScanning ? '#6c757d' : !walletAddress ? '#6c757d' : 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: (isScanning || !walletAddress) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isScanning ? (
              <>
                <span className="spinner" />
                {t.scanning}
              </>
            ) : !walletAddress ? (
              t.connectFirst
            ) : allResolved ? (
              `✅ ${t.resolved}`
            ) : (
              `🔍 ${t.scan}`
            )}
          </button>

          <button
            onClick={enableAI}
            disabled={isAiLoading}
            style={{
              padding: '10px 20px',
              background: isAiEnabled ? '#d4edda' : isAiLoading ? '#e9ecef' : '#f8f9fa',
              color: isAiEnabled ? '#155724' : isAiLoading ? '#6c757d' : '#6c757d',
              border: isAiEnabled ? '1px solid #c3e6cb' : '1px solid #dee2e6',
              borderRadius: '20px',
              fontSize: '13px',
              cursor: isAiLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isAiLoading ? '⏳ Loading...' : isAiEnabled ? `🤖 ${t.aiActive}` : `🤖 ${t.enableAI}`}
          </button>
        </div>
      </div>

      {allResolved && (
        <div style={{
          background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '2px solid #28a745',
          marginBottom: '32px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#155724', marginBottom: '8px' }}>
            {t.allResolved}
          </h2>
          <p style={{ fontSize: '16px', color: '#155724' }}>{t.allResolvedDesc}</p>
          <div style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '4px 16px',
              background: '#155724',
              color: 'white',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              ✅ All Risks Resolved
            </span>
            <span style={{
              padding: '4px 16px',
              background: '#155724',
              color: 'white',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              🛡️ Guardian Active
            </span>
          </div>
        </div>
      )}

      {scanResult && scanResult.risks && scanResult.risks.length > 0 && !allResolved && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
              {scanResult.risks.length} {t.risksFound}
            </h3>
            <button
              onClick={handleFixAll}
              disabled={isResolving || isProcessingPayment || !isInitialized}
              style={{
                padding: '8px 16px',
                background: (isResolving || isProcessingPayment) ? '#e9ecef' : 'transparent',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                fontSize: '14px',
                color: (isResolving || isProcessingPayment) ? '#6c757d' : '#0052ff',
                cursor: (isResolving || isProcessingPayment || !isInitialized) ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {isResolving || isProcessingPayment ? (
                <>
                  <span className="spinner" />
                  {isProcessingPayment ? t.processingPayment : 'Executing...'}
                </>
              ) : (
                `${t.fixAll} →`
              )}
            </button>
          </div>

          {scanResult.risks.map((risk) => {
            const isResolved = resolvedRisks.has(risk.id)
            const result = executionResults[risk.id]
            const aiExplanation = aiExplanations[risk.id]

            if (isResolved) return null

            return (
              <div
                key={risk.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  marginBottom: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${isResolved ? '#c3e6cb' : '#dee2e6'}`,
                  borderLeft: `4px solid ${isResolved ? '#28a745' : getSeverityColor(risk.severity)}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  opacity: isResolved ? 0.8 : 1
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isResolved ? '#d4edda' : getSeverityBg(risk.severity),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: isResolved ? '#155724' : getSeverityTextColor(risk.severity)
                }}>
                  {isResolved ? (
                    <CheckCircle size={24} />
                  ) : risk.severity === 'critical' ? (
                    <AlertTriangle size={24} />
                  ) : risk.severity === 'high' ? (
                    <TrendingUp size={24} />
                  ) : risk.severity === 'medium' ? (
                    <Coins size={24} />
                  ) : (
                    <Zap size={24} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1a1a2e',
                        marginBottom: '4px'
                      }}>
                        {risk.title}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        background: '#f8f9fa',
                        padding: '2px 10px',
                        borderRadius: '4px'
                      }}>
                        {risk.type || 'Unknown'}
                      </span>
                    </div>
                    <span style={{
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: getSeverityBg(risk.severity),
                      color: getSeverityTextColor(risk.severity),
                      textTransform: 'uppercase'
                    }}>
                      {getSeverityText(risk.severity)}
                    </span>
                  </div>

                  {/* Show what VaultIQ will do */}
                  <div style={{
                    margin: '8px 0',
                    padding: '8px 12px',
                    background: '#f0f7ff',
                    borderRadius: '6px',
                    borderLeft: '3px solid #0052ff',
                    fontSize: '13px',
                    color: '#1a1a2e'
                  }}>
                    <strong>{t.willResolve}</strong> {risk.action || 'Monitor and secure'}
                  </div>

                  {isAiEnabled && aiExplanation ? (
                    <div>
                      <div style={{
                        margin: '8px 0',
                        padding: '12px 14px',
                        background: '#f0f7ff',
                        borderRadius: '8px',
                        borderLeft: '3px solid #0052ff'
                      }}>
                        <p style={{ color: '#1a1a2e', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                          💡 {aiExplanation.explanation}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        flexWrap: 'wrap'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#6c757d' }}>{t.confidence}</span>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0052ff' }}>
                            {aiExplanation.confidence || 85}%
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#6c757d' }}>{t.impactReduction}</span>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#28a745' }}>
                            {aiExplanation.impactReduction || '85%'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#495057', margin: '8px 0', fontSize: '14px', lineHeight: 1.6 }}>
                      {risk.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <span style={{
                      fontWeight: 600,
                      color: getSeverityColor(risk.severity)
                    }}>
                      💰 {risk.impact || 'Action required'}
                    </span>
                    <button
                      onClick={() => handleExecute(risk)}
                      disabled={isResolving || isProcessingPayment || !isInitialized}
                      style={{
                        padding: '8px 20px',
                        background: (isResolving || isProcessingPayment) ? '#e9ecef' : '#0052ff',
                        color: (isResolving || isProcessingPayment) ? '#6c757d' : 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: (isResolving || isProcessingPayment || !isInitialized) ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isResolving && !isProcessingPayment && isInitialized) {
                          e.target.style.background = '#0037cc'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isResolving && !isProcessingPayment && isInitialized) {
                          e.target.style.background = '#0052ff'
                        }
                      }}
                    >
                      {isResolving ? (
                        <>
                          <span className="spinner" />
                          {t.resolving}
                        </>
                      ) : isProcessingPayment ? (
                        <>
                          <span className="spinner" />
                          {t.processingPayment}
                        </>
                      ) : (
                        <>
                          {t.resolve} →
                        </>
                      )}
                    </button>
                  </div>

                  {result && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: result.success ? '#d4edda' : '#f8d7da',
                      border: result.success ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                    }}>
                      {result.success ? (
                        <span style={{ color: '#155724', fontSize: '13px' }}>
                          ✅ {result.successMessage || t.executed}
                          {result.transactionHash && (
                            <span style={{ fontSize: '11px', display: 'block', marginTop: '2px', color: '#6c757d' }}>
                              TX: {result.transactionHash.slice(0, 20)}...
                            </span>
                          )}
                          {result.paymentId && (
                            <span style={{ fontSize: '11px', display: 'block', marginTop: '2px', color: '#6c757d' }}>
                              💳 Payment: {result.paymentId}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: '#721c24', fontSize: '13px' }}>
                          ❌ {t.failed}: {result.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <Timeline events={scanResult.timeline || []} />
        </div>
      )}

      {scanResult && scanResult.risks && scanResult.risks.length === 0 && !allResolved && (
        <div style={{
          background: '#d4edda',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #c3e6cb'
        }}>
          <CheckCircle size={48} color="#155724" />
          <h3 style={{ marginTop: '16px', color: '#155724' }}>✅ {t.noRisks}</h3>
          <p style={{ color: '#155724' }}>{t.healthy}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard