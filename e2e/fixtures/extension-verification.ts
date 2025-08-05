import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import { expect } from '@playwright/test'

/**
 * Extension verification utilities
 * Reusable functions for verifying extension build and structure
 */

export class ExtensionVerification {
  private static extensionPath = './.output/chrome-mv3'
  private static requiredFiles = ['manifest.json', 'popup.html', 'sidepanel.html', 'tab.html', 'background.js']

  /**
   * Verify all extension files exist
   */
  static async verifyExtensionFilesExist(): Promise<void> {
    console.log('🔍 Verifying extension files exist...')

    for (const file of this.requiredFiles) {
      const filePath = join(this.extensionPath, file)
      expect(existsSync(filePath)).toBe(true)
      console.log(`✅ ${file} exists`)
    }
  }

  /**
   * Verify manifest.json structure and permissions
   */
  static async verifyManifestStructure(): Promise<void> {
    console.log('🔍 Verifying manifest structure...')

    const manifestPath = join(this.extensionPath, 'manifest.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

    // Basic structure
    expect(manifest.name).toBe('Statsig DevTools')
    expect(manifest.manifest_version).toBe(3)
    expect(manifest.version).toBeDefined()
    expect(manifest.description).toBeDefined()

    // Required permissions
    const requiredPermissions = ['storage', 'activeTab', 'cookies', 'scripting']
    for (const permission of requiredPermissions) {
      expect(manifest.permissions).toContain(permission)
      console.log(`✅ Permission '${permission}' configured`)
    }

    // Host permissions
    expect(manifest.host_permissions).toContain('<all_urls>')
    console.log('✅ Host permissions configured')

    // Extension components
    expect(manifest.action).toBeDefined()
    expect(manifest.action.default_popup).toBe('popup.html')
    expect(manifest.background).toBeDefined()
    expect(manifest.background.service_worker).toBe('background.js')
    expect(manifest.side_panel).toBeDefined()
    expect(manifest.side_panel.default_path).toBe('sidepanel.html')

    console.log('✅ Manifest structure verified')
  }

  /**
   * Verify HTML files have correct structure
   */
  static async verifyHtmlStructure(): Promise<void> {
    console.log('🔍 Verifying HTML structure...')

    const htmlFiles = ['popup.html', 'sidepanel.html', 'tab.html']

    for (const htmlFile of htmlFiles) {
      const filePath = join(this.extensionPath, htmlFile)
      const content = readFileSync(filePath, 'utf8')

      // Check for React root element
      expect(content).toContain('<div id="root">')
      console.log(`✅ ${htmlFile} has React root element`)

      // Check for Statsig reference
      expect(content).toContain('Statsig')
      console.log(`✅ ${htmlFile} contains Statsig reference`)

      // Check for basic HTML structure
      expect(content).toContain('<!DOCTYPE html>')
      expect(content).toContain('<html')
      expect(content).toContain('<head>')
      expect(content).toContain('<body>')
      console.log(`✅ ${htmlFile} has valid HTML structure`)
    }
  }

  /**
   * Verify content scripts configuration
   */
  static async verifyContentScripts(): Promise<void> {
    console.log('🔍 Verifying content scripts...')

    const manifestPath = join(this.extensionPath, 'manifest.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

    expect(manifest.content_scripts).toBeDefined()
    expect(manifest.content_scripts.length).toBeGreaterThan(0)

    const contentScript = manifest.content_scripts[0]
    expect(contentScript.matches).toContain('<all_urls>')
    expect(contentScript.js).toBeDefined()
    expect(contentScript.js.length).toBeGreaterThan(0)

    console.log('✅ Content scripts configured correctly')
  }

  /**
   * Complete extension verification
   */
  static async verifyCompleteExtension(): Promise<void> {
    console.log('🔍 Starting complete extension verification...')

    await this.verifyExtensionFilesExist()
    await this.verifyManifestStructure()
    await this.verifyHtmlStructure()
    await this.verifyContentScripts()

    console.log('✅ Complete extension verification passed')
    console.log('✅ All required files present')
    console.log('✅ Manifest structure correct')
    console.log('✅ Required permissions configured')
    console.log('✅ HTML structure valid')
    console.log('✅ Content scripts configured')
  }

  /**
   * Get extension build info
   */
  static async getExtensionBuildInfo(): Promise<{
    name: string
    version: string
    manifestVersion: number
    permissions: string[]
    hostPermissions: string[]
  }> {
    const manifestPath = join(this.extensionPath, 'manifest.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

    return {
      name: manifest.name,
      version: manifest.version,
      manifestVersion: manifest.manifest_version,
      permissions: manifest.permissions || [],
      hostPermissions: manifest.host_permissions || [],
    }
  }

  /**
   * Verify Firefox extension build (if exists)
   */
  static async verifyFirefoxExtension(): Promise<boolean> {
    const firefoxPath = './.output/firefox-mv2'
    const firefoxManifestPath = join(firefoxPath, 'manifest.json')

    if (!existsSync(firefoxManifestPath)) {
      console.log('ℹ️ Firefox extension not found (optional)')
      return false
    }

    console.log('🔍 Verifying Firefox extension...')

    const manifest = JSON.parse(readFileSync(firefoxManifestPath, 'utf8'))
    expect(manifest.name).toBe('Statsig DevTools')
    expect(manifest.manifest_version).toBe(2)

    console.log('✅ Firefox extension verified')
    return true
  }
}
