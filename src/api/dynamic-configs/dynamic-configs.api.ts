import { DynamicConfigsDetailApi } from './dynamic-configs-detail.api'
import { DynamicConfigsListApi } from './dynamic-configs-list.api'

export class DynamicConfigsApi {
  public readonly list: DynamicConfigsListApi
  public readonly detail: DynamicConfigsDetailApi

  constructor() {
    this.list = new DynamicConfigsListApi()
    this.detail = new DynamicConfigsDetailApi()
  }
}
