#!/bin/bash

set -e

# ==============================
# CONFIGURAÇÕES
# ==============================

REMOTE_USER="suporte"
REMOTE_HOST="10.166.64.12"
REMOTE_DIR="/var/www/app"
LOCAL_DOCKER_DIR="$HOME/Documentos/Asp_Guedes/01_Veeam/2026/infra-observability-api/docker"
SSH_KEY="$HOME/.ssh/id_rsa"

echo "🚀 Iniciando deploy Docker..."

# ==============================
# VALIDAR DIRETÓRIO LOCAL
# ==============================

if [ ! -d "$LOCAL_DOCKER_DIR" ]; then
  echo "❌ Diretório docker/ não encontrado."
  exit 1
fi

# ==============================
# ENVIAR DIRETÓRIO DOCKER
# ==============================

echo "📦 Enviando diretório docker..."

rsync -avz --delete \
  --no-group --no-perms \
  -e "ssh -i $SSH_KEY" \
  $LOCAL_DOCKER_DIR/ \
  $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/docker/

echo "✅ Diretório docker enviado."

# ==============================
# EXECUTAR DOCKER COMPOSE REMOTO
# ==============================

echo "🐳 Executando docker compose..."

ssh -t -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
  set -e

  cd $REMOTE_DIR/docker

  echo "🛑 Parando containers antigos..."
  docker compose down || true

  echo "🏗️ Subindo containers..."
  docker compose up -d --build

  echo "📊 Status dos containers:"
  docker compose ps
EOF

echo "🎉 Deploy Docker finalizado!"