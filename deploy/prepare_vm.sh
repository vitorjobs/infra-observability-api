#!/bin/bash

set -e

echo "🔄 Atualizando sistema..."
sudo apt update -y
sudo apt upgrade -y

# ==========================================
# INSTALAÇÃO DO NODE.JS (LTS)
# ==========================================

if command -v node >/dev/null 2>&1; then
    echo "✅ Node já instalado: $(node -v)"
else
    echo "📦 Instalando Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✅ Node instalado: $(node -v)"
fi

echo "📦 Versão do npm: $(npm -v)"

# ==========================================
# INSTALAÇÃO DO DOCKER (OFICIAL)
# ==========================================

if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker já instalado: $(docker -v)"
else
    echo "🐳 Instalando Docker Engine..."

    sudo apt install -y ca-certificates curl gnupg

    sudo install -m 0755 -d /etc/apt/keyrings

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt update -y

    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    sudo systemctl enable docker
    sudo systemctl start docker

    echo "✅ Docker instalado: $(docker -v)"
fi

# ==========================================
# VALIDAR DOCKER COMPOSE
# ==========================================

if docker compose version >/dev/null 2>&1; then
    echo "✅ Docker Compose instalado: $(docker compose version)"
else
    echo "❌ Docker Compose não encontrado."
    exit 1
fi

# ==========================================
# PERMISSÃO PARA USAR DOCKER SEM SUDO
# ==========================================

if groups $USER | grep -q docker; then
    echo "✅ Usuário já está no grupo docker"
else
    echo "🔧 Adicionando usuário ao grupo docker..."
    sudo usermod -aG docker $USER
    echo "⚠️ Faça logout e login novamente para aplicar permissão."
fi

echo ""
echo "🎉 VM preparada com sucesso!"
echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "Docker: $(docker -v)"
echo "Docker Compose: $(docker compose version)"