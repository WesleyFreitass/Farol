#!/bin/sh
set -e

mkdir -p /app/data /app/public/uploads

# Inicializa o banco SQLite na pasta persistida se ainda nao existir
if [ ! -f /app/data/dev.db ]; then
  echo "📦 Criando banco de dados SQLite inicial em /app/data/dev.db..."
  if [ -f /app/prisma/dev.db ]; then
    cp /app/prisma/dev.db /app/data/dev.db
  else
    touch /app/data/dev.db
  fi
fi

chmod -R 777 /app/data /app/public/uploads

exec "$@"
