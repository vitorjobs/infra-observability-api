# #!/bin/bash

# set -e

# # ==============================
# # CONFIGURAÇÕES
# # ==============================

# REMOTE_USER="suporte"
# REMOTE_HOST="10.166.64.12"
# REMOTE_DIR="/var/www/app"
# LOCAL_DIR="$(pwd)"
# SSH_KEY="$HOME/.ssh/id_rsa"   # remova -i se não usar chave

# echo "🚀 Iniciando deploy..."

# # ==============================
# # ENVIAR CÓDIGO
# # ==============================

# echo "📦 Enviando arquivos..."
# rsync -avz --delete \
#   --exclude node_modules \
#   --exclude .git \
#   --exclude build \
#   --exclude logs \
#   --exclude docker \
#   --exclude deploy \
#   -e "ssh -i $SSH_KEY" \
#   $LOCAL_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# echo "✅ Código enviado com sucesso."

# # ==============================
# # EXECUTAR COMANDOS NA VM
# # ==============================

# echo "⚙️ Executando build remoto..."

# ssh -t -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
#   set -e
#   cd $REMOTE_DIR

#   echo "📦 Instalando dependências..."
#   npm i

#   echo "🏗️ Gerando build..."
#   npm run build

#   echo "🛑 Parando processo anterior (se existir)..."
#   pkill -f "start:prod" || true

#   echo "▶️ Iniciando aplicação..."
#   nohup npm run start:prod > app.log 2>&1 &

#   echo "✅ Aplicação iniciada com sucesso!"
# EOF

# echo "🎉 Deploy finalizado!"


#!/bin/bash

set -e

# ==============================
# CONFIGURAÇÕES
# ==============================

REMOTE_USER="suporte"
REMOTE_HOST="10.166.64.12"
REMOTE_DIR="/var/www/app"
LOCAL_DIR="$(pwd)"
SSH_KEY="$HOME/.ssh/id_rsa"

echo "🚀 Iniciando deploy com PM2..."

# ==============================
# ENVIO DO CÓDIGO
# ==============================

echo "📦 Enviando código para a VM..."

rsync -avz --delete \
  --no-group --no-perms \
  --exclude node_modules \
  --exclude .git \
  -e "ssh -i $SSH_KEY" \
  $LOCAL_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

echo "✅ Código enviado."

# ==============================
# BUILD E RESTART REMOTO
# ==============================

echo "⚙️ Executando build e restart via PM2..."

ssh -t -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
  set -e

  cd $REMOTE_DIR

  echo "📦 Instalando dependências..."
  npm i

  echo "🏗️ Gerando build..."
  npm run build

  echo "🔁 Verificando aplicação no PM2..."

  if pm2 describe veeam-backup-monitor >/dev/null 2>&1; then
      echo "♻️ Aplicação já existe — reiniciando..."
      npm run restart:pm2
  else
      echo "▶️ Aplicação não existe — iniciando..."
      npm run start:pm2
  fi

  echo "💾 Salvando estado do PM2..."
  pm2 save

  echo "📊 Status PM2:"
  pm2 list
EOF

echo "🎉 Deploy com PM2 finalizado com sucesso!"