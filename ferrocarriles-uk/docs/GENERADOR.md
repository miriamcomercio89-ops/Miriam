# Generador de red

## Idea

1. Toma **corredores** (secuencias de hubs) y genera pares/saltos con `via`.
2. Respeta **cuotas por tipo** (`AV`, `RE`, `S`…).
3. Rellena con **ramales por proximidad** (haversine) y filtros de distancia min/max.
4. Asigna operador según cobertura de Lands + tipo de servicio + competencia.
5. Copia el **color del operador** y elige material de su flota principal.

## Comandos

```bash
npm run build
npm run generate:sample   # ~400 líneas
npm run generate:mass     # 8000 líneas
node generator/cli.mjs batch 3000
```

## Campos de cada línea

`id`, `codigo`, `codigo_interno`, `nombre`, `tipo_id`, `prefijo`, `operador_id`, `color`, `origen`, `destino`, `via`, `distancia_km`, `frecuencia_min`, `material`, `origen_datos`, `lands`, `corredor_id`
