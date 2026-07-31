# Guía de importación a Nimby Rails

Nimby Rails no importa este JSON de forma nativa. Este proyecto es la **capa de diseño/planificación** para construir la partida a mano (o con herramientas externas) de forma coherente.

## Flujo recomendado

1. **Suscribir Workshop**  
   Usa las colecciones de `docs/FLOTA.md` / `data/fleet.json`. Busca cada `workshop_ref` y suscríbete.

2. **Crear operadores en la partida**  
   Para cada entrada de `data/operators.json`:
   - nombre en español
   - color corporativo
   - logo SVG de `assets/logos/{id}.svg` (exporta a PNG si el juego lo pide)

3. **Plantar hubs**  
   Prioriza tier 1–2 de `data/hubs.json`, luego metropolitanos, luego ficticios de densificación.

4. **Trazar corredores**  
   Sigue `data/corridors.json` (AV del Rin, eje norte-sur, S-Bahn, etc.).

5. **Abrir líneas desde el lote**  
   Usa `output/lines-mass.json` (o la sample) filtrando por `corredor_id` o `tipo_id`.  
   Código público = `codigo`; color = `color`; tren = primer id de `material`.

6. **Competencia**  
   En un mismo eje pueden aparecer varios `operador_id`. Mantén ambos si quieres rivalidad; o deja el dominante local.

## Orden práctico de construcción

1. AV/LD nacionales  
2. S/U/T de las 8–10 áreas metro  
3. RE/RB por Land  
4. RL/TUR/AE/N de relleno  

## Archivos clave

| Archivo | Uso |
| --- | --- |
| `data/operators.json` | Marca y flota |
| `data/fleet.json` | Material Workshop |
| `data/hubs.json` | Estaciones |
| `data/corridors.json` | Ejes |
| `output/lines-mass.json` | Miles de líneas listas para ejecutar |
