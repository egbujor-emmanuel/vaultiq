import OnchainApiClient from '../frontend/src/services/onchainApiClient.js'

async function main() {
  const apiKey = process.env.OKX_API_KEY
  const secretKey = process.env.OKX_SECRET_KEY
  const passphrase = process.env.OKX_PASSPHRASE

  if (!apiKey || !secretKey || !passphrase) {
    console.error('Missing OKX env vars')
    process.exit(2)
  }

  const client = new OnchainApiClient(apiKey, secretKey, passphrase)

  try {
    console.log('Checking API by calling /asp/status/test-asp')
    const res = await client.getStatus('test-asp')
    console.log('API call result:', JSON.stringify(res, null, 2))
  } catch (err) {
    console.error('API call failed:', err.message || err)
    process.exit(1)
  }
}

main()
