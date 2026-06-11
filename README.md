# KPI Monitoring Platform

Plataforma MVP para monitoramento de KPIs de negócio a partir de planilhas.

O projeto permite importar arquivos Excel, tratar os dados, persistir informações no Supabase/PostgreSQL e visualizar indicadores como faturamento, lucro, ROI, CPA, CPL, leads e vendas.

Também inclui alertas operacionais e exportação de dados/logs para apoiar auditoria, acompanhamento e análise de desempenho.

---

## Deploy

- Site publicado: https://kpi-monitoring-platform.netlify.app
- Dashboard: https://kpi-monitoring-platform.netlify.app/#dashboard
- Repositório: https://github.com/Joao-MF-Jesus/KPI-monitoring-platform

---

## Problema que o projeto resolve

Muitas empresas acompanham indicadores em planilhas separadas, dificultando a análise de desempenho.

Este projeto centraliza os dados, transforma planilhas em indicadores visuais e ajuda a identificar problemas de performance com mais rapidez.

---

## Funcionalidades

- **Upload de planilhas:** importação de arquivos Excel com dados de campanhas, vendas e indicadores.
- **Tratamento de dados:** padronização de datas, números e colunas antes da análise.
- **Dashboard de KPIs:** visualização de faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas.
- **Comparativo de período:** comparação dos indicadores com meses anteriores ou períodos selecionados.
- **Leitura executiva:** resumo automático sobre variação de faturamento, ROI, margem e ticket médio.
- **Alertas operacionais:** identificação de CPA alto, CPL alto e ROI abaixo do esperado.
- **Exportação CSV:** download de KPIs, alertas e logs processados.
- **Tema claro/escuro:** interface adaptável para diferentes preferências de visualização.
- **Layout responsivo:** experiência ajustada para desktop e mobile.

---

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- Netlify
- Python
- Pandas
- Streamlit

---

## Arquitetura resumida

```text
frontend/              Aplicação React publicada no Netlify
supabase/              Schema, seed e políticas SQL do banco
src/                   Pipeline Python/ETL e regras de KPIs
app/dashboard.py       Dashboard Streamlit legado
data/                  Estrutura local para planilhas de exemplo
