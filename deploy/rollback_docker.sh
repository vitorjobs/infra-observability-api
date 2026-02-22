#!/bin/bash

set -e

REMOTE_USER="suporte"
REMOTE_HOST="10.166.64.12"
REMOTE_DIR="/var/www/app"
SSH_KEY="$HOME/.ssh/id_rsa"

echo "🔄 Iniciando rollback Docker..."

ssh -t -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF

  set -e
  cd $REMOTE_DIR

  cd docker

  echo "🛑 Parando containers atuais..."
  docker compose down -v --rmi all || true

  echo "🛑 Removendo diretório docker..."
  rm -rf $REMOTE_DIR/docker

EOF

echo "✅ Rollback concluído com sucesso!"