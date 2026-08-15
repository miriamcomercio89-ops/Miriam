# Industry Manager v9 — Rise of Industry (Málaga)

Mapa primero: coloca sede, almacenes, granjas/fábricas, carreteras y cumple **contratos semanales** de los pueblos. Las **estaciones** cambian rendimientos (olivar, trigo, cítricos) y la demanda turística (zumo/vino en verano).

## Descarga ZIP

https://github.com/miriamcomercio89-ops/Miriam/archive/refs/heads/cursor/industry-manager-b124.zip

Abre `industry-manager/index.html`.

## Contratos (1)

Cada semana los mercados piden productos a precio fijo. Cumplir sube reputación; fallar la baja. Si reputación &lt; 25, **cierran tiendas 10 días**.

## Estaciones (6)

Año de 120 días (4×30): primavera / verano / otoño / invierno. Multiplicadores de agro y turismo.

## Guías PDF a color

`guias/ano-YYYY.pdf` — cada día: **qué edificio** y **casilla (X,Y)** exacta + contrato del día.

## Trucos de dinero

| Código | Efecto |
|--------|--------|
| `PASTA_GORDA` | +500.000 € |
| `MILLON_EXPRESS` | +1.000.000 € |
| `SOCORRO_CAJA` | mínimo 100.000 € |
| `INDUSTRIA_TOTAL` | desbloquea I+D |
| `REPUTACION_MAX` | reputación 100 |

Panel **Trucos** en el juego.

```bash
node tools/generate-century-guides.js
```
