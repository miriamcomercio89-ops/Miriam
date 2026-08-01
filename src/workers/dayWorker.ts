/// <reference lib="webworker" />
import { EVENT_POOL } from '../data/events'
import {
  applyHotelDayInPlace,
  getSeason,
  makeNewsFromDay,
  reputationKey,
  tickCountryEconomies,
  updateReputation,
} from '../lib/economy'
import type { DayLedger, GameState, Hotel, NewsItem, WorldEvent } from '../types'

export type WorkerDayRequest = {
  type: 'applyDays'
  state: Pick<
    GameState,
    'cash' | 'gameMinutes' | 'hotels' | 'activeEvents' | 'lastEventRollDay' | 'reputation' | 'loan' | 'ledger' | 'countryEconomy' | 'news'
  >
  days: number
}

export type WorkerDayResponse = {
  type: 'applyDaysResult'
  cash: number
  hotels: Hotel[]
  activeEvents: WorldEvent[]
  lastEventRollDay: number
  reputation: Record<string, number>
  loan: GameState['loan']
  ledger: DayLedger[]
  countryEconomy: GameState['countryEconomy']
  news: NewsItem[]
  dayClosed: boolean
}

function gameDay(gameMinutes: number): number {
  return Math.floor(gameMinutes / (60 * 24)) + 1
}

function applyDays(state: WorkerDayRequest['state'], days: number): WorkerDayResponse {
  let cash = state.cash
  const hotels = state.hotels.map((h) => ({
    ...h,
    services: h.services,
    contract: h.contract ? { ...h.contract } : null,
  }))
  let activeEvents = state.activeEvents.map((e) => ({ ...e }))
  let lastEventRollDay = state.lastEventRollDay
  let reputation = { ...state.reputation }
  let loan = { ...state.loan }
  let ledger = state.ledger.slice()
  let countryEconomy = { ...state.countryEconomy }
  let news = state.news.slice()
  const startDay = gameDay(state.gameMinutes)
  let dayClosed = false

  for (let d = 0; d < days; d++) {
    const currentDay = startDay + d
    const minutesAtDay = (currentDay - 1) * 24 * 60 + 12 * 60
    const globalSeason = getSeason(20, minutesAtDay)

    activeEvents = activeEvents
      .map((e) => ({ ...e, daysRemaining: e.daysRemaining - 1 }))
      .filter((e) => e.daysRemaining > 0)

    if (currentDay - lastEventRollDay >= 5 + Math.floor(Math.random() * 6)) {
      lastEventRollDay = currentDay
      if (Math.random() < 0.62 && activeEvents.length < 3) {
        const seasonal = EVENT_POOL.filter((p) => !p.season || p.season === 'any' || p.season === globalSeason)
        const pool = seasonal[Math.floor(Math.random() * seasonal.length)] ?? EVENT_POOL[0]
        activeEvents.push({
          ...pool,
          id: `${pool.id}-${currentDay}-${Math.random().toString(36).slice(2, 7)}`,
          daysRemaining: 3 + Math.floor(Math.random() * 5),
          startedAtDay: currentDay,
        })
      }
    }

    countryEconomy = tickCountryEconomies(countryEconomy, hotels)

    let dayRevenue = 0
    let dayCosts = 0
    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i]
      const key = reputationKey(h.countryCode)
      const rep = reputation[key] ?? 55
      const eco = countryEconomy[key]
      const net = applyHotelDayInPlace(h, activeEvents, minutesAtDay, rep, eco)
      dayRevenue += h.lastDayRevenue
      dayCosts += h.lastDayCosts
      cash += net
      reputation[key] = updateReputation(rep, net, h.lastDayOccupancy, h.satisfaction)
    }

    let loanPayment = 0
    if (loan.balance > 0) {
      const interest = Math.round(loan.balance * loan.dailyRate)
      const principal = Math.min(loan.balance, Math.max(5000, Math.round(loan.balance * 0.001)))
      loanPayment = interest + principal
      cash -= loanPayment
      loan = { ...loan, balance: Math.max(0, loan.balance - principal) }
      dayCosts += loanPayment
    }

    ledger.push({
      day: currentDay,
      revenue: dayRevenue,
      costs: dayCosts,
      net: dayRevenue - dayCosts,
      cash,
      loanPayment,
      season: globalSeason,
    })
    if (ledger.length > 60) ledger = ledger.slice(-60)

    const dayNews = makeNewsFromDay({
      day: currentDay,
      events: activeEvents,
      hotels,
      net: dayRevenue - dayCosts,
      season: globalSeason,
    })
    news = [...dayNews, ...news].slice(0, 40)
    dayClosed = true
  }

  return {
    type: 'applyDaysResult',
    cash,
    hotels,
    activeEvents,
    lastEventRollDay,
    reputation,
    loan,
    ledger,
    countryEconomy,
    news,
    dayClosed,
  }
}

self.onmessage = (ev: MessageEvent<WorkerDayRequest>) => {
  if (ev.data?.type !== 'applyDays') return
  const result = applyDays(ev.data.state, ev.data.days)
  ;(self as DedicatedWorkerGlobalScope).postMessage(result)
}
