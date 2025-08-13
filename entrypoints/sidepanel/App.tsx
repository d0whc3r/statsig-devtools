import { AppLayout } from '../../src/components/AppLayout'
// import '@/src/styles/globals.css'

/**
 * Main sidepanel application component
 */
function App() {
  return (
    <AppLayout viewMode="sidebar">
      <div className="space-y-4 p-4">
        <div className="border-b border-neutral-200 pb-4">
          <h1 className="text-primary-700 text-xl font-bold">Statsig DevTools</h1>
          <p className="text-sm text-neutral-600">Sidebar Panel</p>
        </div>

        <div className="card space-y-2 p-3">
          <h2 className="font-semibold">Configurations</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between rounded p-2 hover:bg-neutral-50">
              <span className="text-sm">feature_flag_1</span>
              <div className="badge-primary">Gate</div>
            </div>
            <div className="flex items-center justify-between rounded p-2 hover:bg-neutral-50">
              <span className="text-sm">experiment_a</span>
              <div className="badge-secondary">Experiment</div>
            </div>
            <div className="flex items-center justify-between rounded p-2 hover:bg-neutral-50">
              <span className="text-sm">config_dynamic</span>
              <div className="badge-neutral">Config</div>
            </div>
          </div>
        </div>

        <div className="card p-3">
          <h3 className="mb-2 font-medium">Active Overrides</h3>
          <div className="text-sm text-neutral-500">No overrides active</div>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
