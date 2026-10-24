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

# Sincroniza eventuais atualizações de schema no banco SQLite persistido
if [ -f ./node_modules/prisma/build/index.js ]; then
  echo "🔄 Sincronizando schema do Prisma no banco persistido..."
  node ./node_modules/prisma/build/index.js db push --accept-data-loss || true
fi

chmod -R 777 /app/data /app/public/uploads

exec "$@"
