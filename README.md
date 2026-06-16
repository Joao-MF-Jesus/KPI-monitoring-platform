# KPI Monitoring Platform

Plataforma MVP para monitoramento de KPIs de negÃ³cio a partir de planilhas Excel.

O projeto permite importar arquivos, tratar dados comerciais, persistir informaÃ§Ãµes no Supabase/PostgreSQL e visualizar indicadores como faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas.

A aplicaÃ§Ã£o foi desenvolvida como projeto de portfÃ³lio para demonstrar um fluxo completo de anÃ¡lise de dados e BI: upload, tratamento, persistÃªncia, visualizaÃ§Ã£o, alertas operacionais e exportaÃ§Ã£o de informaÃ§Ãµes processadas.

---

## Links

- Deploy: https://kpi-monitoring-platform.netlify.app
- Dashboard: https://kpi-monitoring-platform.netlify.app/#dashboard
- RepositÃ³rio: https://github.com/Joao-MF-Jesus/KPI-monitoring-platform

---

## DemonstraÃ§Ã£o

### Dashboard em modo demo

![Dashboard em modo demo](docs/dashboard-demo.jpeg)

### Comparativo de perÃ­odo

![Comparativo de perÃ­odo](docs/comparativo-periodo.jpeg)

### Alertas operacionais

![Alertas operacionais](docs/alertas-operacionais.jpeg)

---

## Problema resolvido

Muitas empresas acompanham indicadores comerciais em planilhas separadas, o que dificulta a anÃ¡lise de desempenho, a comparaÃ§Ã£o entre perÃ­odos e a identificaÃ§Ã£o rÃ¡pida de problemas operacionais.

Este projeto centraliza os dados, transforma planilhas em indicadores visuais e ajuda a acompanhar a evoluÃ§Ã£o de mÃ©tricas importantes para o negÃ³cio, aproximando o fluxo de trabalho de uma soluÃ§Ã£o de BI aplicada.

---

## Funcionalidades

- Upload de planilhas Excel com dados comerciais.
- Modo demo para visitantes, sem alterar a base real do Supabase.
- Login administrativo para persistÃªncia de dados.
- Salvamento no Supabase para administrador autenticado.
- Dashboard com KPIs de faturamento, lucro, ROI, margem, CPA, CPL, leads e vendas.
- Comparativo entre perÃ­odos para anÃ¡lise de evoluÃ§Ã£o.
- Leitura executiva com resumo dos principais resultados.
- Alertas operacionais para CPA, CPL e ROI.
- ExportaÃ§Ã£o de KPIs, alertas e logs processados.
- Interface publicada e acessÃ­vel via Netlify.

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
- Streamlit legado

---

## Arquitetura resumida

```text
frontend/              AplicaÃ§Ã£o React publicada no Netlify
frontend/src/          Interface, parser da planilha e dashboard principal
supabase/              Schema, seed e policies de acesso ao banco
src/                   Pipeline Python/ETL e regras auxiliares de KPIs
app/dashboard.py       Dashboard Streamlit legado
logs/                  Registros gerados no processamento local
```

A versÃ£o publicada usa o frontend React com Supabase como base de dados. A estrutura Python/Streamlit permanece no repositÃ³rio como parte da evoluÃ§Ã£o do projeto e demonstra o fluxo inicial de anÃ¡lise e prototipaÃ§Ã£o.

---

## Fluxo principal

1. O usuÃ¡rio acessa a landing page do projeto.
2. O visitante pode visualizar o dashboard com dados jÃ¡ publicados.
3. O visitante pode importar uma planilha em modo demo local.
4. No modo demo, os dados sÃ£o tratados e exibidos apenas na sessÃ£o atual.
5. Um administrador autenticado pode substituir ou adicionar dados no Supabase.
6. O dashboard recalcula KPIs, grÃ¡ficos, comparativos e alertas.
7. Os dados processados podem ser exportados em CSV.

---

## Modo demo e seguranÃ§a

O projeto foi preparado para funcionar como link pÃºblico de portfÃ³lio.

Visitantes podem testar planilhas em modo demo, mas nÃ£o possuem permissÃ£o para alterar a base real do Supabase. Nesse fluxo, a planilha Ã© processada localmente no navegador e os indicadores sÃ£o atualizados apenas durante a sessÃ£o atual.

Administradores autenticados podem salvar dados no Supabase, respeitando as policies configuradas no banco.

---

## Indicadores calculados

- Faturamento
- Lucro
- ROI
- Margem
- CPA
- CPL
- Leads
- Vendas
- Ticket mÃ©dio
- Comparativo de perÃ­odo
- Alertas operacionais por desempenho

---

## Formato esperado da planilha

A planilha deve conter colunas relacionadas a datas, origem/canal e indicadores comerciais. O parser aceita variaÃ§Ãµes de nomes, mas o formato recomendado Ã©:

| Coluna | DescriÃ§Ã£o |
| --- | --- |
| data | Data de referÃªncia do registro |
| source_sheet | Origem, canal ou aba de referÃªncia |
| investimento_ads | Investimento em mÃ­dia paga |
| leads | Quantidade de leads gerados |
| vendas | Quantidade de vendas realizadas |
| faturamento | Receita gerada |
| lucro | Lucro estimado ou informado |
| cpa | Custo por aquisiÃ§Ã£o |
| cpl | Custo por lead |
| roi | Retorno sobre investimento |
| margem | Margem de lucro |

---

## Como rodar localmente

### Frontend React

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

No arquivo `frontend/.env`, configure as variÃ¡veis pÃºblicas do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
```

### Pipeline Python e dashboard legado

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
streamlit run app/dashboard.py
```

---

## Supabase

O projeto utiliza Supabase/PostgreSQL para persistÃªncia dos dados.

Arquivos principais:

- `supabase/schema.sql`: criaÃ§Ã£o das tabelas e Ã­ndices.
- `supabase/seed.sql`: dados iniciais de demonstraÃ§Ã£o.
- `supabase/authenticated_read_policies.sql`: leitura para usuÃ¡rios autenticados.
- `supabase/authenticated_write_policies.sql`: escrita para usuÃ¡rios autenticados.

As policies foram organizadas para permitir leitura pÃºblica dos dados de demonstraÃ§Ã£o e restringir alteraÃ§Ãµes no banco a usuÃ¡rios autenticados.

---

## SeguranÃ§a

- Visitantes nÃ£o possuem permissÃ£o de escrita no Supabase.
- O modo demo nÃ£o altera a base principal.
- A chave privada de service role nÃ£o Ã© usada no frontend.
- VariÃ¡veis pÃºblicas do Supabase ficam no ambiente do frontend.
- OperaÃ§Ãµes de insert/delete sÃ£o restritas a usuÃ¡rios autenticados.

---

## Status

Projeto em versÃ£o MVP, desenvolvido para demonstrar um fluxo completo de anÃ¡lise de dados aplicado a um contexto de negÃ³cio.

O sistema jÃ¡ possui deploy pÃºblico, dashboard funcional, modo demo, autenticaÃ§Ã£o administrativa, persistÃªncia em banco, alertas e exportaÃ§Ãµes.

---

## PrÃ³ximos passos

- Adicionar perfis de usuÃ¡rio e controle administrativo mais granular.
- Melhorar validaÃ§Ã£o de planilhas antes da importaÃ§Ã£o.
- Criar histÃ³rico de importaÃ§Ãµes.
- Adicionar testes automatizados para o parser e cÃ¡lculos principais.
- Evoluir alertas com regras configurÃ¡veis.
- Adicionar mais visualizaÃ§Ãµes analÃ­ticas para BI.

---

## Autor

Desenvolvido por **JoÃ£o Marcelo Ferreira de Jesus**.

- GitHub: https://github.com/Joao-MF-Jesus
- LinkedIn: https://www.linkedin.com/in/joao-marcelo-f-jesus