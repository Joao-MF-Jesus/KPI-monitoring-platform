# KPI Monitoring Platform

Plataforma MVP para monitoramento de KPIs de negocio a partir de planilhas. O projeto permite importar arquivos Excel, tratar os dados, persistir informacoes no Supabase/PostgreSQL e visualizar indicadores como faturamento, lucro, ROI, CPA, CPL, leads e vendas.

Tambem inclui alertas operacionais e exportacao de dados/logs para apoiar auditoria, acompanhamento e analise de desempenho.

## Deploy

- Site publicado: https://kpi-monitoring-platform.netlify.app
- Dashboard: https://kpi-monitoring-platform.netlify.app/#dashboard

## Problema que o projeto resolve

Muitas empresas acompanham indicadores em planilhas separadas, dificultando a analise de desempenho. Este projeto centraliza os dados, transforma planilhas em indicadores visuais e ajuda a identificar problemas de performance com mais rapidez.

## Funcionalidades

- **Upload de planilhas**: importacao de arquivos Excel com dados de campanhas, vendas e indicadores.
- **Tratamento de dados**: padronizacao de datas, numeros e colunas antes da analise.
- **Dashboard de KPIs**: visualizacao de faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas.
- **Comparativo de periodo**: comparacao dos indicadores com meses anteriores ou periodos selecionados.
- **Leitura executiva**: resumo automatico sobre variacao de faturamento, ROI, margem e ticket medio.
- **Alertas operacionais**: identificacao de CPA alto, CPL alto e ROI abaixo do esperado.
- **Exportacao CSV**: download de KPIs, alertas e logs processados.
- **Tema claro/escuro**: interface adaptavel para diferentes preferencias de visualizacao.
- **Layout responsivo**: experiencia ajustada para desktop e mobile.

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

## Arquitetura resumida

```text
frontend/              Aplicacao React publicada no Netlify
supabase/              Schema, seed e politicas SQL do banco
src/                   Pipeline Python/ETL e regras de KPIs
app/dashboard.py       Dashboard Streamlit legado
data/                  Estrutura local para planilhas de exemplo
```

## Fluxo principal

1. O usuario acessa a aplicacao publicada.
2. Importa uma planilha Excel com dados operacionais.
3. O sistema le e padroniza os dados.
4. Os registros tratados sao gravados no Supabase/PostgreSQL.
5. O dashboard recalcula os KPIs e atualiza graficos, comparativos e alertas.
6. Os dados processados podem ser exportados em CSV.

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

### Supabase

Execute os arquivos SQL no Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql` opcional, para dados ficticios
3. `supabase/authenticated_write_policies.sql` para permitir escrita autenticada

Para ambiente de demonstracao publica, existe tambem:

```text
supabase/demo_public_upload_policies.sql
```

Esse arquivo libera upload publico para facilitar testes de portfolio. Nao e recomendado para uso em producao.

### Python / ETL legado

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

### Streamlit legado

```powershell
python -m streamlit run app/dashboard.py
```

## Formato esperado da planilha

O importador aceita arquivos `.xlsx` ou `.xls` com colunas equivalentes a:

```text
Dia
Invest. Total
Lead - Geral
Vendas
Faturamento Bruto
Lucro Liquido
```

Tambem ha suporte para variacoes comuns como `Data`, `Investimento`, `Leads`, `Faturamento` e `Lucro`.

## Seguranca e dados

- Nao versionar `.env`
- Nao expor service role key no frontend
- Usar apenas publishable/anon key no cliente
- Nao versionar bancos locais `.db`
- Nao versionar logs reais
- Nao versionar planilhas reais de empresas
- Usar dados ficticios em demonstracoes publicas

## Status do projeto

Projeto em versao MVP, desenvolvido para demonstrar um fluxo completo de analise: upload, tratamento, persistencia, visualizacao e monitoramento de KPIs.

## Proximos passos

- Criar autenticacao mais robusta para ambientes privados
- Adicionar historico de importacoes
- Validar planilhas com feedback linha a linha
- Criar testes automatizados para o parser de planilhas
- Evoluir permissoes por usuario/organizacao
