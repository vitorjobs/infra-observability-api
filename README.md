# API Veeam Monitoramento

API para coleta, monitoramento e automação de informações do Veeam One, parte do Veeam Backup & Replication.

---

## 📖 Descrição

Este projeto tem como objetivo fornecer uma API robusta para monitoramento de ambientes Veeam, facilitando a integração com ferramentas de observabilidade como Prometheus e Grafana. A API coleta dados do Veeam One, permitindo o acompanhamento detalhado de jobs, repositórios, VMs protegidas, tape libraries, compliance e muito mais.

---

## 🎯 Objetivos do Projeto

- Coletar métricas detalhadas do Veeam One via API.
- Facilitar o monitoramento de jobs de backup, repositórios, Scale-Out Backup Repositories, VMs protegidas, tape libraries, Exagrid e compliance.
- Integrar facilmente com Prometheus e Grafana para dashboards customizados.
- Automatizar processos de monitoramento e alertas.
- Fornecer endpoints RESTful para consumo externo.

---

## 🚀 Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Fastify**
- **Prom-Client**
- **Prometheus**
- **Grafana**
- **Veeam Backup & Replication**
- **Veeam One**

---

## 📦 Funcionalidades Monitoradas

- Jobs de Backup
- Repositórios de Backup
- Scale-Out Backup Repositories
- VMs Protegidas
- Tape Libraries
- Exagrid
- Compliance de VMs
- Versão do Veeam One

---

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js >= 18.x
- Yarn ou npm
- Acesso ao Veeam One API

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/veeam-mtr.git
cd veeam-mtr

# Instale as dependências
npm install
# ou
yarn install
```

### Ambiente

Copie o arquivo `env.EXEMPLE` para `.env` na raiz do projeto e preencha com as informações corretas de autenticação e conexão com a API do Veeam One.

```bash
cp env.EXEMPLE .env
# Edite o arquivo .env conforme necessário
```

### Execução em Desenvolvimento

```bash
npm run start:dev
# ou
yarn start:dev
```

### Build para Produção

```bash
npm run build
npm run start:prod
```

### Gerenciamento com PM2

```bash
npm run start:pm2
npm run stop:pm2
npm run restart:pm2
npm run delete:pm2
npm run logs:pm2
```

# Deploy 

# 📋 Visão Geral do Fluxo

text ```
  Máquina Local (Dev) → SSH → VM Remota → Git Pull → Instalação Dependências → Restart Aplicação
```


  rm -rf node_modules

    echo "🧹 Limpando módulos antigos do npm..."
    npm cache clean --force




7️⃣ Configuração de Chave SSH (para automação)
bash
# Na máquina local, gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "deploy@local"

# Copiar chave pública para a VM
ssh-copy-id -i ~/.ssh/id_rsa.pub suporte@10.166.64.12

# Ou manualmente:
cat ~/.ssh/id_rsa.pub | ssh suporte@10.166.64.12 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

```

# Deploy - Verificações

🚀 OPÇÃO 3 — Mais direto (sem depender do script remoto)

Se você quiser nem depender de arquivo na VM, pode rodar direto:

🔎 Status direto:
ssh suporte@10.166.64.12 "pgrep -f start:prod && echo 'Rodando' || echo 'Parado'"
🛑 Parar direto:
ssh suporte@10.166.64.12 "pkill -f start:prod || echo 'Já estava parado'"


root@VM-7CTA-APP-MTR:/home/suporte# kill -9 23338
root@VM-7CTA-APP-MTR:/home/suporte# sudo lsof -i :3001
root@VM-7CTA-APP-MTR:/home/suporte# ss -tulpn | grep 3001
root@VM-7CTA-APP-MTR:/home/suporte# 

##########3

✅ PM2 instalado: 
                        -------------

__/\\\\\\\\\\\\\____/\\\\____________/\\\\____/\\\\\\\\\_____
 _\/\\\/////////\\\_\/\\\\\\________/\\\\\\__/\\\///////\\\___
  _\/\\\_______\/\\\_\/\\\//\\\____/\\\//\\\_\///______\//\\\__
   _\/\\\\\\\\\\\\\/__\/\\\\///\\\/\\\/_\/\\\___________/\\\/___
    _\/\\\/////////____\/\\\__\///\\\/___\/\\\________/\\\//_____
     _\/\\\_____________\/\\\____\///_____\/\\\_____/\\\//________
      _\/\\\_____________\/\\\_____________\/\\\___/\\\/___________
       _\/\\\_____________\/\\\_____________\/\\\__/\\\\\\\\\\\\\\\_
        _\///______________\///______________\///__\///////////////__


                          Runtime Edition

        PM2 is a Production Process Manager for Node.js applications
                     with a built-in Load Balancer.

                Start and Daemonize any application:
                $ pm2 start app.js

                Load Balance 4 instances of api.js:
                $ pm2 start api.js -i 4

                Monitor in production:
                $ pm2 monitor

                Make pm2 auto-boot at server restart:
                $ pm2 startup

                To go further checkout:
                http://pm2.io/
#########