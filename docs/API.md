# API

Swagger local (somente quando `NODE_ENV` nao e `production`):

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

## Itens do projeto

Listagem com filtros opcionais:

```text
GET /api/projetos/:projetoId/itens?page=1&perPage=20
  &q=texto
  &status=PARCIAL
  &categoriaId=UUID_DA_CATEGORIA
  &ordenar=prioridade|nome|nome_desc
```

- `perPage` maximo 500.
- `ordenar`: `prioridade` (padrao: prioridade desc, depois mais recentes), `nome` (A-Z), `nome_desc` (Z-A).

Criar item (campos principais):

```json
{
  "categoriaId": "uuid",
  "nome": "Body RN",
  "tamanho": "NAO_APLICAVEL",
  "quantidadeNecessaria": 6,
  "quantidadeComprada": 0,
  "quantidadeGanha": 0,
  "valorEstimado": 35,
  "valorPago": 0,
  "prioridade": "MEDIA",
  "linkCompra": "https://loja.exemplo/produto"
}
```

`linkCompra` e opcional; se enviado sem protocolo, a API pode normalizar para `https://`.

## Usuario (LGPD)

Com Bearer token:

```text
GET /api/usuarios/me
GET /api/usuarios/exportacao-lgpd
DELETE /api/usuarios/conta
```

## Lista publica

```text
GET /api/publico/listas/:shareSlug
POST /api/publico/listas/:shareSlug/itens/:itemId/reservas
```

Corpo da reserva:

```json
{ "nomeVisitante": "Nome", "emailVisitante": "a@b.co", "telefone": "+5511999999999" }
```

Rotas publicas `POST` possuem limite de taxa mais restrito por IP.
