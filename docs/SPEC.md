# SPEC — Loterías Álora

## Visión
Simulador realista de mostrador. Jugadora: Miriam. Ubicación: Álora (única administración, ~13.000 hab.). Sin game over.

## Tiempo
- Escala base 0.25 (4× más lento que el tiempo real)
- Velocidades: 0 (pausa), 1, 2, 4
- Oficina: L–V 08:00–20:00
- Cierre → balance → siguiente día laborable 08:00
- Festivos nacionales + Andalucía + locales Álora

## Caja
- Efectivo con denominaciones EUR; el jugador elige cambio
- Si el cambio no cuadra: aviso y corregir (sin castigo)
- Tarjeta / Bizum / transferencia: cobro exacto a banco
- Fondo de cambio al abrir; arqueo al cerrar

## Clientes
- ~280 habituales con gustos (pueden variar)
- Visitantes de paso
- Más afluencia en Navidad / Niño / viernes Euromillones
- Reserva sin pagar si no hay stock; plazo según producto

## Economía
- Capital inicial medio (~9.500 € banco + fondo caja)
- Comisiones por producto
- Gastos: alquiler, luz, agua, internet, seguro, limpieza, material
- Impuestos trimestrales estimados (IVA + IRPF)

## Guardado
- 3 slots localStorage
- Autosave al cerrar el día (hueco activo)
- Export / import JSON

## Productos
- Reales: LAE, ONCE, rascas
- Inventadas: autonómicas / provinciales / locales
