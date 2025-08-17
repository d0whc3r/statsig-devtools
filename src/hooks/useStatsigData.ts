import { useEffect, useState } from 'react'

import { DynamicConfigsListApi } from '@/src/api/dynamic-configs/dynamic-configs-list.api'
import { ExperimentsListApi } from '@/src/api/experiments/experiments-list.api'
import { GatesDetailApi } from '@/src/api/gates/gates-detail.api'
import { GatesListApi } from '@/src/api/gates/gates-list.api'
import { Logger } from '@/src/utils/logger'

import type { ExperimentListItem } from '@/src/api/experiments/experiments-list.schema'
import type { StatsigGateDetailResponse } from '@/src/api/gates/gates-detail.schema'
import type { GateListItem } from '@/src/api/gates/gates-list.schema'

const logger = new Logger('useStatsigData')

export function useStatsigData() {
  const [gates, setGates] = useState<GateListItem[]>([])
  const [experiments, setExperiments] = useState<ExperimentListItem[]>([])
  const [dynamicConfigs, setDynamicConfigs] = useState<any[]>([])
  const [gateDetails, setGateDetails] = useState<Record<string, StatsigGateDetailResponse | null>>({})

  const [isLoadingGates, setIsLoadingGates] = useState(false)
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(false)
  const [isLoadingDynamicConfigs, setIsLoadingDynamicConfigs] = useState(false)
  const [isLoadingGateDetails, setIsLoadingGateDetails] = useState<Record<string, boolean>>({})

  const gatesListApi = new GatesListApi()
  const experimentsListApi = new ExperimentsListApi()
  const dynamicConfigsListApi = new DynamicConfigsListApi()
  const gatesDetailApi = new GatesDetailApi()

  const fetchGates = async () => {
    setIsLoadingGates(true)
    try {
      const response = await gatesListApi.getGates()
      setGates(response.data)
      logger.info('Gates fetched successfully:', response.data.length)
    } catch (error) {
      logger.error('Error fetching gates:', error)
      setGates([])
    } finally {
      setIsLoadingGates(false)
    }
  }

  const fetchExperiments = async () => {
    setIsLoadingExperiments(true)
    try {
      const response = await experimentsListApi.getExperiments()
      setExperiments(response.data)
      logger.info('Experiments fetched successfully:', response.data.length)
    } catch (error) {
      logger.error('Error fetching experiments:', error)
      setExperiments([])
    } finally {
      setIsLoadingExperiments(false)
    }
  }

  const fetchDynamicConfigs = async () => {
    setIsLoadingDynamicConfigs(true)
    try {
      const response = await dynamicConfigsListApi.getDynamicConfigs()
      setDynamicConfigs(response.data)
      logger.info('Dynamic configs fetched successfully:', response.data.length)
    } catch (error) {
      logger.error('Error fetching dynamic configs:', error)
      setDynamicConfigs([])
    } finally {
      setIsLoadingDynamicConfigs(false)
    }
  }

  const fetchGateDetail = async (gateId: string) => {
    if (gateDetails[gateId] !== undefined) {
      return gateDetails[gateId]
    }

    setIsLoadingGateDetails((prev) => ({ ...prev, [gateId]: true }))
    try {
      const detail = await gatesDetailApi.getGatesById(gateId)
      setGateDetails((prev) => ({ ...prev, [gateId]: detail }))
      logger.info('Gate detail fetched successfully:', gateId)
      return detail
    } catch (error) {
      logger.error('Error fetching gate detail:', error)
      setGateDetails((prev) => ({ ...prev, [gateId]: null }))
      return null
    } finally {
      setIsLoadingGateDetails((prev) => ({ ...prev, [gateId]: false }))
    }
  }

  const refreshData = async () => {
    logger.info('Refreshing all data')
    await Promise.all([fetchGates(), fetchExperiments(), fetchDynamicConfigs()])
  }

  useEffect(() => {
    refreshData()
  }, [])

  return {
    gates,
    experiments,
    dynamicConfigs,
    gateDetails,
    isLoadingGates,
    isLoadingExperiments,
    isLoadingDynamicConfigs,
    isLoadingGateDetails,
    refreshData,
    fetchGateDetail,
  }
}
