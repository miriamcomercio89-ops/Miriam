import { useGameStore } from '../store/gameStore'

export function NewsPanel() {
  const open = useGameStore((s) => s.showNews)
  const setShowNews = useGameStore((s) => s.setShowNews)
  const news = useGameStore((s) => s.news)

  if (!open) return null

  return (
    <aside className="panel panel--news">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Orbis Hoy</p>
          <h2>Noticias</h2>
          <p className="panel__meta">Lo que pasa en tu cadena</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowNews(false)} aria-label="Cerrar">×</button>
      </div>
      <div className="panel__body">
        {news.length === 0 ? (
          <p className="muted">Aún no hay noticias. Avanza un día para ver las primeras.</p>
        ) : (
          <div className="news-list">
            {news.map((n) => (
              <article key={n.id} className={`news-card news-card--${n.tone}`}>
                <span>Día {n.day}</span>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
