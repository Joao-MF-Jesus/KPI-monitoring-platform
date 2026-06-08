# Supabase setup

Execute no SQL Editor:

1. `schema.sql`
2. `authenticated_write_policies.sql`
3. `seed.sql`, apenas para dados ficticios de demonstracao

`schema.sql` cria as tabelas `kpi_records` e `incidents`, indices e leitura publica para demo.

`authenticated_write_policies.sql` libera insert/delete apenas para usuarios autenticados. Isso permite upload de planilha pelo frontend sem abrir escrita anonima no banco.

`seed.sql` substitui os dados atuais por uma massa ficticia para demonstracao.

Nao coloque service role key no frontend.
