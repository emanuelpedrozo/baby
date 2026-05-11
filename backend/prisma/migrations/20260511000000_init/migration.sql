CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'RESPONSAVEL', 'COLABORADOR', 'VISITANTE');
CREATE TYPE "SexoBebe" AS ENUM ('FEMININO', 'MASCULINO', 'NAO_INFORMADO');
CREATE TYPE "StatusProjeto" AS ENUM ('ATIVO', 'ARQUIVADO', 'CONCLUIDO');
CREATE TYPE "TamanhoItem" AS ENUM ('RN', 'P', 'M', 'G', 'GG', 'UNICO', 'NAO_APLICAVEL');
CREATE TYPE "PrioridadeItem" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'ESSENCIAL');
CREATE TYPE "StatusItem" AS ENUM ('NAO_INICIADO', 'EM_PESQUISA', 'PARCIAL', 'COMPLETO', 'COMPRADO', 'GANHO', 'CANCELADO');
CREATE TYPE "TipoChecklist" AS ENUM ('MAE', 'BEBE', 'ACOMPANHANTE', 'DOCUMENTOS');
CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('ENTRADA', 'USO', 'EMPRESTIMO', 'DOACAO', 'AJUSTE');
CREATE TYPE "StatusReserva" AS ENUM ('ATIVA', 'CONFIRMADA', 'EXPIRADA', 'CANCELADA');

CREATE TABLE "Tenant" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Usuario" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "papel" "PapelUsuario" NOT NULL DEFAULT 'RESPONSAVEL',
  "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "deletadoEm" TIMESTAMP(3),
  CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "revogadoEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Projeto" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "responsavelId" TEXT NOT NULL,
  "nomeBebe" TEXT NOT NULL,
  "sexo" "SexoBebe" NOT NULL DEFAULT 'NAO_INFORMADO',
  "dataPrevistaParto" TIMESTAMP(3) NOT NULL,
  "temaQuarto" TEXT,
  "orcamentoTotal" DECIMAL(12,2) NOT NULL,
  "moeda" TEXT NOT NULL DEFAULT 'BRL',
  "status" "StatusProjeto" NOT NULL DEFAULT 'ATIVO',
  "shareSlug" TEXT NOT NULL,
  "climaRegiao" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "deletadoEm" TIMESTAMP(3),
  CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Categoria" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projetoId" TEXT,
  "nome" TEXT NOT NULL,
  "icone" TEXT,
  "cor" TEXT,
  "prioridade" INTEGER NOT NULL DEFAULT 0,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "padrao" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "deletadoEm" TIMESTAMP(3),
  CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ItemEnxoval" (
  "id" TEXT NOT NULL,
  "projetoId" TEXT NOT NULL,
  "categoriaId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "tamanho" "TamanhoItem" NOT NULL DEFAULT 'NAO_APLICAVEL',
  "quantidadeNecessaria" INTEGER NOT NULL DEFAULT 1,
  "quantidadeComprada" INTEGER NOT NULL DEFAULT 0,
  "quantidadeGanha" INTEGER NOT NULL DEFAULT 0,
  "valorEstimado" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "valorPago" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "prioridade" "PrioridadeItem" NOT NULL DEFAULT 'MEDIA',
  "status" "StatusItem" NOT NULL DEFAULT 'NAO_INICIADO',
  "observacoes" TEXT,
  "linkCompra" TEXT,
  "imagem" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "deletadoEm" TIMESTAMP(3),
  CONSTRAINT "ItemEnxoval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReservaPresente" (
  "id" TEXT NOT NULL,
  "projetoId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "nomeVisitante" TEXT NOT NULL,
  "emailVisitante" TEXT,
  "telefone" TEXT,
  "status" "StatusReserva" NOT NULL DEFAULT 'ATIVA',
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReservaPresente_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChecklistMaternidadeItem" (
  "id" TEXT NOT NULL,
  "projetoId" TEXT NOT NULL,
  "tipo" "TipoChecklist" NOT NULL,
  "nome" TEXT NOT NULL,
  "concluido" BOOLEAN NOT NULL DEFAULT false,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChecklistMaternidadeItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MovimentacaoEstoque" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "tipo" "TipoMovimentacaoEstoque" NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "observacao" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Upload" (
  "id" TEXT NOT NULL,
  "projetoId" TEXT NOT NULL,
  "itemId" TEXT,
  "url" TEXT NOT NULL,
  "chaveStorage" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "tamanhoBytes" INTEGER NOT NULL,
  "favorito" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notificacao" (
  "id" TEXT NOT NULL,
  "projetoId" TEXT NOT NULL,
  "canal" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensagem" TEXT NOT NULL,
  "enviadaEm" TIMESTAMP(3),
  "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogAuditoria" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT,
  "entidade" TEXT NOT NULL,
  "entidadeId" TEXT NOT NULL,
  "acao" TEXT NOT NULL,
  "antes" JSONB,
  "depois" JSONB,
  "ip" TEXT,
  "userAgent" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Projeto_shareSlug_key" ON "Projeto"("shareSlug");
CREATE INDEX "Projeto_tenantId_status_idx" ON "Projeto"("tenantId", "status");
CREATE INDEX "Categoria_tenantId_projetoId_idx" ON "Categoria"("tenantId", "projetoId");
CREATE INDEX "ItemEnxoval_projetoId_categoriaId_status_idx" ON "ItemEnxoval"("projetoId", "categoriaId", "status");
CREATE INDEX "ReservaPresente_itemId_status_idx" ON "ReservaPresente"("itemId", "status");
CREATE INDEX "ChecklistMaternidadeItem_projetoId_tipo_idx" ON "ChecklistMaternidadeItem"("projetoId", "tipo");
CREATE INDEX "LogAuditoria_entidade_entidadeId_idx" ON "LogAuditoria"("entidade", "entidadeId");

ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ItemEnxoval" ADD CONSTRAINT "ItemEnxoval_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ItemEnxoval" ADD CONSTRAINT "ItemEnxoval_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReservaPresente" ADD CONSTRAINT "ReservaPresente_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReservaPresente" ADD CONSTRAINT "ReservaPresente_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemEnxoval"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChecklistMaternidadeItem" ADD CONSTRAINT "ChecklistMaternidadeItem_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemEnxoval"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemEnxoval"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
