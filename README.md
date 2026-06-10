# KPI Monitoring Platform

Plataforma MVP para monitoramento de KPIs de negÃ³cio a partir de planilhas.

O projeto permite importar arquivos Excel, tratar os dados, persistir informaÃ§Ãµes no Supabase/PostgreSQL e visualizar indicadores como faturamento, lucro, ROI, CPA, CPL, leads e vendas.

TambÃ©m inclui alertas operacionais e exportaÃ§Ã£o de dados/logs para apoiar auditoria, acompanhamento e anÃ¡lise de desempenho.

---

## Deploy

- Site publicado: https://kpi-monitoring-platform.netlify.app
- Dashboard: https://kpi-monitoring-platform.netlify.app/#dashboard
- RepositÃ³rio: https://github.com/Joao-MF-Jesus/KPI-monitoring-platform

---

## DemonstraÃ§Ã£o

> Prints sugeridos para apresentaÃ§Ã£o do projeto. As imagens podem ser adicionadas em `docs/images/`.

### Home do projeto

![Home do projeto](docs/images/home.png)

### Dashboard de KPIs

![Dashboard de KPIs](docs/images/dashboard.png)

### Upload de planilha

![Upload de planilha](docs/images/upload.png)

---

## Problema que o projeto resolve

Muitas empresas acompanham indicadores em planilhas separadas, dificultando a anÃ¡lise de desempenho.

Este projeto centraliza os dados, transforma planilhas em indicadores visuais e ajuda a identificar problemas de performance com mais rapidez.

---

## Funcionalidades

- **Upload de planilhas:** importaÃ§Ã£o de arquivos Excel com dados de campanhas, vendas e indicadores.
- **Tratamento de dados:** padronizaÃ§Ã£o de datas, nÃºmeros e colunas antes da anÃ¡lise.
- **Dashboard de KPIs:** visualizaÃ§Ã£o de faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas.
- **Comparativo de perÃ­odo:** comparaÃ§Ã£o dos indicadores com meses anteriores ou perÃ­odos selecionados.
- **Leitura executiva:** resumo automÃ¡tico sobre variaÃ§Ã£o de faturamento, ROI, margem e ticket mÃ©dio.
- **Alertas operacionais:** identificaÃ§Ã£o de CPA alto, CPL alto e ROI abaixo do esperado.
- **ExportaÃ§Ã£o CSV:** download de KPIs, alertas e logs processados.
- **Tema claro/escuro:** interface adaptÃ¡vel para diferentes preferÃªncias de visualizaÃ§Ã£o.
- **Layout responsivo:** experiÃªncia ajustada para desktop e mobile.

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
frontend/              AplicaÃ§Ã£o React publicada no Netlify
supabase/              Schema, seed e polÃ­ticas SQL do banco
src/                   Pipeline Python/ETL e regras de KPIs
app/dashboard.py       Dashboard Streamlit legado
data/                  Estrutura local para planilhas de exemplo
docs/images/           Prints e imagens de demonstraÃ§Ã£o
```

---

## Fluxo principal

1. O usuÃ¡rio acessa a aplicaÃ§Ã£o publicada.
2. Importa uma planilha Excel com dados operacionais.
3. O sistema lÃª, trata e padroniza as informaÃ§Ãµes.
4. Os registros tratados sÃ£o gravados no Supabase/PostgreSQL.
5. O dashboard recalcula os KPIs e atualiza grÃ¡ficos, comparativos e alertas.
6. Os dados processados podem ser exportados em CSV.

---

## Como rodar localmente

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Crie um arquivo `frontend/.env` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key_publica
```

Para gerar a versÃ£o de produÃ§Ã£o:

```powershell
cd frontend
npm run build
```

---

## ConfiguraÃ§Ã£o do Supabase

Execute os arquivos SQL no Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql` opcional, para dados fictÃ­cios
3. `supabase/authenticated_write_policies.sql` para permitir escrita autenticada

Para ambiente de demonstraÃ§Ã£o pÃºblica, existe tambÃ©m:

```text
supabase/demo_public_upload_policies.sql
```

Esse arquivo libera upload pÃºblico para facilitar testes de portfÃ³lio. NÃ£o Ã© recomendado para uso em produÃ§Ã£o.

---

## Formato esperado da planilha

O importador aceita arquivos `.xlsx` ou `.xls` com colunas equivalentes a:

```text
Dia
Invest. Total
Lead - Geral
Vendas
Faturamento Bruto
Lucro LÃ­quido
```

TambÃ©m hÃ¡ suporte para variaÃ§Ãµes comuns como:

```text
Data
Investimento
Leads
Faturamento
Lucro
```

---

## Python / ETL legado

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

---

## Streamlit legado

```powershell
python -m streamlit run app/dashboard.py
```

---

## SeguranÃ§a e dados

- NÃ£o versionar `.env`.
- NÃ£o expor service role key no frontend.
- Usar apenas publishable/anon key no cliente.
- NÃ£o versionar bancos locais `.db`.
- NÃ£o versionar logs reais.
- NÃ£o versionar planilhas reais de empresas.
- Usar dados fictÃ­cios em demonstraÃ§Ãµes pÃºblicas.

---

## Status do projeto

Projeto em versÃ£o MVP, desenvolvido para demonstrar um fluxo completo de anÃ¡lise: upload, tratamento, persistÃªncia, visualizaÃ§Ã£o e monitoramento de KPIs.

---

## PrÃ³ximos passos

- Criar autenticaÃ§Ã£o mais robusta para ambientes privados.
- Adicionar histÃ³rico de importaÃ§Ãµes.
- Validar planilhas com feedback linha a linha.
- Criar testes automatizados para o parser de planilhas.
- Evoluir permissÃµes por usuÃ¡rio/organizaÃ§Ã£o.
