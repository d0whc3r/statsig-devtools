async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...')

  // Clean up any resources, stop servers, etc.
  console.log('✅ E2E teardown complete')
}

export default globalTeardown
