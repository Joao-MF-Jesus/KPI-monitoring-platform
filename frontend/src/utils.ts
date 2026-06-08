import type { KPIRecord, MonthlySummary } from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function getMonth(value: string) {
  return value.slice(0, 7);
}

export function summarizeByMonth(records: KPIRecord[]): MonthlySummary[] {
  const grouped = new Map<string, MonthlySummary>();

  for (const record of records) {
    const mes = getMonth(record.data);
    const current = grouped.get(mes) ?? {
      mes,
      faturamento: 0,
      lucro: 0,
      investimento_ads: 0,
      leads: 0,
      vendas: 0,
      roi: 0,
      cpa: 0,
      cpl: 0,
      margem: 0,
    };

    current.faturamento += Number(record.faturamento);
    current.lucro += Number(record.lucro);
    current.investimento_ads += Number(record.investimento_ads);
    current.leads += Number(record.leads);
    current.vendas += Number(record.vendas);
    grouped.set(mes, current);
  }

  return Array.from(grouped.values())
    .map((month) => ({
      ...month,
      roi: month.investimento_ads ? (month.lucro / month.investimento_ads) * 100 : 0,
      cpa: month.vendas ? month.investimento_ads / month.vendas : 0,
      cpl: month.leads ? month.investimento_ads / month.leads : 0,
      margem: month.faturamento ? (month.lucro / month.faturamento) * 100 : 0,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export function exportCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
