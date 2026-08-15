export function HelpPanel() {
  return (
    <div>
      <h3 className="serif">Cómo se juega</h3>
      <div className="card">
        <b>1. Mapa real</b>
        <p className="muted">
          Calles de OpenStreetMap (Carto Voyager). Busca cualquier ciudad del mundo y haz zoom hasta ver
          el callejero.
        </p>
      </div>
      <div className="card">
        <b>2. Fundar de uno en uno</b>
        <p className="muted">
          Modo Fundar + clic. Nominatim nombra el lugar. Eliges marca y pagas un coste según el nivel de
          vida de la ciudad más cercana.
        </p>
      </div>
      <div className="card">
        <b>3. Scout OSM</b>
        <p className="muted">
          Overpass lista restaurantes, cafés y bares reales en la vista. Los anillos dorados se pueden
          adquirir y pasan a vuestra red con el nombre OSM.
        </p>
      </div>
      <div className="card">
        <b>4. Miles de locales</b>
        <p className="muted">
          Fundación masiva (hasta 250 por oleada) o expansión automática por 110 ciudades. El mapa pinta
          en canvas y agrupa al alejar.
        </p>
      </div>
      <div className="card">
        <b>5. Economía</b>
        <p className="muted">
          Cada día: cubiertos, alquiler, nómina y género. La competencia cercana (vuestra y de OSM)
          recorta demanda. Calidad, delivery y estrellas la suben.
        </p>
      </div>
      <p className="muted">
        Atajos: espacio pausa · 1/2/3 velocidad · F fundar · E explorar. Datos © colaboradores de
        OpenStreetMap.
      </p>
    </div>
  )
}
