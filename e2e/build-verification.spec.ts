import { ExtensionVerification } from './fixtures/extension-verification'

import { test } from '@playwright/test'

/**
 * Extension Build Verification Tests
 * Tests that verify the extension is built correctly and ready for installation
 */

test.describe('Extension Build Verification', () => {
  test('should verify extension files and structure', async () => {
    console.log('🔍 Starting extension build verification...')

    // Verify complete extension build
    await ExtensionVerification.verifyCompleteExtension()

    // Get and log build info
    const buildInfo = await ExtensionVerification.getExtensionBuildInfo()
    console.log('📋 Extension Build Info:')
    console.log(`   Name: ${buildInfo.name}`)
    console.log(`   Version: ${buildInfo.version}`)
    console.log(`   Manifest Version: ${buildInfo.manifestVersion}`)
    console.log(`   Permissions: ${buildInfo.permissions.join(', ')}`)
    console.log(`   Host Permissions: ${buildInfo.hostPermissions.join(', ')}`)

    console.log('🎉 Extension build verification completed successfully!')
  })

  test('should verify Firefox extension if available', async () => {
    console.log('🦊 Checking Firefox extension build...')

    const firefoxExists = await ExtensionVerification.verifyFirefoxExtension()

    if (firefoxExists) {
      console.log('✅ Firefox extension verified')
    } else {
      console.log('ℹ️ Firefox extension not built (optional)')
    }

    console.log('🎉 Firefox extension check completed!')
  })

  test('should verify extension is ready for installation', async () => {
    console.log('🚀 Verifying extension installation readiness...')

    // Verify all critical components
    await ExtensionVerification.verifyExtensionFilesExist()
    await ExtensionVerification.verifyManifestStructure()
    await ExtensionVerification.verifyContentScripts()

    // Get build info to ensure everything is configured
    const buildInfo = await ExtensionVerification.getExtensionBuildInfo()

    // Verify critical permissions are present
    const criticalPermissions = ['storage', 'activeTab', 'cookies']
    const missingPermissions = criticalPermissions.filter((perm) => !buildInfo.permissions.includes(perm))

    if (missingPermissions.length > 0) {
      throw new Error(`Missing critical permissions: ${missingPermissions.join(', ')}`)
    }

    // Verify host permissions
    if (!buildInfo.hostPermissions.includes('<all_urls>')) {
      throw new Error('Missing <all_urls> host permission')
    }

    console.log('✅ Extension is ready for installation')
    console.log('✅ All critical permissions configured')
    console.log('✅ Host permissions configured')
    console.log('✅ All required files present')

    console.log('🎉 Extension installation readiness verified!')
  })
})
