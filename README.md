# Miriam — Administración de Loterías (proyecto)

Proyecto: videojuego/simulador de gestión de una administración de loterías ubicado en Álora.

Este repositorio contiene el scaffold inicial del proyecto: una aplicación en HTML/CSS/JS que corre totalmente en el navegador (sin servidor), usa localStorage para persistencia y permite exportar/importar el estado en JSON.

Características del scaffold inicial:
- Reloj de juego con escala temporal: el tiempo del juego va 4× más lento que el real (gameTime = start + elapsed * 0.25).
- Lógica de apertura de oficina: 09:00–14:00 y 17:00–22:00 (hora del juego). Cerrado sábados y domingos. Festivos habilitables manualmente.
- Funciones básicas de exportar/importar JSON del estado del juego.
- Estructura básica para añadir los juegos, ventas, contabilidad, clientes, etc.

Cómo usar:
1. Clona el repo o descarga los archivos.
2. Abre `index.html` en un navegador moderno.
3. Usa los botones "Exportar" / "Importar" para guardar o restaurar el estado.

Siguiente paso:
- Crear la rama `feature/lottery-full` desde la rama por defecto y continuar con la implementación completa de juegos, contabilidad y UI.

Commit inicial: scaffold con reloj escalado y export/import JSON.

---

## Guía Cities: Skylines — Leonida

Documento aparte (no relacionado con el juego de loterías):

- [`docs/GUIA_CITIES_SKYLINES_LEONIDA_500_FASES.md`](docs/GUIA_CITIES_SKYLINES_LEONIDA_500_FASES.md) — guía de **500 fases** para construir Leonida (+500k, todos los DLC, presupuesto real).
