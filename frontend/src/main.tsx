import React from "react";
import ReactDOM from "react-dom/client";
import type { Session } from "@supabase/supabase-js";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseSpreadsheet } from "./spreadsheetImport";
import { supabase } from "./supabase";
import type { Incident, KPIRecord } from "./types";
import { exportCsv, formatCurrency, formatNumber, formatPercent, getMonth, summarizeByMonth } from "./utils";
import "./styles.css";

type Totals = {
  faturamento: number;
  lucro: number;
  investimento_ads: number;
  leads: number;
  vendas: number;
};

type Metrics = Totals & {
  roi: number;
  cpa: number;
  cpl: number;
  margem: number;
  ticketMedio: number;
};

function calculateMetrics(records: KPIRecord[]): Metrics {
  const totals = records.reduce(
    (acc, record) => ({
      faturamento: acc.faturamento + Number(record.faturamento),
      lucro: acc.lucro + Number(record.lucro),
      investimento_ads: acc.investimento_ads + Number(record.investimento_ads),
      leads: acc.leads + Number(record.leads),
      vendas: acc.vendas + Number(record.vendas),
    }),
    { faturamento: 0, lucro: 0, investimento_ads: 0, leads: 0, vendas: 0 },
  );

  return {
    ...totals,
    roi: totals.investimento_ads ? (totals.lucro / totals.investimento_ads) * 100 : 0,
    cpa: totals.vendas ? totals.investimento_ads / totals.vendas : 0,
    cpl: totals.leads ? totals.investimento_ads / totals.leads : 0,
    margem: totals.faturamento ? (totals.lucro / totals.faturamento) * 100 : 0,
    ticketMedio: totals.vendas ? totals.faturamento / totals.vendas : 0,
  };
}

function percentDelta(current: number, previous: number) {
  if (!previous) {
    return current ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

function currencyDelta(current: number, previous: number) {
  const delta = current - previous;
  return `${delta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(delta))}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => window.matchMedia("(max-width: 760px)").matches);

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function translateSupabaseError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "E-mail ainda nÃ£o confirmado. Verifique sua caixa de entrada antes de fazer login.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (normalized.includes("row-level security") || normalized.includes("permission denied") || normalized.includes("permission")) {
    return "Modo pÃºblico: visitantes nÃ£o podem alterar a base principal. FaÃ§a login como administrador ou teste a planilha em modo demo local.";
  }

  if (normalized.includes("invalid api key")) {
    return "Chave do Supabase invÃ¡lida. Confira as variÃ¡veis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no Netlify.";
  }

  return message;
}
function Dashboard() {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 230 : 320;
  const compactChartHeight = isMobile ? 210 : 230;
  const areaChartHeight = isMobile ? 230 : 300;
  const currencyTooltip = (value: unknown) => formatCurrency(Number(value));
  const numberTooltip = (value: unknown, name: unknown) =>
    name === "vendas" ? formatNumber(Number(value)) : Number(value).toFixed(1);
  const [records, setRecords] = React.useState<KPIRecord[]>([]);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [selectedMonth, setSelectedMonth] = React.useState("all");
  const [comparisonMonth, setComparisonMonth] = React.useState("previous");
  const [selectedSource, setSelectedSource] = React.useState("all");
  const [theme, setTheme] = React.useState(() => localStorage.getItem("theme") ?? "light");
  const [importMode, setImportMode] = React.useState<"replace" | "append">("replace");
  const [importStatus, setImportStatus] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [session, setSession] = React.useState<Session | null>(null);
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authMessage, setAuthMessage] = React.useState("");
  const [showAuthControls, setShowAuthControls] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [recordsResult, incidentsResult] = await Promise.all([
      supabase.from("kpi_records").select("*").order("data", { ascending: true }),
      supabase.from("incidents").select("*").order("data", { ascending: false }),
    ]);

    if (recordsResult.error || incidentsResult.error) {
      setError(recordsResult.error?.message ?? incidentsResult.error?.message ?? "Erro ao carregar dados.");
    } else {
      setError("");
      setRecords((recordsResult.data ?? []) as KPIRecord[]);
      setIncidents((incidentsResult.data ?? []) as Incident[]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSpreadsheetUpload(file: File) {
    setImporting(true);
    setImportStatus("Lendo planilha...");

    try {
      const result = await parseSpreadsheet(file);

      if (!result.records.length) {
        setImportStatus("Nenhum registro vÃ¡lido encontrado. Confira os nomes das colunas.");
        return;
      }

      const timestamp = Date.now();
      const localRecords = result.records.map((record, index) => ({
        ...record,
        id: timestamp + index,
      })) as KPIRecord[];
      const localIncidents = result.incidents.map((incident, index) => ({
        ...incident,
        id: timestamp + result.records.length + index,
      })) as Incident[];

      if (!session) {
        setRecords(localRecords);
        setIncidents(localIncidents);
        setSelectedMonth("all");
        setSelectedSource("all");
        setComparisonMonth("previous");
        setError("");
        setImportStatus("Modo demo: a planilha foi carregada apenas nesta sessÃ£o. A base principal nÃ£o foi alterada.");
        return;
      }

      setImportStatus(`Processando ${result.records.length} registros...`);

      if (importMode === "replace") {
        const [deleteIncidents, deleteRecords] = await Promise.all([
          supabase.from("incidents").delete().neq("id", 0),
          supabase.from("kpi_records").delete().neq("id", 0),
        ]);

        if (deleteIncidents.error || deleteRecords.error) {
          throw new Error(deleteIncidents.error?.message ?? deleteRecords.error?.message);
        }
      }

      const recordsResult = await supabase.from("kpi_records").insert(result.records).select();
      if (recordsResult.error) {
        throw new Error(recordsResult.error.message);
      }

      if (result.incidents.length) {
        const incidentsResult = await supabase.from("incidents").insert(result.incidents).select();
        if (incidentsResult.error) {
          throw new Error(incidentsResult.error.message);
        }
      }

      setImportStatus(
        `ImportaÃ§Ã£o concluÃ­da: ${result.records.length} registros, ${result.incidents.length} alertas, ${result.sheets.length} abas.`,
      );
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao importar planilha.";
      setImportStatus(translateSupabaseError(message));
    } finally {
      setImporting(false);
    }
  }
  async function signIn() {
    if (!authEmail || !authPassword) {
      setAuthMessage("Preencha e-mail e senha.");
      return;
    }

    setAuthMessage("Entrando...");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (signInError) {
      setAuthMessage(translateSupabaseError(signInError.message));
      return;
    }

    setAuthEmail("");
    setAuthPassword("");
    setShowAuthControls(false);
    setAuthMessage("Login realizado.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAuthMessage("SessÃ£o encerrada.");
  }

  const months = React.useMemo(() => Array.from(new Set(records.map((record) => getMonth(record.data)))).sort(), [records]);
  const sources = React.useMemo(() => Array.from(new Set(records.map((record) => record.source_sheet))).sort(), [records]);
  const currentMonth = selectedMonth === "all" ? undefined : selectedMonth;
  const currentPeriodLabel = selectedMonth === "all" ? "Periodo filtrado" : selectedMonth;
  const previousMonth = currentMonth ? months[months.indexOf(currentMonth) - 1] : months[months.length - 1];
  const effectiveComparisonMonth = comparisonMonth === "previous" ? previousMonth : comparisonMonth;

  const filteredRecords = records.filter((record) => {
    const monthMatches = selectedMonth === "all" || getMonth(record.data) === selectedMonth;
    const sourceMatches = selectedSource === "all" || record.source_sheet === selectedSource;
    return monthMatches && sourceMatches;
  });

  const filteredIncidents = incidents.filter((incident) => {
    const monthMatches = selectedMonth === "all" || getMonth(incident.data) === selectedMonth;
    const sourceMatches = selectedSource === "all" || incident.source_sheet === selectedSource;
    return monthMatches && sourceMatches;
  });

  const totals = calculateMetrics(filteredRecords);
  const comparisonRecords = effectiveComparisonMonth
    ? records.filter((record) => {
        const monthMatches = getMonth(record.data) === effectiveComparisonMonth;
        const sourceMatches = selectedSource === "all" || record.source_sheet === selectedSource;
        return monthMatches && sourceMatches;
      })
    : [];
  const comparisonTotals = calculateMetrics(comparisonRecords);
  const monthly = summarizeByMonth(filteredRecords);
  const comparisonChartData = effectiveComparisonMonth
    ? [
        {
          perÃ­odo: effectiveComparisonMonth,
          faturamento: comparisonTotals.faturamento,
          lucro: comparisonTotals.lucro,
          vendas: comparisonTotals.vendas,
          roi: comparisonTotals.roi,
        },
        {
          perÃ­odo: currentPeriodLabel,
          faturamento: totals.faturamento,
          lucro: totals.lucro,
          vendas: totals.vendas,
          roi: totals.roi,
        },
      ]
    : [];
  const sourceSummary = sources
    .map((source) => {
      const sourceRecords = filteredRecords.filter((record) => record.source_sheet === source);
      const faturamento = sourceRecords.reduce((sum, record) => sum + Number(record.faturamento), 0);
      const lucro = sourceRecords.reduce((sum, record) => sum + Number(record.lucro), 0);
      return { source, faturamento, lucro };
    })
    .filter((source) => source.faturamento > 0)
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 5);

  return (
    <main id="dashboard">
      <header className="app-header">
        <div>
          <p className="eyebrow">Observabilidade comercial</p>
          <h1>KPI Monitoring Platform</h1>
        </div>
        <div className="filters">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
          <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} aria-label="Mes">
            <option value="all">Todos os meses</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <select value={comparisonMonth} onChange={(event) => setComparisonMonth(event.target.value)} aria-label="Comparar com">
            <option value="previous">Comparar com mes anterior</option>
            {months.map((month) => (
              <option key={month} value={month}>
                Comparar com {month}
              </option>
            ))}
          </select>
          <select value={selectedSource} onChange={(event) => setSelectedSource(event.target.value)} aria-label="Origem">
            <option value="all">Todas as origens</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading && <section className="state">Carregando dados...</section>}
      {error && <section className="state error">{error}</section>}

      <section className="upload-panel">
        <div>
          <h2>Importar planilha</h2>
          <p>Envie um Excel com colunas de data, investimento, leads, vendas, faturamento e lucro.</p>
        </div>
        <div className="auth-shell">
          <p className="auth-helper">
            {session ? (
              <>
                Logado como administrador: {session.user.email}
                <br />
                Uploads serÃ£o salvos no Supabase.
              </>
            ) : (
              "Visitantes podem testar planilhas em modo demo. Apenas administradores podem salvar alteraÃ§Ãµes no banco."
            )}
          </p>
          <button
            className="auth-toggle"
            type="button"
            onClick={() => setShowAuthControls((current) => !current)}
            aria-expanded={showAuthControls}
          >
            {session ? "Administrador logado" : "Login administrativo"}
          </button>
          {(showAuthControls || session) && (
            <div className="auth-panel">
              {session ? (
                <>
                  <span>{session.user.email}</span>
                  <button type="button" onClick={signOut}>Sair</button>
                </>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                  />
                  <button type="button" onClick={signIn}>Entrar</button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="upload-controls">
          <select value={importMode} onChange={(event) => setImportMode(event.target.value as "replace" | "append")}>
            <option value="replace">Substituir base atual</option>
            <option value="append">Adicionar na base atual</option>
          </select>
          <label className="file-button">
            {importing ? "Importando..." : "Selecionar planilha"}
            <input
              type="file"
              accept=".xlsx,.xls"
              disabled={importing}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleSpreadsheetUpload(file);
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        {authMessage && <p className="auth-status">{authMessage}</p>}
        {importStatus && <p className="import-status">{importStatus}</p>}
      </section>

      {!loading && !error && records.length === 0 && <section className="state">Nenhum dado encontrado no Supabase.</section>}

      {!loading && !error && records.length > 0 && (
        <>
          <section className="metric-grid">
            <Metric label="Faturamento" value={formatCurrency(totals.faturamento)} />
            <Metric label="Lucro" value={formatCurrency(totals.lucro)} />
            <Metric label="ROI" value={formatPercent(totals.roi)} />
            <Metric label="Margem" value={formatPercent(totals.margem)} />
            <Metric label="CPA medio" value={formatCurrency(totals.cpa)} />
            <Metric label="CPL medio" value={formatCurrency(totals.cpl)} />
            <Metric label="Leads" value={formatNumber(totals.leads)} />
            <Metric label="Vendas" value={formatNumber(totals.vendas)} />
          </section>

          <section className="export-panel">
            <div>
              <h2>Exportacoes</h2>
              <p>Baixe os dados filtrados para auditoria, acompanhamento ou apresentacao.</p>
            </div>
            <div className="export-actions">
              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    "kpi_records.csv",
                    filteredRecords.map((record) => ({
                      data: record.data,
                      origem: record.source_sheet,
                      faturamento: record.faturamento,
                      lucro: record.lucro,
                      roi: record.roi,
                      cpa: record.cpa,
                      cpl: record.cpl,
                      leads: record.leads,
                      vendas: record.vendas,
                      margem: record.margem,
                      investimento_ads: record.investimento_ads,
                    })),
                  )
                }
                disabled={!filteredRecords.length}
              >
                Exportar KPIs
              </button>
              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    "incidents.csv",
                    filteredIncidents.map((incident) => ({
                      data: incident.data,
                      origem: incident.source_sheet,
                      tipo: incident.tipo,
                      severidade: incident.severidade,
                      descricao: incident.descricao,
                    })),
                  )
                }
                disabled={!filteredIncidents.length}
              >
                Exportar alertas
              </button>
              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    "operational_logs.csv",
                    filteredIncidents.map((incident) => ({
                      timestamp: incident.data,
                      level: incident.severidade,
                      message: `${incident.source_sheet} - ${incident.tipo}: ${incident.descricao}`,
                    })),
                  )
                }
                disabled={!filteredIncidents.length}
              >
                Exportar logs
              </button>
            </div>
          </section>

          <section className="comparison-grid">
            <Panel title="Comparativo de perÃ­odo">
              {effectiveComparisonMonth && comparisonRecords.length > 0 ? (
                <>
                  <div className="comparison-header">
                    <span>{effectiveComparisonMonth}</span>
                    <strong>{currentPeriodLabel}</strong>
                  </div>
                  <div className="comparison-metrics">
                    <ComparisonMetric
                      label="Faturamento"
                      current={formatCurrency(totals.faturamento)}
                      previous={formatCurrency(comparisonTotals.faturamento)}
                      delta={formatPercent(percentDelta(totals.faturamento, comparisonTotals.faturamento))}
                    />
                    <ComparisonMetric
                      label="Lucro"
                      current={formatCurrency(totals.lucro)}
                      previous={formatCurrency(comparisonTotals.lucro)}
                      delta={formatPercent(percentDelta(totals.lucro, comparisonTotals.lucro))}
                    />
                    <ComparisonMetric
                      label="ROI"
                      current={formatPercent(totals.roi)}
                      previous={formatPercent(comparisonTotals.roi)}
                      delta={formatPercent(totals.roi - comparisonTotals.roi)}
                    />
                    <ComparisonMetric
                      label="CPA"
                      current={formatCurrency(totals.cpa)}
                      previous={formatCurrency(comparisonTotals.cpa)}
                      delta={currencyDelta(totals.cpa, comparisonTotals.cpa)}
                      inverted
                    />
                    <ComparisonMetric
                      label="Vendas"
                      current={formatNumber(totals.vendas)}
                      previous={formatNumber(comparisonTotals.vendas)}
                      delta={formatPercent(percentDelta(totals.vendas, comparisonTotals.vendas))}
                    />
                    <ComparisonMetric
                      label="Leads"
                      current={formatNumber(totals.leads)}
                      previous={formatNumber(comparisonTotals.leads)}
                      delta={formatPercent(percentDelta(totals.leads, comparisonTotals.leads))}
                    />
                  </div>
                </>
              ) : (
                <p className="empty">Selecione um mes com perÃ­odo anterior disponivel para comparar.</p>
              )}
            </Panel>

            <Panel title="Leitura executiva">
              {effectiveComparisonMonth && comparisonRecords.length > 0 ? (
                <div className="insights">
                  <p>
                    Faturamento {percentDelta(totals.faturamento, comparisonTotals.faturamento) >= 0 ? "cresceu" : "caiu"}{" "}
                    <strong>{formatPercent(Math.abs(percentDelta(totals.faturamento, comparisonTotals.faturamento)))}</strong>{" "}
                    em relacao a {effectiveComparisonMonth}.
                  </p>
                  <p>
                    O ROI variou <strong>{formatPercent(totals.roi - comparisonTotals.roi)}</strong> e a margem variou{" "}
                    <strong>{formatPercent(totals.margem - comparisonTotals.margem)}</strong>.
                  </p>
                  <p>
                    Ticket medio atual: <strong>{formatCurrency(totals.ticketMedio)}</strong>. Periodo comparado:{" "}
                    <strong>{formatCurrency(comparisonTotals.ticketMedio)}</strong>.
                  </p>
                </div>
              ) : (
                <p className="empty">A leitura executiva aparece quando existem dois perÃ­odos comparaveis.</p>
              )}
              {comparisonChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={compactChartHeight}>
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="perÃ­odo" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => (name === "vendas" || name === "roi" ? numberTooltip(value, name) : currencyTooltip(value))} />
                    <Legend />
                    <Bar dataKey="faturamento" fill="#2563eb" name="Faturamento" />
                    <Bar dataKey="lucro" fill="#16a34a" name="Lucro" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          </section>

          <section className="dashboard-grid">
            <Panel title="Tendencia mensal">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => currencyTooltip(value)} />
                  <Legend />
                  <Bar dataKey="faturamento" fill="#2563eb" name="Faturamento" />
                  <Bar dataKey="lucro" fill="#16a34a" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="ROI e custos">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => numberTooltip(value, name)} />
                  <Legend />
                  <Line type="monotone" dataKey="roi" stroke="#7c3aed" name="ROI" />
                  <Line type="monotone" dataKey="cpa" stroke="#f97316" name="CPA" />
                  <Line type="monotone" dataKey="cpl" stroke="#0891b2" name="CPL" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Top origens">
              <ResponsiveContainer width="100%" height={areaChartHeight}>
                <AreaChart data={sourceSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip formatter={(value) => currencyTooltip(value)} />
                  <Area type="monotone" dataKey="faturamento" stroke="#2563eb" fill="#93c5fd" name="Faturamento" />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Alertas recentes">
              <div className="alerts">
                {filteredIncidents.slice(0, 8).map((incident) => (
                  <article key={incident.id} className={`alert ${incident.severidade.toLowerCase()}`}>
                    <strong>{incident.tipo}</strong>
                    <span>{incident.data} - {incident.source_sheet}</span>
                    <p>{incident.descricao}</p>
                  </article>
                ))}
                {filteredIncidents.length === 0 && <p className="empty">Nenhum alerta para os filtros atuais.</p>}
              </div>
            </Panel>
          </section>
        </>
      )}
    </main>
  );
}


function LandingPage({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const features = [
    {
      title: "Upload de planilhas",
      description: "ImportaÃ§Ã£o de arquivos Excel com dados de campanhas, vendas e indicadores de negÃ³cio.",
    },
    {
      title: "Tratamento de dados",
      description: "PadronizaÃ§Ã£o e organizaÃ§Ã£o dos dados antes da anÃ¡lise e persistÃªncia.",
    },
    {
      title: "Dashboard de KPIs",
      description: "VisualizaÃ§Ã£o de faturamento, lucro, ROI, CPA, CPL, leads e vendas.",
    },
    {
      title: "Alertas operacionais",
      description: "IdentificaÃ§Ã£o de situaÃ§Ãµes crÃ­ticas, como CPA alto ou ROI abaixo do esperado.",
    },
    {
      title: "ExportaÃ§Ã£o de dados",
      description: "Download de KPIs, alertas e logs processados para auditoria e acompanhamento.",
    },
  ];

  const technologies = ["React", "Python", "Pandas", "Supabase", "PostgreSQL", "Netlify"];

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-kicker">
          <span>Projeto MVP de portfÃ³lio</span>
          <span>Dados, BI e aplicaÃ§Ã£o web</span>
        </div>
        <p className="eyebrow">Observabilidade comercial</p>
        <h1>KPI Monitoring Platform</h1>
        <p className="landing-description">
          Plataforma para monitoramento de KPIs de negÃ³cio a partir de planilhas, permitindo importar dados,
          tratar informaÃ§Ãµes, acompanhar indicadores e identificar alertas operacionais.
        </p>
        <div className="landing-actions">
          <button type="button" onClick={onOpenDashboard}>
            Ver Dashboard
          </button>
          <a href="https://github.com/Joao-MF-Jesus/KPI-monitoring-platform" target="_blank" rel="noreferrer">
            Ver RepositÃ³rio no GitHub
          </a>
        </div>
        <div className="landing-flow" aria-label="Fluxo do sistema">
          <span>Upload</span>
          <span>Tratamento</span>
          <span>Supabase/PostgreSQL</span>
          <span>Dashboard</span>
          <span>Alertas</span>
        </div>
      </section>

      <section className="landing-section landing-problem">
        <div>
          <span className="section-label">Contexto</span>
          <h2>Problema que o projeto resolve</h2>
        </div>
        <p>
          Muitas empresas acompanham indicadores em planilhas separadas, dificultando a anÃ¡lise de desempenho.
          Este projeto centraliza os dados, transforma planilhas em indicadores visuais e ajuda a identificar
          problemas de performance com mais rapidez.
        </p>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="section-label">Produto</span>
          <h2>Funcionalidades</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="section-label">Stack</span>
          <h2>Tecnologias utilizadas</h2>
        </div>
        <div className="tech-list">
          {technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
      </section>

      <section className="landing-section landing-importance">
        <div>
          <span className="section-label">Valor tÃ©cnico</span>
          <h2>Por que esse projeto importa?</h2>
        </div>
        <p>
          Este projeto demonstra conhecimentos em anÃ¡lise de dados, tratamento de planilhas, modelagem de
          indicadores, integraÃ§Ã£o com banco de dados, visualizaÃ§Ã£o de KPIs e construÃ§Ã£o de uma aplicaÃ§Ã£o
          analÃ­tica publicada.
        </p>
      </section>

      <p className="mvp-note">
        Projeto em versÃ£o MVP, desenvolvido para demonstrar um fluxo completo de anÃ¡lise: upload, tratamento,
        persistÃªncia, visualizaÃ§Ã£o e monitoramento de KPIs.
      </p>
    </main>
  );
}
function App() {
  const [view, setView] = React.useState(() => (window.location.hash === "#dashboard" ? "dashboard" : "home"));

  React.useEffect(() => {
    const handleHashChange = () => setView(window.location.hash === "#dashboard" ? "dashboard" : "home");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function openDashboard() {
    window.location.hash = "dashboard";
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return view === "dashboard" ? <Dashboard /> : <LandingPage onOpenDashboard={openDashboard} />;
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ComparisonMetric({
  label,
  current,
  previous,
  delta,
  inverted = false,
}: {
  label: string;
  current: string;
  previous: string;
  delta: string;
  inverted?: boolean;
}) {
  const isNegative = delta.startsWith("-");
  const status = inverted ? (isNegative ? "good" : "bad") : isNegative ? "bad" : "good";

  return (
    <article className="comparison-item">
      <span>{label}</span>
      <strong>{current}</strong>
      <small>Anterior: {previous}</small>
      <em className={status}>{delta}</em>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);














