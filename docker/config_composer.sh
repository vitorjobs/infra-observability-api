# #!/bin/bash

# echo "🚀 Criando estrutura de diretórios para os volumes locais..."

# # Criar a árvore de diretórios de forma otimizada
# mkdir -p volumes/{grafana,prometheus/{data,extensions,logs}}

# echo "✅ Diretórios criados com sucesso."

# # Ajustar permissões para que qualquer usuário possa excluir/modificar
# echo "🔧 Ajustando permissões (chmod 777 -R volumes)..."
# chmod -R 777 volumes

# # Alterar ownership para os usuários esperados por cada serviço
# echo "🔧 Ajustando ownership específico para cada serviço..."

# # Prometheus (usuário nobody - UID 65534)
# sudo chown -R 65534:65534 volumes/prometheus
# echo "➡️ Prometheus: Owner set to UID 65534 (nobody)"

# # Grafana (usuário grafana - UID 472)
# sudo chown -R 472:472 volumes/grafana
# echo "➡️ Grafana: Owner set to UID 472"

# echo "✅ Estrutura e permissões finalizadas com sucesso."

# echo ""
# echo "📂 Estrutura atual:"
# tree volumes 2>/dev/null || ls -R volumes


echo "🚀 Criando estrutura de diretórios para os volumes locais..."

# Estrutura de volumes isolada para o projeto MTR
mkdir -p volumes/mtr_prometheus
mkdir -p volumes/mtr_grafana

echo "✅ Diretórios criados com sucesso."

# Ajustar permissões
echo "🔧 Ajustando permissões (chmod 777 -R volumes)..."
chmod -R 777 volumes

# Alterar ownership
echo "🔧 Ajustando ownership específico para cada serviço..."
sudo chown -R 65534:65534 volumes/mtr_prometheus
echo "➡️ Prometheus: Owner set to UID 65534 (nobody)"

sudo chown -R 472:472 volumes/mtr_grafana
echo "➡️ Grafana: Owner set to UID 472"

echo "✅ Estrutura e permissões finalizadas com sucesso."

echo ""
echo "📂 Estrutura atual:"
tree volumes 2>/dev/null || ls -R volumes
