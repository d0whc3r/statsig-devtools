import { EnvironmentsListApi } from './environments-list.api'

export class EnvironmentsApi {
  public readonly list: EnvironmentsListApi

  constructor() {
    this.list = new EnvironmentsListApi()
  }
}
