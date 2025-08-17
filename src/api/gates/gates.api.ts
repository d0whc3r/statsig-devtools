import { GatesDetailApi } from './gates-detail.api'
import { GatesListApi } from './gates-list.api'
import { GatesOverrideApi } from './gates-override.api'

export class GatesApi {
  public readonly list: GatesListApi
  public readonly detail: GatesDetailApi
  public readonly override: GatesOverrideApi

  constructor() {
    this.list = new GatesListApi()
    this.detail = new GatesDetailApi()
    this.override = new GatesOverrideApi()
  }
}
