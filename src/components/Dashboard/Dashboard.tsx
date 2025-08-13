interface DashboardProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function Dashboard({ viewMode }: DashboardProps) {
  // Dashboard implementation without redundant header

  const getContainerClasses = () => {
    switch (viewMode) {
      case 'popup':
        return 'space-y-4 p-6 h-full overflow-y-auto'
      case 'sidebar':
        return 'space-y-4 p-4 h-full overflow-y-auto'
      case 'tab':
        return 'space-y-6 p-8 min-h-screen'
    }
  }

  if (viewMode === 'popup') {
    return (
      <div className={getContainerClasses()}>
        <div className="space-y-3">
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <button className="btn-primary w-full py-2 text-sm">View Configurations</button>
              <button className="btn-secondary w-full py-2 text-sm">Manage Overrides</button>
              <button className="btn-outline w-full py-2 text-sm">Open Full View</button>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="mb-2 text-sm font-medium">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">API Connection</span>
                <div className="badge-success text-xs">Connected</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Active Overrides</span>
                <span className="text-xs font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'sidebar') {
    return (
      <div className={getContainerClasses()}>
        <div className="space-y-3">
          <div className="card p-3">
            <h2 className="mb-2 text-sm font-semibold">Configurations</h2>
            <div className="space-y-1">
              <div className="hover:bg-accent flex items-center justify-between rounded p-2">
                <span className="text-sm">feature_flag_1</span>
                <div className="badge-primary text-xs">Gate</div>
              </div>
              <div className="hover:bg-accent flex items-center justify-between rounded p-2">
                <span className="text-sm">experiment_a</span>
                <div className="badge-secondary text-xs">Experiment</div>
              </div>
              <div className="hover:bg-accent flex items-center justify-between rounded p-2">
                <span className="text-sm">config_dynamic</span>
                <div className="badge-neutral text-xs">Config</div>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <h3 className="mb-2 text-sm font-medium">Active Overrides</h3>
            <div className="text-muted-foreground text-xs">No overrides active</div>
          </div>

          <div className="card p-3">
            <h3 className="mb-2 text-sm font-medium">Status</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Connection</span>
                <div className="badge-success text-xs">OK</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tab view
  return (
    <div className={getContainerClasses()}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card-elevated space-y-4 p-6">
          <h2 className="text-foreground text-xl font-semibold">Feature Gates</h2>
          <p className="text-muted-foreground">Manage boolean feature flags and their configurations</p>
          <button className="btn-primary w-full">View Gates</button>
        </div>

        <div className="card-elevated space-y-4 p-6">
          <h2 className="text-foreground text-xl font-semibold">Experiments</h2>
          <p className="text-muted-foreground">Configure A/B tests and experiment parameters</p>
          <button className="btn-secondary w-full">View Experiments</button>
        </div>

        <div className="card-elevated space-y-4 p-6">
          <h2 className="text-foreground text-xl font-semibold">Dynamic Configs</h2>
          <p className="text-muted-foreground">Manage dynamic configuration values</p>
          <button className="btn-outline w-full">View Configs</button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-3">
          <div className="bg-muted flex items-center justify-between rounded-lg p-3">
            <div>
              <span className="font-medium">feature_checkout_flow</span>
              <span className="text-muted-foreground ml-2 text-sm">was overridden</span>
            </div>
            <div className="badge-warning">Override Active</div>
          </div>
          <div className="bg-muted flex items-center justify-between rounded-lg p-3">
            <div>
              <span className="font-medium">experiment_button_color</span>
              <span className="text-muted-foreground ml-2 text-sm">evaluation completed</span>
            </div>
            <div className="badge-success">Success</div>
          </div>
          <div className="bg-muted flex items-center justify-between rounded-lg p-3">
            <div>
              <span className="font-medium">config_api_timeout</span>
              <span className="text-muted-foreground ml-2 text-sm">value updated</span>
            </div>
            <div className="badge-info">Updated</div>
          </div>
        </div>
      </div>
    </div>
  )
}
