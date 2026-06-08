# KPI Monitoring Platform

Plataforma de observabilidade comercial para acompanhar KPIs, alertas operacionais, comparativos de periodo e importacao de planilhas.

O projeto combina um pipeline Python para ETL, Supabase/Postgres como banco relacional e um dashboard React para visualizacao, exportacao e importacao de dados.

## Features

- Dashboard React com tema claro/escuro
- Filtros por mes e canal/origem
- Comparacao entre periodos
- Leitura executiva automatica
- Cards de faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas
- Graficos de tendencia, ROI/custos e top origens
- Alertas operacionais por CPA, CPL e ROI
- Exportacao CSV de KPIs, alertas e logs operacionais
- Upload de planilha Excel com tratamento automatico
- Supabase com schema SQL versionado
- ETL Python legado para importacao local
- Dashboard Streamlit legado

## Stack

- React
- TypeScript
- Vite
- Recharts
- Supabase
- Python
- Pandas / SQLAlchemy / OpenPyXL
- Streamlit

## Estrutura

```text
frontend/              Dashboard React
supabase/              Schema, seed e politicas SQL
src/                   ETL, KPIs, alertas e conexao com banco
app/dashboard.py       Dashboard Streamlit legado
data/raw/              Planilhas locais anonimizadas
```

## Supabase

Execute os arquivos no SQL Editor nesta ordem:

1. `supabase/schema.sql`
2. `supabase/authenticated_write_policies.sql`
3. Opcional: `supabase/seed.sql`

O `schema.sql` cria as tabelas e leitura publica de demo. O arquivo `authenticated_write_policies.sql` permite importacao de planilha apenas para usuarios autenticados.

## Frontend

Crie `frontend/.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key_publica
```

Rode:

```powershell
cd frontend
npm install
npm run dev
```

## Upload de Planilha

O upload aceita arquivos `.xlsx` ou `.xls` com colunas equivalentes a:

```text
Dia
Invest. Total
Lead - Geral
Vendas
Faturamento Bruto
Lucro Liquido
```

O frontend calcula ROI, CPA, CPL, margem e gera alertas antes de gravar no Supabase.

## Importador Python

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Para usar Postgres/Supabase no Python, copie `.env.example` para `.env` e configure:

```env
DB_DRIVER=postgresql
DATABASE_URL=postgresql+psycopg://...
```

## Streamlit Legado

```powershell
python -m streamlit run app/dashboard.py
```

## Seguranca

- Nao versionar `.env`
- Nao versionar bancos `.db`
- Nao versionar logs reais
- Nao versionar planilhas reais
- Nao usar service role key no frontend
- Usar dados ficticios para demo publica
