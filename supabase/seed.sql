truncate table public.incidents restart identity;
truncate table public.kpi_records restart identity;

insert into public.kpi_records
  (data, source_sheet, faturamento, lucro, roi, cpa, cpl, leads, vendas, margem, investimento_ads)
values
  ('2026-01-05', 'Canal A', 18400.00, 6200.00, 206.67, 75.00, 12.00, 125, 20, 33.70, 3000.00),
  ('2026-01-12', 'Canal A', 22100.00, 8100.00, 238.24, 68.00, 10.88, 150, 24, 36.65, 3264.00),
  ('2026-01-19', 'Canal B', 15600.00, 3900.00, 121.88, 106.67, 21.33, 150, 30, 25.00, 3200.00),
  ('2026-01-26', 'Canal C', 9800.00, 1200.00, 40.00, 150.00, 30.00, 50, 10, 12.24, 3000.00),

  ('2026-02-03', 'Canal A', 24800.00, 9300.00, 281.82, 66.00, 11.00, 180, 30, 37.50, 3300.00),
  ('2026-02-10', 'Canal B', 19600.00, 5100.00, 145.71, 100.00, 17.50, 200, 35, 26.02, 3500.00),
  ('2026-02-17', 'Canal C', 12600.00, 1800.00, 51.43, 140.00, 28.00, 125, 25, 14.29, 3500.00),
  ('2026-02-24', 'Canal A', 27600.00, 10400.00, 315.15, 61.90, 10.32, 210, 34, 37.68, 3508.00),

  ('2026-03-04', 'Canal A', 30200.00, 11800.00, 337.14, 58.33, 9.46, 222, 36, 39.07, 3500.00),
  ('2026-03-11', 'Canal B', 22400.00, 6400.00, 177.78, 94.74, 16.36, 220, 38, 28.57, 3600.00),
  ('2026-03-18', 'Canal C', 14100.00, 900.00, 22.50, 160.00, 40.00, 100, 25, 6.38, 4000.00),
  ('2026-03-25', 'Canal B', 23800.00, 7200.00, 194.59, 97.37, 17.64, 210, 38, 30.25, 3700.00);

insert into public.incidents
  (data, source_sheet, tipo, descricao, severidade)
values
  ('2026-01-19', 'Canal B', 'CPA critico', 'CPA em R$ 106.67, acima do limite de R$ 100.', 'Critico'),
  ('2026-01-26', 'Canal C', 'CPA critico', 'CPA em R$ 150.00, acima do limite de R$ 100.', 'Critico'),
  ('2026-01-26', 'Canal C', 'ROI operacional', 'ROI em 40.00%, proximo do limite operacional.', 'Operacional'),
  ('2026-02-17', 'Canal C', 'CPA critico', 'CPA em R$ 140.00, acima do limite de R$ 100.', 'Critico'),
  ('2026-03-18', 'Canal C', 'CPL critico', 'CPL em R$ 40.00, acima do limite de R$ 30.', 'Critico'),
  ('2026-03-18', 'Canal C', 'ROI operacional', 'ROI em 22.50%, abaixo do limite de 30%.', 'Operacional');
