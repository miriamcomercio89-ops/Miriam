# SPEC — Loterías Álora v0.1

## Visión
Simulador realista de mostrador. Jugadora: Miriam. Ubicación: Álora. Sin game over.

## Tiempo
- Escala base 0.25 (4× más lento)
- Velocidades: 0 / 1 / 15 / 60
- L–V 08:00–20:00; festivos + eventos locales Álora
- Cierre → liquidación → siguiente laborable 08:00

## Sorteos v0.1
- Nacional, Primitiva, Bonoloto, Euromillones, Cupón ONCE (+ inventadas)
- Resultados deterministas por fecha
- Tickets comprobables; clientes llegan a comprobar al azar
- Premios: pago inmediato, diferido, o gestión (>2.000 €)

## Rascas
- 10 modelos con tablas de premios; premio oculto al vender; comprobación posterior

## Economía
- Comisiones, gastos, beneficio del día
- Liquidación diaria LAE/ONCE al cierre
- Tickets PDF

## Guardado
- 3 slots, autosave al cierre, export/import, migración v1→v2
