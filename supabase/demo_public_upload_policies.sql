-- Demo-only policies for portfolio deployments.
-- WARNING: these policies let anyone with the public app URL replace or append KPI data.
-- Prefer authenticated_write_policies.sql for real projects.

drop policy if exists "Allow anon insert kpi records demo" on public.kpi_records;
create policy "Allow anon insert kpi records demo"
on public.kpi_records
for insert
to anon
with check (true);

drop policy if exists "Allow anon delete kpi records demo" on public.kpi_records;
create policy "Allow anon delete kpi records demo"
on public.kpi_records
for delete
to anon
using (true);

drop policy if exists "Allow anon insert incidents demo" on public.incidents;
create policy "Allow anon insert incidents demo"
on public.incidents
for insert
to anon
with check (true);

drop policy if exists "Allow anon delete incidents demo" on public.incidents;
create policy "Allow anon delete incidents demo"
on public.incidents
for delete
to anon
using (true);
