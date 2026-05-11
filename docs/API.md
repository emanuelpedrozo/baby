# API

Swagger local:

```text
http://localhost:3333/api/docs
```

Fluxo minimo:

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@baby.local","senha":"12345678"}'
```

Use o `accessToken` retornado:

```bash
curl http://localhost:3333/api/projetos \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Lista publica:

```text
GET /api/publico/listas/:shareSlug
POST /api/publico/listas/:shareSlug/itens/:itemId/reservas
```
