import { ExperimentsDetailApi } from './experiments-detail.api'
import { ExperimentsListApi } from './experiments-list.api'
import { ExperimentsOverrideApi } from './experiments-override.api'

export class ExperimentsApi {
  public readonly list: ExperimentsListApi
  public readonly detail: ExperimentsDetailApi
  public readonly override: ExperimentsOverrideApi

  constructor() {
    this.list = new ExperimentsListApi()
    this.detail = new ExperimentsDetailApi()
    this.override = new ExperimentsOverrideApi()
  }
}
