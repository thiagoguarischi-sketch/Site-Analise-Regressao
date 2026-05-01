# Supabase Database Schema

Tabela: analyses

Campos:
- id (uuid, primary key)
- user_id (uuid)
- name (text)
- data (jsonb) -> dados inseridos pelo usuário
- results (jsonb) -> resultado da regressão
- created_at (timestamp)

Relacionamentos:
analyses.user_id -> auth.users.id

A aplicação salva e carrega análises desta tabela.
