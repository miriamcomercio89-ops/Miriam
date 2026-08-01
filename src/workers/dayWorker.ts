/// <reference lib="webworker" />
import { applyDays, type DaySimState } from '../lib/daySim'
import type { DaySimResult } from '../lib/daySim'

export type WorkerDayRequest = {
  type: 'applyDays'
  state: DaySimState
  days: number
}

export type WorkerDayResponse = DaySimResult

self.onmessage = (ev: MessageEvent<WorkerDayRequest>) => {
  if (ev.data?.type !== 'applyDays') return
  const result = applyDays(ev.data.state, ev.data.days)
  ;(self as DedicatedWorkerGlobalScope).postMessage(result)
}
