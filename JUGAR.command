#!/bin/bash
cd "$(dirname "$0")"
echo
echo "  Periodica — se abre en el navegador, con formato."
echo "  No abras index.html. No cierres esta ventana."
echo

if command -v python3 >/dev/null 2>&1; then
  exec python3 "./jugar-servidor.py"
fi
if command -v python >/dev/null 2>&1; then
  exec python "./jugar-servidor.py"
fi
if command -v node >/dev/null 2>&1; then
  if [ ! -d node_modules ]; then
    echo "Primera vez: instalando. Espera un minuto..."
    npm install || exit 1
  fi
  exec npm start
fi

echo "Falta Python o Node.js. En Mac suele bastar con Python."
echo "Si no, instala Node LTS en https://nodejs.org"
open "https://nodejs.org" 2>/dev/null || true
read -r
exit 1
