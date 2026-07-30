# SPEC — Miriam: Simulador de Administración de Loterías

Resumen rápido
- Aplicación 100% cliente (HTML/CSS/JS) que se guarda en localStorage y permite exportar/importar JSON.
- Tiempo de juego escalado 4× más lento que el real.
- Horario de oficina: 09:00–14:00 y 17:00–22:00 (hora del juego). Cerrado sábados y domingos. Festivos importables manualmente.
- Contabilidad detallada, clientes con historial, ventas, pago de premios, gestión de stock, etc.

Estructura inicial de ficheros
- index.html — interfaz principal
- styles.css — estilos
- app.js — lógica del cliente y motor principal
- data/games.json — catálogo de juegos (plantilla)
- docs/SPEC.md — esta especificación

Modelos de datos (simplificado)
- state: {
    createdAt,
    gameStartReal,
    gameStartOffsetMs,
    clients: [{id,name,dni,dob,contact,history:[]}],
    sales: [{id,createdAt,gameId,gameName,amount,clientId?}],
    accounting: { entries: [{id,date,description,debit,credit,meta}] },
    gamesCatalog: [ ...games ],
    holidays: ["YYYY-MM-DD"],
    seeds: [{id,date,seed,hash,gameId}]
  }

Funcionalidades planificadas (primeros commits)
1) Reloj de juego y apertura/cierre
2) Export / Import JSON
3) Catálogo de juegos: añadir los juegos reales de LAE y ONCE + rascas + inventados (>50)
4) Panel de ventas: venta de boletos y registro de ventas
5) Contabilidad: asientos automáticos de ventas y pagos de premios; libros básicos
6) Clientes: fichas con historial
7) Sorteos: motor que genera números/rascas con seeds y hashes para auditoría

Siguiente pasos
- Rellenar `data/games.json` con todos los juegos reales (LAE y ONCE) y los juegos inventados hasta 50+. Recolectaré reglas y probabilidades públicas y las incorporaré como datos estructurados.
- Implementar motor de sorteos y comprobación automática de premios.
- Implementar pagos de premios y provisiones contables.

Notas legales y de recursos
- Se usarán nombres reales y (si autorizas) logos oficiales como placeholders. Recomiendo revisar logos y permisos para uso fuera de demo.

