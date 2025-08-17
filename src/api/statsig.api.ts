import { DynamicConfigsApi } from './dynamic-configs/dynamic-configs.api'
import { EnvironmentsApi } from './environments/environments.api'
import { ExperimentsApi } from './experiments/experiments.api'
import { GatesApi } from './gates/gates.api'

import type { StatsigPagination } from './common.schema'
import type { StatsigDynamicConfigsResponse } from './dynamic-configs/dynamic-configs.schema'
import type { StatsigExperimentsResponse } from './experiments/experiments-list.schema'
import type { StatsigGatesResponse } from './gates/gates-list.schema'

export class StatsigApi {
  private readonly gates: GatesApi
  private readonly experiments: ExperimentsApi
  private readonly dynamicConfigs: DynamicConfigsApi
  private readonly environments: EnvironmentsApi

  private static instance: StatsigApi | null = null

  constructor() {
    this.gates = new GatesApi()
    this.experiments = new ExperimentsApi()
    this.dynamicConfigs = new DynamicConfigsApi()
    this.environments = new EnvironmentsApi()
  }

  static getInstance(): StatsigApi {
    StatsigApi.instance ??= new StatsigApi()
    return StatsigApi.instance
  }

  // Unified convenience methods for direct access
  async getGates(pagination?: StatsigPagination): Promise<StatsigGatesResponse> {
    return this.gates.list.getGates(pagination)
  }

  async getExperiments(pagination?: StatsigPagination): Promise<StatsigExperimentsResponse> {
    return this.experiments.list.getExperiments(pagination)
  }

  async getDynamicConfigs(pagination?: StatsigPagination): Promise<StatsigDynamicConfigsResponse> {
    return this.dynamicConfigs.list.getDynamicConfigs(pagination)
  }

  async getEnvironments() {
    return this.environments.list.getEnvironments()
  }

  // Gate-specific convenience methods
  async getGateDetails(gateId: string) {
    return this.gates.detail.getGatesById(gateId)
  }

  async getGateOverrides(gateId: string) {
    return this.gates.override.getGateOverrides(gateId)
  }

  async createGateOverride(gateId: string, params: Parameters<typeof this.gates.override.createGateOverride>[1]) {
    return this.gates.override.createGateOverride(gateId, params)
  }

  async removeGateOverride(gateId: string, params: Parameters<typeof this.gates.override.removeGateOverride>[1]) {
    return this.gates.override.removeGateOverride(gateId, params)
  }

  // Experiment-specific convenience methods
  async getExperimentDetails(experimentId: string) {
    return this.experiments.detail.getExperimentById(experimentId)
  }

  async getExperimentOverrides(experimentId: string) {
    return this.experiments.override.getExperimentOverrides(experimentId)
  }

  async createExperimentOverride(
    experimentId: string,
    params: Parameters<typeof this.experiments.override.createExperimentOverride>[1],
  ) {
    return this.experiments.override.createExperimentOverride(experimentId, params)
  }

  async removeExperimentOverride(
    experimentId: string,
    params: Parameters<typeof this.experiments.override.removeExperimentOverride>[1],
  ) {
    return this.experiments.override.removeExperimentOverride(experimentId, params)
  }

  // Dynamic Config-specific convenience methods (no overrides available)
  async getDynamicConfigDetails(configId: string) {
    return this.dynamicConfigs.detail.getDynamicConfigById(configId)
  }
}

export const statsigApi = StatsigApi.getInstance()
