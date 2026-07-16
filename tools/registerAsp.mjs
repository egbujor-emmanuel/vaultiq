import registrationService from '../frontend/src/services/registrationService.js'

async function main() {
  const apiKey = process.env.OKX_API_KEY
  const secretKey = process.env.OKX_SECRET_KEY
  const passphrase = process.env.OKX_PASSPHRASE

  if (!apiKey || !secretKey || !passphrase) {
    console.error('Missing OKX env vars')
    process.exit(2)
  }

  registrationService.initialize(apiKey, secretKey, passphrase)
  try {
    const res = await registrationService.registerVaultIQ()
    console.log('Registration result:')
    console.log(JSON.stringify(res, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('Registration failed:', err)
    process.exit(1)
  }
}

main()
