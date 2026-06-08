import * as XLSX from "xlsx";
import type { Incident, KPIRecord } from "./types";

type ParsedRecord = Omit<KPIRecord, "id">;
type ParsedIncident = Omit<Incident, "id">;

type ImportResult = {
  records: ParsedRecord[];
  incidents: ParsedIncident[];
  sheets: { name: string; records: number }[];
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const text = String(value ?? "")
    .trim()
    .replace("R$", "")
    .replace(/\s/g, "");

  if (!text || text === "-" || text.toLowerCase() === "nan") {
    return 0;
  }

  const normalized =
    text.includes(",") && text.includes(".")
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInt(value: unknown) {
  return Math.round(toNumber(value));
}

function toDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }

  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function findColumn(headers: unknown[], options: string[]) {
  const normalizedHeaders = headers.map((header, index) => ({
    index,
    value: normalizeText(header),
  }));

  for (const option of options.map(normalizeText)) {
    const exact = normalizedHeaders.find((header) => header.value === option);
    if (exact) {
      return exact.index;
    }
  }

  for (const option of options.map(normalizeText)) {
    const partial = normalizedHeaders.find((header) => header.value.includes(option));
    if (partial) {
      return partial.index;
    }
  }

  return -1;
}

function calculateAlerts(record: ParsedRecord): ParsedIncident[] {
  const alerts: ParsedIncident[] = [];

  if (record.cpa > 100) {
    alerts.push({
      data: record.data,
      source_sheet: record.source_sheet,
      tipo: "CPA critico",
      descricao: `CPA em R$ ${record.cpa.toFixed(2)}, acima do limite de R$ 100.`,
      severidade: "Critico",
    });
  }

  if (record.cpl > 30) {
    alerts.push({
      data: record.data,
      source_sheet: record.source_sheet,
      tipo: "CPL critico",
      descricao: `CPL em R$ ${record.cpl.toFixed(2)}, acima do limite de R$ 30.`,
      severidade: "Critico",
    });
  }

  if (record.roi < 30) {
    alerts.push({
      data: record.data,
      source_sheet: record.source_sheet,
      tipo: "ROI operacional",
      descricao: `ROI em ${Math.max(record.roi, -100).toFixed(2)}%, abaixo do limite de 30%.`,
      severidade: "Operacional",
    });
  }

  return alerts;
}

export async function parseSpreadsheet(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const records: ParsedRecord[] = [];
  const incidents: ParsedIncident[] = [];
  const sheets: ImportResult["sheets"] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: "" });
    const headers = rows[0];

    if (!headers) {
      continue;
    }

    const dateIdx = findColumn(headers, ["Dia", "Data", "Date"]);
    const investmentIdx = findColumn(headers, ["Invest. Total", "Investimento", "Investimento Ads"]);
    const leadsIdx = findColumn(headers, ["Lead - Geral", "Lead", "Leads"]);
    const salesIdx = findColumn(headers, ["Vendas", "Total de Vendas", "Sales"]);
    const revenueIdx = findColumn(headers, ["Faturamento Bruto", "Faturamento", "Revenue"]);
    const profitIdx = findColumn(headers, ["Lucro Liquido", "Lucro", "Profit"]);

    if ([dateIdx, investmentIdx, leadsIdx, salesIdx, revenueIdx, profitIdx].some((index) => index < 0)) {
      continue;
    }

    let sheetRecords = 0;

    for (const row of rows.slice(1)) {
      const rowDate = toDate(row[dateIdx]);
      if (!rowDate || rowDate.getFullYear() < 2023 || rowDate.getFullYear() > 2027) {
        continue;
      }

      const investimentoAds = toNumber(row[investmentIdx]);
      const leads = toInt(row[leadsIdx]);
      const vendas = toInt(row[salesIdx]);
      const faturamento = toNumber(row[revenueIdx]);
      const lucro = toNumber(row[profitIdx]);

      if (![investimentoAds, leads, vendas, faturamento, lucro].some((value) => value !== 0)) {
        continue;
      }

      const record: ParsedRecord = {
        data: formatDate(rowDate),
        source_sheet: sheetName,
        faturamento,
        lucro,
        roi: investimentoAds ? (lucro / investimentoAds) * 100 : 0,
        cpa: vendas ? investimentoAds / vendas : 0,
        cpl: leads ? investimentoAds / leads : 0,
        leads,
        vendas,
        margem: faturamento ? (lucro / faturamento) * 100 : 0,
        investimento_ads: investimentoAds,
      };

      records.push(record);
      incidents.push(...calculateAlerts(record));
      sheetRecords += 1;
    }

    if (sheetRecords) {
      sheets.push({ name: sheetName, records: sheetRecords });
    }
  }

  return { records, incidents, sheets };
}
