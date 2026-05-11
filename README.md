# Controle de Enxoval de Bebe

Plataforma web/PWA para planejamento de enxoval, compras, presentes, checklist de maternidade, controle financeiro e indicadores.

## Estrutura

```text
/backend   API NestJS + Prisma
/frontend  App Next.js + PWA
/docs      Arquitetura, API e ERD
/docker    Scripts auxiliares de infraestrutura
/database  Notas operacionais do banco
```

## Rodar com Docker

```bash
cp .env.example .env
docker compose up --build
```

O Compose carrega variaveis de [`.env`](.env) (nao use `.env.example` diretamente em producao).

Servicos:

- Frontend: http://localhost:3000
- Backend: http://localhost:3333/api
- Swagger: http://localhost:3333/api/docs
- MinIO console: http://localhost:9001
- Lista publica de presentes (exemplo seed): http://localhost:3000/publico/listas/demo-lista

Usuario seed:

```text
demo@baby.local
12345678
```

## Rodar em producao local

Este modo sobe imagens buildadas, sem volumes de desenvolvimento:

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Acesse:

- Sistema: http://localhost:3000
- Swagger: http://localhost:3333/api/docs

Para parar sem apagar dados:

```bash
docker compose -f docker-compose.prod.yml down
```

## Rodar localmente

```bash
npm install
npm run prisma:generate -w backend
npm run prisma:migrate -w backend
npm run prisma:seed -w backend
npm run dev:apps
```

## MVP entregue

- Autenticacao email/senha com JWT e refresh token.
- Projetos de enxoval.
- Categorias padrao e customizadas.
- Itens do enxoval com regra automatica de status.
- Dashboard financeiro e operacional.
- Checklist da mala de maternidade.
- Lista publica de presentes com reserva e bloqueio por 48h.
- PWA responsivo com dark mode.
- Swagger, Docker Compose, CI e migration inicial.

## Pendencias planejadas

Google OAuth, PDF real, notificacoes externas, upload S3 assinado, comparador de preços e modulos de IA/marketplaces estao preparados como extensoes, mas ainda sem integracao externa.
