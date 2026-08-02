import { EVENT_POOL } from '../data/events'
import {
  applyHotelDayInPlace,
  getSeason,
  makeNewsFromDay,
  reputationKey,
  tickBankDeposits,
  tickCountryEconomies,
  updateReputation,
} from './economy'
import { activeHolidays } from './holidays'
import { loyaltyFromPoints, makeWeeklyReport } from './loyalty'
import { formatGameDay } from './format'
import type { BankDeposit, DayLedger, GameState, Hotel, NewsItem, WeeklyReport, WorldEvent } from '../types'

export type DaySimState = Pick<
  GameState,
  | 'cash'
  | 'gameMinutes'
  | 'hotels'
  | 'activeEvents'
  | 'lastEventRollDay'
  | 'reputation'
  | 'loan'
  | 'ledger'
  | 'countryEconomy'
  | 'news'
  | 'bankDeposits'
  | 'loyaltyLevel'
  | 'loyaltyPoints'
  | 'lastWeeklyReportDay'
  | 'weeklyReports'
>

export type DaySimResult = {
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
  bankDeposits: BankDeposit[]
  loyaltyLevel: GameState['loyaltyLevel']
  loyaltyPoints: number
  lastWeeklyReportDay: number
  weeklyReports: WeeklyReport[]
  dayClosed: boolean
}

function gameDay(gameMinutes: number): number {
  return Math.floor(gameMinutes / (60 * 24)) + 1
}

/** Simulación de N días (hilo principal o worker). */
export function applyDays(state: DaySimState, days: number): DaySimResult {
  let cash = state.cash
  const hotels = state.hotels.map((h) => ({
    ...h,
    services: h.services,
    contract: h.contract ? { ...h.contract } : null,
    insurance: h.insurance ? { ...h.insurance } : null,
  }))
  let activeEvents = state.activeEvents.map((e) => ({ ...e }))
  let lastEventRollDay = state.lastEventRollDay
  let reputation = { ...state.reputation }
  let loan = { ...state.loan }
  let ledger = state.ledger.slice()
  let countryEconomy = { ...state.countryEconomy }
  let news = state.news.slice()
  let bankDeposits = (state.bankDeposits ?? []).map((d) => ({ ...d }))
  let loyaltyPoints = state.loyaltyPoints ?? 0
  let loyaltyLevel = state.loyaltyLevel ?? 1
  let lastWeeklyReportDay = state.lastWeeklyReportDay ?? 0
  let weeklyReports = (state.weeklyReports ?? []).slice()
  const startDay = gameDay(state.gameMinutes)
  let dayClosed = false

  for (let d = 0; d < days; d++) {
    const currentDay = startDay + d
    const minutesAtDay = (currentDay - 1) * 24 * 60 + 12 * 60
    const globalSeason = getSeason(20, minutesAtDay)

    activeEvents = activeEvents
      .map((e) => ({ ...e, daysRemaining: e.daysRemaining - 1 }))
      .filter((e) => e.daysRemaining > 0)

    const holidays = activeHolidays(minutesAtDay).map((h) => ({
      ...h,
      id: `${h.id}-${currentDay}`,
      daysRemaining: 1,
      startedAtDay: currentDay,
    }))
    const dayEvents = [...activeEvents, ...holidays]

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
    let dayTax = 0
    let renovations = 0
    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i]
      const key = reputationKey(h.countryCode)
      const rep = reputation[key] ?? 55
      const eco = countryEconomy[key]
      const { net, renovationCost } = applyHotelDayInPlace(h, dayEvents, minutesAtDay, rep, eco, currentDay, loyaltyLevel)
      if (renovationCost > 0) renovations++
      dayRevenue += h.lastDayRevenue
      dayCosts += h.lastDayCosts
      dayTax += h.lastDayTax ?? 0
      cash += net
      reputation[key] = updateReputation(rep, net, h.lastDayOccupancy, h.satisfaction)
    }

    loyaltyPoints = 0
    for (let i = 0; i < hotels.length; i++) loyaltyPoints += hotels[i].lifetimeGuests
    loyaltyLevel = loyaltyFromPoints(loyaltyPoints)

    const bankTick = tickBankDeposits(bankDeposits, cash, currentDay)
    bankDeposits = bankTick.deposits
    cash = bankTick.cash
    const bankInterest = bankTick.interestPaid
    const bankBalance = bankDeposits.reduce((s, x) => s + x.amount, 0)

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
      tax: dayTax,
      season: globalSeason,
    })
    if (ledger.length > 60) ledger = ledger.slice(-60)

    const dayNews = makeNewsFromDay({
      day: currentDay,
      events: dayEvents,
      hotels,
      net: dayRevenue - dayCosts,
      season: globalSeason,
      dayTax,
      bankInterest,
    })

    if (renovations > 0) {
      dayNews.unshift({
        id: `reno-${currentDay}`,
        day: currentDay,
        title: 'Reformas de la IA',
        body: `La IA ha renovado ${renovations} hotel${renovations === 1 ? '' : 'es'} con desgaste.`,
        tone: 'neutral',
      })
    }

    if (currentDay - lastWeeklyReportDay >= 7) {
      lastWeeklyReportDay = currentDay
      const report = makeWeeklyReport({
        day: currentDay,
        hotels,
        bankBalance,
        renovations,
      })
      weeklyReports = [report, ...weeklyReports].slice(0, 12)
      dayNews.unshift({
        id: report.id,
        day: currentDay,
        title: `Informe semanal · ${formatGameDay(currentDay)}`,
        body: `${report.summary} Mejor país ${report.bestCountry} (${Math.round(report.bestCountryNet)} €). Peor: ${report.worstHotel}. Impuestos ${Math.round(report.dayTax)} €. Banco ${Math.round(report.bankBalance)} €. Ocupación media ${(report.avgOccupancy * 100).toFixed(0)}%.`,
        tone: 'neutral',
      })
    }

    news = [...dayNews, ...news].slice(0, 50)
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
    bankDeposits,
    loyaltyLevel,
    loyaltyPoints,
    lastWeeklyReportDay,
    weeklyReports,
    dayClosed,
  }
}
