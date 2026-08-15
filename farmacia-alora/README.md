# Farmacia Álora — TPV de práctica (España)

## Abrir
Abre `index.html` en el navegador (doble clic o servidor local). Si no ves el catálogo nuevo: **Ctrl+Shift+R**.

## Fase 1 — Catálogo España
- **879 productos** · **45 categorías** · **24 ramas**
- Marcas reales de oficina de farmacia en España + EFG (Cinfa, Normon, Kern…)
- OTC, parafarmacia, Rx, controlados, frigorífico, ortopedia, óptica, vet, snacks…
- Cada producto tiene **procedimiento de mostrador** (se muestra al añadir al carrito)

## Manuales PDF
Carpeta `manuales/`: **un PDF por categoría**, **una página por producto** (ficha completa + procedimiento + envase ilustrado).

Regenerar:
```bash
python3 scripts/build_fase1.py
```

## Clientes
Pueden pedir producto exacto, por síntomas, con receta, o ambas. Valida DNI, caducidad y producto.

## Extra
TPV euros, reloj 1 min = 1 h, genéricos, controlados, nevera, planograma, campañas, minijuegos, herramientas clínicas.

## Aviso
Simulador educativo. No sustituye ficha AEMPS ni consejo médico. Envases ilustrados (no fotos comerciales).
