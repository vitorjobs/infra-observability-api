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

