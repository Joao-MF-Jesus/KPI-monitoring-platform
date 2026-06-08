drop policy if exists "Allow authenticated insert kpi records" on public.kpi_records;
create policy "Allow authenticated insert kpi records"
on public.kpi_records
for insert
to authenticated
with check (true);

drop policy if exists "Allow authenticated delete kpi records" on public.kpi_records;
create policy "Allow authenticated delete kpi records"
on public.kpi_records
for delete
to authenticated
using (true);

drop policy if exists "Allow authenticated insert incidents" on public.incidents;
create policy "Allow authenticated insert incidents"
on public.incidents
for insert
to authenticated
with check (true);

drop policy if exists "Allow authenticated delete incidents" on public.incidents;
create policy "Allow authenticated delete incidents"
on public.incidents
for delete
to authenticated
using (true);
