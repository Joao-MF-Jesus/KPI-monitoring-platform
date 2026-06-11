drop policy if exists "Allow authenticated read kpi records" on public.kpi_records;
create policy "Allow authenticated read kpi records"
on public.kpi_records
for select
to authenticated
using (true);

drop policy if exists "Allow authenticated read incidents" on public.incidents;
create policy "Allow authenticated read incidents"
on public.incidents
for select
to authenticated
using (true);