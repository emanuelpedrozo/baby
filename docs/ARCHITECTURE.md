# Arquitetura

## Stack

- Frontend: Next.js, React, TypeScript, TailwindCSS, Zustand, TanStack Query, PWA.
- Backend: NestJS, API REST, JWT, Swagger, Prisma, PostgreSQL.
- Infra: Docker Compose, MinIO/S3 compatible storage, GitHub Actions.

## Camadas

Backend:

- Controllers: HTTP, Swagger e validacao de entrada por DTO.
- Services: regras de negocio e orquestracao.
- Repositories: acesso a dados.
- Prisma: modelagem e migrations.

Frontend:

- `app`: rotas Next.js.
- `features`: telas e dados de dominio.
- `components`: UI reutilizavel.
- `lib`: API client, formatacao e estado global.

## Regras implementadas no MVP

- JWT com access/refresh token.
- Senha com bcrypt.
- Multi-tenant por `tenantId`.
- Projetos de enxoval.
- Categorias padrao e customizadas.
- Itens com soft delete.
- Recalculo automatico de status por quantidade comprada + ganha.
- Dashboard financeiro com custo previsto, custo real, saldo, economia e excedente.
- Checklist de maternidade com progresso.
- Lista publica de presentes com reserva anti-duplicidade e expiracao de 48h.
- Auditoria de criacao, alteracao e exclusao.
- Exportacao e exclusao LGPD iniciais.

## Proximas extensoes

- Google OAuth.
- Renderer de PDF.
- Worker de notificacoes por email/push/WhatsApp.
- Upload real com URL assinada S3.
- Marketplace price crawler por fila assíncrona.
- IA para sugestao de enxoval.
