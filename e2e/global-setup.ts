import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function globalSetup() {
  console.log('🚀 Starting E2E test setup...')

  // Build the extension for testing
  console.log('📦 Building extension for Chrome...')
  await execAsync('npm run build')

  console.log('📦 Building extension for Firefox...')
  await execAsync('npm run build:firefox')

  // Start mock API server
  console.log('🔧 Starting mock API server...')
  await startMockApiServer()

  console.log('✅ E2E setup complete')
}

async function startMockApiServer() {
  // This would start a mock server for Statsig APIs
  // For now, we'll use route interception in tests
  console.log('Mock API server ready (using route interception)')
}

export default globalSetup
