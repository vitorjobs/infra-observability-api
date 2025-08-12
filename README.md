# 📡 API de Monitoramento Veeam One

API desenvolvida em **Node.js + TypeScript** para coleta e exportação de métricas do **Veeam One** e **Veeam Backup & Replication** para o **Prometheus**, com visualização no **Grafana**.

---
![Capa do Projeto](./docs/Veeam_One_Summary.gif)

---

## 📖 Descrição

Este projeto conecta-se à API do **Veeam One** para coletar informações sobre jobs de backup, repositórios, VMs protegidas, tape libraries, compliance e armazenamento ExaGrid.  
Os dados coletados são transformados em métricas no formato Prometheus, permitindo o monitoramento centralizado e criação de alertas no Grafana.

Principais recursos:

- Autenticação automática no Veeam One.
- Coleta de métricas em tempo real.
- Exposição de métricas no padrão Prometheus.
- Dashboards customizados no Grafana.
- Execução contínua com PM2 ou Docker.

---

## 🎯 Objetivos do Projeto

- Centralizar o monitoramento do Veeam.
- Fornecer métricas detalhadas para análise e alertas.
- Facilitar a integração com Prometheus e Grafana.
- Automatizar a coleta e evitar consultas manuais no Veeam One.

---

## 🚀 Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Fastify** (servidor HTTP)
- **prom-client** (exportador Prometheus)
- **node-fetch** (requisições HTTP)
- **Prometheus**
- **Grafana**
- **PM2** (gerenciamento de processos)
- **Docker / Docker Compose**

---

## 📦 Métricas Coletadas

### 📂 Jobs de Backup
- Quantidade por status (Sucesso, Erro, Warning, Em execução).
- Lista detalhada de jobs por status.
- Média de duração.
- Top 10 jobs mais demorados.
- Top 10 jobs com maior volume de dados (em TB).

### 💾 SOBR com ExaGrid
- Capacidade total.
- Espaço disponível.
- Espaço utilizado.
- Tarefas em execução.

### 🗄️ Outras métricas (`EM DESENVOLVIMENTO - DASHBOARD`)
- Repositórios de backup.
- VMs protegidas.
- Tape libraries.
- Compliance de VMs.
- Versão e informações do Veeam One.

---

## 🛠️ Estrutura da Aplicação

A aplicação segue o padrão de camadas:

```
src/
 ├── controllers/           # Camada de controle - recebe requisições HTTP
 │    ├── exagrid/          # Métricas do ExaGrid (`EM DESENVOLVIMENTO - DASHBOARD`)
 │    ├── vcenter/          # Integração com vCenter (`EM DESENVOLVIMENTO - DASHBOARD`)
 │    └── veeamOne/         # Controllers para Veeam One
 │         ├── about/
 │         ├── compliance/  # (`EM DESENVOLVIMENTO - DASHBOARD`)
 │         ├── jobs/
 │         ├── repositories/
 │         └── tapes/       # (`EM DESENVOLVIMENTO - DASHBOARD`) 
 │
 ├── script/                # Scripts auxiliares e automações (`EM DESENVOLVIMENTO`)
 │
 ├── services/              # Camada de negócio - integrações e regras
 │    ├── exagrid/
 │    ├── monitoring/       # Exportadores Prometheus
 │    ├── vcenter/          # (`EM DESENVOLVIMENTO - DASHBOARD`)
 │    └── veeamOne/
 │         ├── about/
 │         ├── auth/        # Autenticação no Veeam One
 │         ├── compliance/  # (`EM DESENVOLVIMENTO - DASHBOARD`)
 │         ├── jobs/
 │         ├── repositories/
 │         └── tapes/       # (`EM DESENVOLVIMENTO - DASHBOARD`)
 │
 └── util/                  # Funções utilitárias e exportadores de métricas
      ├── ExagridPrometheusExporter.ts
      ├── GetAllProtectedVMsServiceExporter.ts
      ├── GetJobsServiceExporter.ts
      ├── GetRepositoriesExporter.ts
      └── GetRepositoryScaleoutExporter.ts
```

### Função de cada camada

- **Controllers** → Recebem a requisição, chamam o service e retornam a resposta formatada.
- **Services** → Implementam a lógica de negócio e acessam APIs externas (Veeam One, ExaGrid, vCenter).
- **Util (Exporters)** → Convertem os dados dos services em métricas Prometheus.
- **Scripts** → Executam tarefas auxiliares fora do fluxo principal. (`EM DESENVOLVIMENTO`)

---

## ⚙️ Instalação e Execução

### 1️⃣ Clonar repositório
```bash
git clone https://github.com/vitorjobs/infra-observability-api.git
cd infra-observability-api
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Configurar variáveis de ambiente  
Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias:
```env
VEEAM_ONE_BASE_URL=https://ederecoip:1239/api
VEEAM_ONE_USERNAME=VEEAMONE\user
VEEAM_ONE_PASSWORD=password
VEEAM_ONE_GRANT_TYPE=password
VEEAM_ONE_REFRESH_TOKEN=
VEEAM_TOKEN_EXPIRATION_BUFFER=300 # 5 minutes buffer
VEEAM_ONE_NODE_TLS_REJECT_UNAUTHORIZED=0

```

### 4️⃣ Executar em modo desenvolvimento
```bash
npm run start:dev
```

### 5️⃣ Build e execução em produção
```bash
npm run build       # Para iniciar o build da aplicação com o tsup
ou 
npm run build:v2    # Para iniciar o build da aplicação com o tsup + paramatros
npm run start:prod  # para inicar a aplicaçã com o build no diretório /build
```

### 5️⃣ Build e execução em produção com pm2
```bash
npm run start:pm2     # Para iniciar a aplicação com build + serviço pm2
npm run logs:pm2      # Para coletar os logs da aplicação + serviço pm2
npm run restart:pm2   # Para reinicar o serviço da + serviço pm2aplicação
npm run delete:pm2    # Para deletar o serviço da aplicação + serviço pm2
npm run stop:pm2      # Para parar o serviço da aplicação + serviço pm2
```

---

## 📊 Integração com Prometheus

No arquivo `prometheus.yml` adicione o target da API:
```yaml
scrape_configs:
  - job_name: 'Monitoramento' # Nome genérico para o job
    static_configs:
      - targets: ['endereco_ip_app:3001']

```

Reinicie o Prometheus para aplicar as alterações.

---

<!-- ## 📈 Dashboard Grafana

- Importe o JSON do dashboard fornecido na pasta `/grafana`.
- Configure a fonte de dados do Prometheus.
- Visualize as métricas de jobs, repositórios, VMs e tapes.

--- -->

## 🧩 Fluxo de Funcionamento

```
Prometheus (scrape) → API (controllers) → Services → API Veeam One → Services → Util (Exporters) → Prometheus Registry → Grafana
```

---

## 📜 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar, modificar e distribuir.