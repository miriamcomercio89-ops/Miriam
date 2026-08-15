/* Industry Manager — configuración global */
window.IM_CONFIG = {
  name: 'Industry Manager',
  version: '1.0.0',
  /** 1 segundo real = 1 minuto de juego → 1 minuto real = 1 hora de juego */
  realMsPerGameMinute: 1000,
  speeds: [0, 1, 2, 5, 10],
  startingMoney: 2500000,
  startingLocation: 'madrid',
  saveKey: 'industry_manager_save_v1',
  autosaveMinutesReal: 2,
  inflationYearly: 0.02,
  baseInterestRate: 0.06,
  corporateTax: 0.22,
  maxQuality: 100,
  employeeBaseWageHourly: 18,
  mapDefaultZoom: 4,
  mapCenter: [40, 0],
  cheatUnlockAllCode: 'INDUSTRIA_TOTAL',
};
