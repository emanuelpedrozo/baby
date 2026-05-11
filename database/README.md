# Banco de dados

O modelo principal esta em `backend/prisma/schema.prisma`.

Comandos:

```bash
npm run prisma:generate -w backend
npm run prisma:migrate -w backend
npm run prisma:seed -w backend
```

O deploy usa `prisma migrate deploy`, consumindo migrations versionadas em `backend/prisma/migrations`.
