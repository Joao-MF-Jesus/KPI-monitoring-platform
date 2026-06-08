export type KPIRecord = {
  id: number;
  data: string;
  source_sheet: string;
  faturamento: number;
  lucro: number;
  roi: number;
  cpa: number;
  cpl: number;
  leads: number;
  vendas: number;
  margem: number;
  investimento_ads: number;
};

export type Incident = {
  id: number;
  data: string;
  source_sheet: string;
  tipo: string;
  descricao: string;
  severidade: string;
};

export type MonthlySummary = {
  mes: string;
  faturamento: number;
  lucro: number;
  investimento_ads: number;
  leads: number;
  vendas: number;
  roi: number;
  cpa: number;
  cpl: number;
  margem: number;
};
