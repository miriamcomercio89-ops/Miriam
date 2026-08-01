# Orbis Hotels Group

Juego de construcción de hoteles en el mapa del mundo (**v0.5**).

## Plan de construcción (50.000 hoteles)

Carpeta [`plan-construccion/`](./plan-construccion): **177 PDF** (uno por provincia), orden global empezando por **Málaga**.

```bash
npm run plan:pdfs   # regenerar PDFs
```

Índice: [`plan-construccion/README.md`](./plan-construccion/README.md)

## Novedades v0.5

- Desgaste del edificio y **reformas gestionadas por la IA**
- **Informe semanal** (mejor país, peor hotel, impuestos, banco)
- Filtros: país, seguro, VIP reciente, desgaste
- Ver **opciones de construcción** de un hotel (solo lectura)
- Más fotos / estilos (8 por hotel, según clima/marca)
- Panel de **estadísticas globales**
- Mejor rendimiento con miles de hoteles
- Aviso claro de **autosave** (tamaño de la partida)
- **Regímenes**: solo alojamiento → todo incluido imperial (**varios a la vez**)
- **Club de fidelidad Orbis** con 10 niveles

## Cómo jugar

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API guardado: http://localhost:8787

## Atajos

| Tecla | Acción |
|-------|--------|
| Espacio | Pausa / seguir |
| 1 / 2 / 5 | Velocidad |
| Esc | Cerrar paneles |
