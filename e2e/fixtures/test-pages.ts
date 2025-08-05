/**
 * Test page templates for E2E testing
 * These are reusable HTML templates for different testing scenarios
 */

export const TestPages = {
  /**
   * User segmentation test page for cookie-based testing
   */
  userSegmentationPage: `
    <!DOCTYPE html>
    <html>
      <head><title>User Segmentation Test</title></head>
      <body>
        <h1>🎯 User Segmentation Test</h1>
        
        <div id="user-info" style="padding: 20px; border: 2px solid #2563eb; margin: 20px 0; border-radius: 8px;">
          <h2>Current User Tier: <span id="tier" style="color: #2563eb;">Free</span></h2>
          <p>Available Features: <span id="features">Basic only</span></p>
          <p>Cookie Value: <span id="cookie-value" style="font-family: monospace;">none</span></p>
        </div>
        
        <div style="margin: 20px 0;">
          <button id="set-premium" style="padding: 10px 20px; margin: 5px; background: #f59e0b; color: white; border: none; border-radius: 4px;">
            Set Premium User
          </button>
          <button id="set-enterprise" style="padding: 10px 20px; margin: 5px; background: #7c3aed; color: white; border: none; border-radius: 4px;">
            Set Enterprise User
          </button>
          <button id="clear-tier" style="padding: 10px 20px; margin: 5px; background: #6b7280; color: white; border: none; border-radius: 4px;">
            Clear Tier
          </button>
        </div>
        
        <script>
          function updateUserTier() {
            // Parse cookies
            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
              const [key, value] = cookie.trim().split('=')
              if (key && value) acc[key] = decodeURIComponent(value)
              return acc
            }, {})
            
            const tier = cookies['statsig_user_tier'] || 'free'
            
            // Update UI
            document.getElementById('tier').textContent = tier.charAt(0).toUpperCase() + tier.slice(1)
            document.getElementById('cookie-value').textContent = cookies['statsig_user_tier'] || 'none'
            
            // Update features based on tier
            let features = 'Basic only'
            if (tier === 'premium') {
              features = 'Basic + Premium'
            } else if (tier === 'enterprise') {
              features = 'Basic + Premium + Enterprise'
            }
            document.getElementById('features').textContent = features
            
            return tier
          }
          
          // Button handlers
          document.getElementById('set-premium').addEventListener('click', () => {
            document.cookie = 'statsig_user_tier=premium; path=/; domain=example.com'
            updateUserTier()
          })
          
          document.getElementById('set-enterprise').addEventListener('click', () => {
            document.cookie = 'statsig_user_tier=enterprise; path=/; domain=example.com'
            updateUserTier()
          })
          
          document.getElementById('clear-tier').addEventListener('click', () => {
            document.cookie = 'statsig_user_tier=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=example.com'
            updateUserTier()
          })
          
          // Initial update
          updateUserTier()
        </script>
      </body>
    </html>
  `,

  /**
   * Feature flag test page for localStorage-based testing
   */
  featureFlagPage: `
    <!DOCTYPE html>
    <html>
      <head><title>Feature Flag Test</title></head>
      <body>
        <h1>🚀 Feature Flag Test</h1>
        
        <div id="feature-display" style="padding: 20px; border: 2px solid #2563eb; margin: 20px 0; border-radius: 8px;">
          <h2>Feature Status: <span id="feature-status" style="color: #2563eb;">DISABLED</span></h2>
          <p>Override Value: <span id="override-value" style="font-family: monospace;">none</span></p>
          <p>Source: <span id="source">api</span></p>
        </div>
        
        <div id="feature-content">
          <div id="old-feature" style="display: block; padding: 15px; border: 2px solid #ef4444; background: #fef2f2; margin: 10px 0;">
            <h3>❌ Old Feature (Default)</h3>
            <p>This is the default feature implementation</p>
          </div>
          <div id="new-feature" style="display: none; padding: 15px; border: 2px solid #22c55e; background: #f0fdf4; margin: 10px 0;">
            <h3>✅ New Feature (Flag Enabled)</h3>
            <p>This is the new feature implementation</p>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <button id="enable-feature" style="padding: 10px 20px; margin: 5px; background: #22c55e; color: white; border: none; border-radius: 4px;">
            Enable Feature
          </button>
          <button id="disable-feature" style="padding: 10px 20px; margin: 5px; background: #ef4444; color: white; border: none; border-radius: 4px;">
            Disable Feature
          </button>
          <button id="clear-override" style="padding: 10px 20px; margin: 5px; background: #6b7280; color: white; border: none; border-radius: 4px;">
            Clear Override
          </button>
        </div>
        
        <script>
          function checkFeatureFlag() {
            try {
              const overrideKey = 'statsig_override_test_feature'
              const override = localStorage.getItem(overrideKey)
              
              let enabled = false
              let source = 'api'
              
              if (override !== null) {
                enabled = override === 'true'
                source = 'override'
              } else {
                enabled = false // API default
                source = 'api'
              }
              
              // Update UI
              const statusEl = document.getElementById('feature-status')
              const overrideEl = document.getElementById('override-value')
              const sourceEl = document.getElementById('source')
              const oldFeature = document.getElementById('old-feature')
              const newFeature = document.getElementById('new-feature')
              
              if (statusEl) statusEl.textContent = enabled ? 'ENABLED' : 'DISABLED'
              if (overrideEl) overrideEl.textContent = override || 'none'
              if (sourceEl) sourceEl.textContent = source
              if (oldFeature) oldFeature.style.display = enabled ? 'none' : 'block'
              if (newFeature) newFeature.style.display = enabled ? 'block' : 'none'
              
              return enabled
            } catch (error) {
              console.error('Error checking feature flag:', error)
              return false
            }
          }
          
          // Button handlers
          document.getElementById('enable-feature').addEventListener('click', () => {
            try {
              localStorage.setItem('statsig_override_test_feature', 'true')
              checkFeatureFlag()
            } catch (error) {
              console.error('Error enabling feature:', error)
            }
          })
          
          document.getElementById('disable-feature').addEventListener('click', () => {
            try {
              localStorage.setItem('statsig_override_test_feature', 'false')
              checkFeatureFlag()
            } catch (error) {
              console.error('Error disabling feature:', error)
            }
          })
          
          document.getElementById('clear-override').addEventListener('click', () => {
            try {
              localStorage.removeItem('statsig_override_test_feature')
              checkFeatureFlag()
            } catch (error) {
              console.error('Error clearing override:', error)
            }
          })
          
          // Listen for storage changes
          window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('statsig_override_')) {
              checkFeatureFlag()
            }
          })
          
          // Initial check
          setTimeout(checkFeatureFlag, 500)
          setInterval(checkFeatureFlag, 2000)
        </script>
      </body>
    </html>
  `,

  /**
   * API testing page for network request testing
   */
  apiTestPage: `
    <!DOCTYPE html>
    <html>
      <head><title>API Testing</title></head>
      <body>
        <h1>🧪 API Mocking Test</h1>
        
        <div style="margin: 20px 0;">
          <button id="test-success">Test Successful API Call</button>
          <button id="test-error">Test Error API Call</button>
        </div>
        
        <div id="results" style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
          <h3>Results:</h3>
          <div id="success-result">Success API: Not tested</div>
          <div id="error-result">Error API: Not tested</div>
        </div>
        
        <script>
          document.getElementById('test-success').addEventListener('click', async () => {
            try {
              const response = await fetch('https://statsigapi.net/console/v1/gates')
              const data = await response.json()
              document.getElementById('success-result').textContent = 
                'Success API: ✅ Received ' + data.data.length + ' gates'
            } catch (error) {
              document.getElementById('success-result').textContent = 
                'Success API: ❌ Error - ' + error.message
            }
          })
          
          document.getElementById('test-error').addEventListener('click', async () => {
            try {
              const response = await fetch('https://statsigapi.net/console/v1/experiments')
              const data = await response.json()
              if (response.status === 401) {
                document.getElementById('error-result').textContent = 
                  'Error API: ✅ Correctly handled 401 - ' + data.error
              } else {
                document.getElementById('error-result').textContent = 
                  'Error API: ❌ Unexpected success'
              }
            } catch (error) {
              document.getElementById('error-result').textContent = 
                'Error API: ❌ Network error - ' + error.message
            }
          })
        </script>
      </body>
    </html>
  `,

  /**
   * E-commerce site simulation for realistic testing
   */
  ecommercePage: `
    <!DOCTYPE html>
    <html>
      <head><title>E-commerce Site</title></head>
      <body>
        <h1>🛒 Online Store</h1>
        
        <div id="checkout-section">
          <h2>Checkout Process</h2>
          <div id="checkout-flow">
            <div id="old-checkout" style="display: block; padding: 20px; border: 2px solid #ef4444; background: #fef2f2;">
              <h3>❌ Old Checkout (Default)</h3>
              <p>Multi-step checkout process</p>
              <button>Continue to Step 1 of 4</button>
            </div>
            <div id="new-checkout" style="display: none; padding: 20px; border: 2px solid #22c55e; background: #f0fdf4;">
              <h3>✅ New Checkout (Feature Flag)</h3>
              <p>Streamlined one-page checkout</p>
              <button>Complete Purchase Now</button>
            </div>
          </div>
          
          <div id="debug-info" style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <h4>Debug Info:</h4>
            <p>Feature Flag: <span id="flag-status">checking...</span></p>
            <p>Override: <span id="override-status">none</span></p>
            <p>Source: <span id="source">api</span></p>
          </div>
        </div>
        
        <script>
          function checkFeatureFlag() {
            try {
              const overrideKey = 'statsig_override_checkout_flow_v2'
              const override = localStorage.getItem(overrideKey)
              
              let enabled = false
              let source = 'api'
              
              if (override !== null) {
                enabled = override === 'true'
                source = 'override'
              } else {
                enabled = false // API default
                source = 'api'
              }
              
              // Update UI based on feature flag
              const oldCheckout = document.getElementById('old-checkout')
              const newCheckout = document.getElementById('new-checkout')
              const flagStatus = document.getElementById('flag-status')
              const overrideStatus = document.getElementById('override-status')
              const sourceEl = document.getElementById('source')
              
              if (oldCheckout) oldCheckout.style.display = enabled ? 'none' : 'block'
              if (newCheckout) newCheckout.style.display = enabled ? 'block' : 'none'
              if (flagStatus) flagStatus.textContent = enabled ? 'ENABLED' : 'DISABLED'
              if (overrideStatus) overrideStatus.textContent = override || 'none'
              if (sourceEl) sourceEl.textContent = source
              
              return enabled
            } catch (error) {
              console.error('Error checking feature flag:', error)
              const flagStatus = document.getElementById('flag-status')
              if (flagStatus) flagStatus.textContent = 'DISABLED'
              return false
            }
          }
          
          // Check on load with delay
          setTimeout(checkFeatureFlag, 500)
          
          // Listen for storage changes (from extension)
          window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('statsig_override_')) {
              setTimeout(checkFeatureFlag, 100)
            }
          })
          
          // Poll for changes (fallback)
          setInterval(checkFeatureFlag, 2000)
        </script>
      </body>
    </html>
  `,
}
