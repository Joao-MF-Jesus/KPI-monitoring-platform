import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

import pandas as pd
from pandas.errors import DatabaseError
import plotly.express as px
import streamlit as st
from sqlalchemy.exc import SQLAlchemyError

from src.database.connection import engine


def format_currency(value):
    if value >= 1_000_000:
        return f"R$ {value / 1_000_000:.1f} Mi"
    if value >= 1_000:
        return f"R$ {value / 1_000:.1f} Mil"
    return f"R$ {value:.2f}"


def parse_log_lines(log_lines):
    rows = []
    for line in log_lines:
        parts = line.split(" - ", 2)
        if len(parts) == 3:
            timestamp, level, message = parts
        else:
            timestamp, level, message = "", "", line
        rows.append({
            "timestamp": timestamp,
            "level": level,
            "message": message,
        })
    return pd.DataFrame(rows)


st.set_page_config(page_title="KPI Monitoring Platform", layout="wide")
st.title("KPI Monitoring Platform")
st.caption("MVP de monitoramento automatizado de KPIs corporativos")

try:
    df = pd.read_sql("SELECT * FROM kpi_records ORDER BY data", engine)
    incidents = pd.read_sql("SELECT * FROM incidents ORDER BY data DESC", engine)
except (DatabaseError, SQLAlchemyError):
    st.warning("Banco de dados ainda não foi gerado. Adicione uma planilha anonimizada em data/raw e rode python main.py.")
    st.stop()

if df.empty:
    st.warning("Nenhum dado encontrado. Rode python main.py primeiro.")
    st.stop()

df["data"] = pd.to_datetime(df["data"])
incidents["data"] = pd.to_datetime(incidents["data"], errors="coerce")
df["ano"] = df["data"].dt.year
df["mes"] = df["data"].dt.strftime("%Y-%m")
df["numero_mes"] = df["data"].dt.month

LOG_PATH = ROOT_DIR / "logs" / "etl.log"
with st.expander("Status operacional do pipeline"):
    col_status1, col_status2, col_status3, col_status4 = st.columns(4)
    total_registros = len(df)
    total_incidentes = len(incidents)
    log_lines = []
    if LOG_PATH.exists():
        log_content = LOG_PATH.read_text(encoding="utf-8", errors="ignore")
        log_lines = [line for line in log_content.splitlines() if line.strip()]
        ultimo_log = log_lines[-1] if log_lines else "Nenhum log registrado."
        status_pipeline = "Operacional" if "sucesso" in ultimo_log.lower() else "Atenção"
    else:
        ultimo_log = "Arquivo de log ainda não encontrado."
        status_pipeline = "Sem logs"
    col_status1.metric("Status", status_pipeline)
    col_status2.metric("Registros na base", total_registros)
    col_status3.metric("Incidentes registrados", total_incidentes)
    col_status4.metric("Fonte", "Excel")
    st.caption("Último evento registrado no pipeline:")
    st.code(ultimo_log)
    if log_lines:
        logs_df = parse_log_lines(log_lines)
        logs_csv = logs_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="Exportar logs em CSV",
            data=logs_csv,
            file_name="etl_logs.csv",
            mime="text/csv",
        )

st.sidebar.title("Filtros")
anos = sorted(df["ano"].dropna().unique().tolist())
meses = sorted(df["mes"].dropna().unique().tolist())
origens = sorted(df["source_sheet"].dropna().unique().tolist())
severidades = sorted(incidents["severidade"].dropna().unique().tolist()) if not incidents.empty else []

anos_selecionados = st.sidebar.multiselect("Ano", options=anos, default=anos)
meses_selecionados = st.sidebar.multiselect("Mês", options=meses, default=meses)
origens_selecionadas = st.sidebar.multiselect("Canal/Origem", options=origens, default=origens)
severidades_selecionadas = st.sidebar.multiselect("Severidade", options=severidades, default=severidades)

df_filtered = df.copy()
if anos_selecionados:
    df_filtered = df_filtered[df_filtered["ano"].isin(anos_selecionados)]
if meses_selecionados:
    df_filtered = df_filtered[df_filtered["mes"].isin(meses_selecionados)]
if origens_selecionadas:
    df_filtered = df_filtered[df_filtered["source_sheet"].isin(origens_selecionadas)]
if df_filtered.empty:
    st.warning("Nenhum dado encontrado.")
    st.stop()

total_faturamento = df_filtered["faturamento"].sum()
total_lucro = df_filtered["lucro"].sum()
total_investimento = df_filtered["investimento_ads"].sum()
total_leads = df_filtered["leads"].sum()
total_vendas = df_filtered["vendas"].sum()
roi_total = (total_lucro / total_investimento) * 100 if total_investimento else 0
cpa_medio = total_investimento / total_vendas if total_vendas else 0
cpl_medio = total_investimento / total_leads if total_leads else 0
margem_total = (total_lucro / total_faturamento) * 100 if total_faturamento else 0
ticket_medio = total_faturamento / total_vendas if total_vendas > 0 else 0

monthly = df_filtered.groupby("mes", as_index=False).agg({"faturamento":"sum","lucro":"sum","investimento_ads":"sum","leads":"sum","vendas":"sum"})
monthly["roi"] = monthly.apply(lambda row: (row["lucro"] / row["investimento_ads"]) * 100 if row["investimento_ads"] else 0, axis=1)
monthly["cpa"] = monthly.apply(lambda row: row["investimento_ads"] / row["vendas"] if row["vendas"] else 0, axis=1)
monthly["cpl"] = monthly.apply(lambda row: row["investimento_ads"] / row["leads"] if row["leads"] else 0, axis=1)
monthly["ticket_medio"] = monthly.apply(lambda row: row["faturamento"] / row["vendas"] if row["vendas"] else 0, axis=1)
monthly["margem"] = monthly.apply(lambda row: (row["lucro"] / row["faturamento"]) * 100 if row["faturamento"] else 0, axis=1)
monthly["roi_visual"] = monthly["roi"].clip(-100, 300)
monthly["cpa_visual"] = monthly["cpa"].clip(0, 300)
monthly["cpl_visual"] = monthly["cpl"].clip(0, 100)
monthly_insights = monthly[(monthly["vendas"] > 0) & (monthly["leads"] > 0) & (monthly["cpa"] < 1000) & (monthly["cpl"] < 200)].copy()

mostrar_delta_mensal = len(meses_selecionados) == 2
if mostrar_delta_mensal and len(monthly) >= 2:
    current = monthly.iloc[-1]
    previous = monthly.iloc[-2]
    faturamento_delta = ((current["faturamento"] - previous["faturamento"]) / previous["faturamento"]) * 100 if previous["faturamento"] else 0
    lucro_delta = ((current["lucro"] - previous["lucro"]) / previous["lucro"]) * 100 if previous["lucro"] else 0
    roi_delta = current["roi"] - previous["roi"]
else:
    faturamento_delta = None
    lucro_delta = None
    roi_delta = None

roi_delta_display = max(min(roi_delta, 100), -100) if roi_delta is not None else None
roi_display = max(min(roi_total, 200), -100)
margem_display = max(min(margem_total, 100), -100)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Faturamento", format_currency(total_faturamento), f"{faturamento_delta:.1f}%" if faturamento_delta is not None else None)
col2.metric("Lucro", format_currency(total_lucro), f"{lucro_delta:.1f}%" if lucro_delta is not None else None)
col3.metric("ROI", f"{roi_display:.1f}%", f"{roi_delta_display:.1f}%" if roi_delta_display is not None else None)
col4.metric("Margem", f"{margem_display:.1f}%")

col5, col6, col7, col8 = st.columns(4)
col5.metric("CPA Médio", format_currency(cpa_medio))
col6.metric("CPL Médio", format_currency(cpl_medio))
col7.metric("Ticket Médio", format_currency(ticket_medio))
col8.metric("Vendas", f"{int(total_vendas):,}".replace(",", "."))

col9, col10, col11, col12 = st.columns(4)
col9.metric("Leads", f"{int(total_leads):,}".replace(",", "."))

st.divider()
st.subheader("Insights Operacionais")
if monthly_insights.empty:
    st.warning("Não há dados suficientes para gerar insights.")
else:
    best_revenue = monthly_insights.loc[monthly_insights["faturamento"].idxmax()]
    best_profit = monthly_insights.loc[monthly_insights["lucro"].idxmax()]
    best_roi = monthly_insights.loc[monthly_insights["roi"].idxmax()]
    worst_cpa = monthly_insights.loc[monthly_insights["cpa"].idxmax()]
    worst_cpl = monthly_insights.loc[monthly_insights["cpl"].idxmax()]
    critical_incidents = incidents[incidents["severidade"] == "Crítico"].shape[0] if not incidents.empty else 0
    insight1, insight2, insight3 = st.columns(3)
    with insight1:
        st.info(f"Melhor mês em faturamento: {best_revenue['mes']} → {format_currency(best_revenue['faturamento'])}")
    with insight2:
        st.success(f"Melhor mês em lucro: {best_profit['mes']} → {format_currency(best_profit['lucro'])}")
    with insight3:
        st.warning(f"Incidentes críticos registrados: {critical_incidents}")
    roi_insight = min(best_roi["roi"], 150)

    st.success(
    f"Melhor ROI mensal registrado em "
    f"{best_roi['mes']} "
    f"com retorno de até "
    f"{roi_insight:.1f}%."
)
    st.warning(f"CPA elevado identificado em {worst_cpa['mes']}: média de {format_currency(worst_cpa['cpa'])}.")
    st.warning(f"CPL elevado identificado em {worst_cpl['mes']}: média de {format_currency(worst_cpl['cpl'])}.")
    anos_disponiveis = sorted(df_filtered["ano"].dropna().unique())
    if len(anos_disponiveis) >= 2:
        ano_atual = max(anos_disponiveis)
        ano_anterior = ano_atual - 1
        meses_ano_atual = df_filtered[df_filtered["ano"] == ano_atual]["numero_mes"].dropna().unique().tolist()
        comparativo = df_filtered[((df_filtered["ano"] == ano_atual) | (df_filtered["ano"] == ano_anterior)) & (df_filtered["numero_mes"].isin(meses_ano_atual))]
        resumo_anual = comparativo.groupby("ano", as_index=False).agg({"faturamento":"sum","lucro":"sum","vendas":"sum"})
        if ano_atual in resumo_anual["ano"].values and ano_anterior in resumo_anual["ano"].values:
            anterior = resumo_anual[resumo_anual["ano"] == ano_anterior].iloc[0]
            atual = resumo_anual[resumo_anual["ano"] == ano_atual].iloc[0]
            ticket_anterior = anterior["faturamento"] / anterior["vendas"] if anterior["vendas"] else 0
            ticket_atual = atual["faturamento"] / atual["vendas"] if atual["vendas"] else 0
            margem_anterior = anterior["lucro"] / anterior["faturamento"] * 100 if anterior["faturamento"] else 0
            margem_atual = atual["lucro"] / atual["faturamento"] * 100 if atual["faturamento"] else 0
            ticket_delta = ((ticket_atual - ticket_anterior) / ticket_anterior) * 100 if ticket_anterior else 0
            vendas_delta = ((atual["vendas"] - anterior["vendas"]) / anterior["vendas"]) * 100 if anterior["vendas"] else 0
            lucro_delta_ano = ((atual["lucro"] - anterior["lucro"]) / anterior["lucro"]) * 100 if anterior["lucro"] else 0
            margem_delta = margem_atual - margem_anterior
            st.info(f"Comparativo anual considerado: mesmo período de {ano_atual} contra {ano_anterior}.")
            if ticket_delta > 0 and vendas_delta < 0:
                st.info(f"No mesmo período comparativo, o ticket médio aumentou {ticket_delta:.1f}%, enquanto o volume de vendas caiu {abs(vendas_delta):.1f}%. A operação vendeu menos, mas com maior valor médio por venda.")
            elif ticket_delta > 0 and vendas_delta > 0:
                st.success(f"No mesmo período comparativo, o ticket médio aumentou {ticket_delta:.1f}% e as vendas cresceram {vendas_delta:.1f}%. Isso indica ganho simultâneo em volume e valor médio por venda.")
            elif ticket_delta < 0 and vendas_delta > 0:
                st.warning(f"No mesmo período comparativo, as vendas cresceram {vendas_delta:.1f}%, mas o ticket médio caiu {abs(ticket_delta):.1f}%. Isso pode indicar aumento de volume com menor valor médio por venda.")
            if margem_delta > 0 and lucro_delta_ano < 0:
                st.warning(f"Apesar da melhora de margem em {margem_delta:.1f}%, o lucro recuou {abs(lucro_delta_ano):.1f}% no comparativo anual. Isso indica melhora percentual de eficiência, mas queda no resultado absoluto.")

st.divider()
st.subheader("Tendência mensal")
fig_financeiro = px.bar(monthly, x="mes", y=["faturamento", "lucro", "investimento_ads"], barmode="group", title="Faturamento, Lucro e Investimento por Mês")
st.plotly_chart(fig_financeiro, use_container_width=True, key="financeiro_chart")
fig_roi = px.line(monthly, x="mes", y="roi_visual", markers=True, title="ROI Mensal")
st.plotly_chart(fig_roi, use_container_width=True, key="roi_line_chart")
fig_roi_area = px.area(monthly, x="mes", y="roi_visual", title="Evolução do ROI")
st.plotly_chart(fig_roi_area, use_container_width=True, key="roi_area_chart")
fig_custos = px.line(monthly, x="mes", y=["cpa_visual", "cpl_visual"], markers=True, title="CPA x CPL por Mês")
st.plotly_chart(fig_custos, use_container_width=True, key="costs_chart")
fig_ticket = px.line(monthly, x="mes", y="ticket_medio", markers=True, title="Ticket Médio por Mês")
st.plotly_chart(fig_ticket, use_container_width=True, key="ticket_chart")

st.divider()
st.subheader("Análise por Canal/Origem")
sheet_summary = df_filtered.groupby("source_sheet", as_index=False).agg({"faturamento":"sum","lucro":"sum","investimento_ads":"sum","leads":"sum","vendas":"sum"})
sheet_summary["roi"] = sheet_summary.apply(lambda row: (row["lucro"] / row["investimento_ads"]) * 100 if row["investimento_ads"] else 0, axis=1)
sheet_summary["cpa"] = sheet_summary.apply(lambda row: row["investimento_ads"] / row["vendas"] if row["vendas"] else 0, axis=1)
sheet_summary["cpl"] = sheet_summary.apply(lambda row: row["investimento_ads"] / row["leads"] if row["leads"] else 0, axis=1)
sheet_summary["margem"] = sheet_summary.apply(lambda row: (row["lucro"] / row["faturamento"]) * 100 if row["faturamento"] else 0, axis=1)
sheet_summary["ticket_medio"] = sheet_summary.apply(lambda row: row["faturamento"] / row["vendas"] if row["vendas"] else 0, axis=1)
st.dataframe(sheet_summary.style.format({"faturamento":"R$ {:,.2f}","lucro":"R$ {:,.2f}","investimento_ads":"R$ {:,.2f}","roi":"{:.1f}%","margem":"{:.1f}%","cpa":"R$ {:,.2f}","cpl":"R$ {:,.2f}","ticket_medio":"R$ {:,.2f}"}), use_container_width=True)
top_channels = sheet_summary.sort_values("faturamento", ascending=False).head(5)
fig_top = px.bar(top_channels, x="faturamento", y="source_sheet", orientation="h", title="Top 5 canais por faturamento", text_auto=".2s")
fig_top.update_layout(height=350, showlegend=False, yaxis_title="Canal", xaxis_title="Faturamento", yaxis={"categoryorder":"total ascending"}, plot_bgcolor="#0E1117", paper_bgcolor="#0E1117")
fig_top.update_xaxes(showgrid=False)
fig_top.update_yaxes(showgrid=False)
st.plotly_chart(fig_top, use_container_width=True, key="top_channels_chart")

st.divider()
st.subheader("Alertas Operacionais")
active_alerts = incidents.copy()
if not active_alerts.empty:
    active_alerts["ano"] = active_alerts["data"].dt.year
    active_alerts["mes"] = active_alerts["data"].dt.strftime("%Y-%m")
    if anos_selecionados:
        active_alerts = active_alerts[active_alerts["ano"].isin(anos_selecionados)]
    if meses_selecionados:
        active_alerts = active_alerts[active_alerts["mes"].isin(meses_selecionados)]
    if origens_selecionadas:
        active_alerts = active_alerts[active_alerts["source_sheet"].isin(origens_selecionadas)]
    if severidades_selecionadas:
        active_alerts = active_alerts[active_alerts["severidade"].isin(severidades_selecionadas)]
if active_alerts.empty:
    st.success("Nenhum incidente registrado.")
else:
    for _, row in active_alerts.head(5).iterrows():
        message = f"{row['data'].date()} — {row['source_sheet']} — {row['tipo']}: {row['descricao']}"
        if row["severidade"] == "Crítico":
            st.error(message)
        else:
            st.warning(message)
with st.expander("Visualizar incidentes registrados"):
    st.dataframe(active_alerts, use_container_width=True)
with st.expander("Visualizar base tratada de KPIs"):
    st.dataframe(df_filtered, use_container_width=True)
csv = df_filtered.to_csv(index=False).encode("utf-8")
st.download_button(label="Exportar base em CSV", data=csv, file_name="kpi_report.csv", mime="text/csv")
