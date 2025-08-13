import { AppLayout } from '@/src/components/AppLayout'

function App() {
  return (
    <AppLayout viewMode="popup">
      <div className="space-y-4 p-6">
        <div className="text-center">
          <h1 className="text-primary-700 mb-2 text-2xl font-bold">Statsig DevTools</h1>
          <p className="text-sm text-neutral-600">Professional extension for feature flag testing</p>
        </div>

        <div className="card space-y-3 p-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <button className="btn-primary w-full">Connect to Statsig</button>
            <button className="btn-secondary w-full">View Configurations</button>
            <button className="btn-outline w-full">Manage Overrides</button>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-2 font-medium">Status</h3>
          <div className="flex items-center gap-2">
            <div className="badge-success">Connected</div>
            <span className="text-sm text-neutral-600">API Key Valid</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
