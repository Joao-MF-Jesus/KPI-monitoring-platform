# KPI Monitoring Platform

Plataforma MVP para monitoramento de KPIs de negócio a partir de planilhas Excel.

O projeto permite importar arquivos, tratar dados comerciais e visualizar indicadores como faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas.

A aplicação foi desenvolvida como projeto de portfólio para demonstrar um fluxo completo de análise de dados: upload, tratamento, visualização, alertas e persistência em banco.

---

## Links

- Deploy: https://kpi-monitoring-platform.netlify.app
- Dashboard: https://kpi-monitoring-platform.netlify.app/#dashboard
- Repositório: https://github.com/Joao-MF-Jesus/KPI-monitoring-platform

---

## Demonstração

### Dashboard em modo demo

![Dashboard em modo demo](docs/dashboard-demo.png)

### Comparativo de período

![Comparativo de período](docs/comparativo-periodo.png)

### Alertas operacionais

![Alertas operacionais](docs/alertas-operacionais.png)

---

## Problema que o projeto resolve

Muitas empresas acompanham indicadores comerciais em planilhas separadas, dificultando a análise de desempenho e a identificação rápida de problemas.

Este projeto centraliza os dados, transforma planilhas em indicadores visuais e ajuda a acompanhar a evolução de métricas importantes para o negócio.

---

## Funcionalidades

- Upload de planilhas Excel.
- Modo demo para visitantes, sem alterar a base real.
- Login administrativo.
- Salvamento no Supabase para usuário autenticado.
- Dashboard com KPIs comerciais.
- Comparativo entre períodos.
- Leitura executiva dos resultados.
- Alertas operacionais para CPA, CPL e ROI.
- Exportação de KPIs, alertas e logs.

---

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- Recharts
- XLSX
- Netlify
- Python
- Pandas
- Streamlit
