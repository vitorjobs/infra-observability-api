# O :ro significa "read-only" (somente leitura). Isso indica que o container pode ler os arquivos do diretório montado, mas não pode modificar, criar ou deletar arquivos nesse local.

bash ```
volumes:
  - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
  # │                       │                                      │
  # │                       │                                      └── Modo: ro = read-only
  # │                       └── Diretório no container
  # └── Diretório no host

```

text```
grafana/
├── datasources/
│   └── datasource.yml
└── dashboards/                    # ← Este diretório é montado em /etc/grafana/provisioning/dashboards
    ├── dashboard-provider.yml      ← Provider APONTA para /var/lib/grafana/dashboards
    └── VisaoExecutivaAmbienteVeeam.json  ← Dashboard JSON aqui dentro
```