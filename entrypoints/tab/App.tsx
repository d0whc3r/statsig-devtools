import { AppLayout } from '../../src/components/AppLayout'
// import '@/src/styles/globals.css'

/**
 * Main tab application component
 */
function App() {
  return (
    <AppLayout viewMode="tab">
      <div className="space-y-6">
        <div className="py-8 text-center">
          <h1 className="text-primary-700 mb-4 text-4xl font-bold">Statsig DevTools</h1>
          <p className="text-lg text-neutral-600">Professional Feature Flag Management</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card-elevated space-y-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-800">Feature Gates</h2>
            <p className="text-neutral-600">Manage boolean feature flags and their configurations</p>
            <button className="btn-primary w-full">View Gates</button>
          </div>

          <div className="card-elevated space-y-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-800">Experiments</h2>
            <p className="text-neutral-600">Configure A/B tests and experiment parameters</p>
            <button className="btn-secondary w-full">View Experiments</button>
          </div>

          <div className="card-elevated space-y-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-800">Dynamic Configs</h2>
            <p className="text-neutral-600">Manage dynamic configuration values</p>
            <button className="btn-outline w-full">View Configs</button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
              <div>
                <span className="font-medium">feature_checkout_flow</span>
                <span className="ml-2 text-sm text-neutral-600">was overridden</span>
              </div>
              <div className="badge-warning">Override Active</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
              <div>
                <span className="font-medium">experiment_button_color</span>
                <span className="ml-2 text-sm text-neutral-600">evaluation completed</span>
              </div>
              <div className="badge-success">Success</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
              <div>
                <span className="font-medium">config_api_timeout</span>
                <span className="ml-2 text-sm text-neutral-600">value updated</span>
              </div>
              <div className="badge-info">Updated</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
