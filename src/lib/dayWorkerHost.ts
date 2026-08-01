/** Host del worker de simulación (build normal). */
export function createDayWorker(): Worker | null {
  try {
    return new Worker(new URL('../workers/dayWorker.ts', import.meta.url), {
      type: 'module',
    })
  } catch {
    return null
  }
}
