import { PrismaClient, PapelUsuario, SexoBebe } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categorias = [
  ["Roupas RN", "shirt", "#8aa38b"],
  ["Roupas P", "shirt", "#9fb7a1"],
  ["Roupas M", "shirt", "#b8c9ba"],
  ["Higiene", "sparkles", "#d9b8a8"],
  ["Banho", "bath", "#9bb7c7"],
  ["Alimentacao", "utensils", "#d0a86f"],
  ["Quarto", "home", "#c8b7a6"],
  ["Passeio", "car", "#88a9bd"],
  ["Seguranca", "shield", "#b67d7d"],
  ["Amamentacao", "heart", "#c79bad"],
  ["Hospital", "cross", "#95a7b5"],
  ["Brinquedos", "toy-brick", "#d2b56f"],
  ["Farmacinha", "pill", "#8fa6a0"],
  ["Organizacao", "boxes", "#aaa1bc"],
  ["Moveis", "bed", "#a78f7b"]
] as const;

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: { nome: "Familia Demo", slug: "demo" }
  });

  const senhaHash = await bcrypt.hash("12345678", 12);
  const usuario = await prisma.usuario.upsert({
    where: { email: "demo@baby.local" },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: "Responsavel Demo",
      email: "demo@baby.local",
      senhaHash,
      papel: PapelUsuario.RESPONSAVEL,
      consentimentoLgpd: true
    }
  });

  for (const [index, [nome, icone, cor]] of categorias.entries()) {
    await prisma.categoria.upsert({
      where: { id: `${tenant.id}-${index}` },
      update: {},
      create: {
        id: `${tenant.id}-${index}`,
        tenantId: tenant.id,
        nome,
        icone,
        cor,
        ordem: index,
        prioridade: index < 5 ? 10 : 5,
        padrao: true
      }
    });
  }

  const projeto = await prisma.projeto.upsert({
    where: { shareSlug: "demo-lista" },
    update: {
      nomeBebe: "Caio Emanuel",
      sexo: SexoBebe.MASCULINO,
      temaQuarto: "Safari suave",
      orcamentoTotal: 6500,
      climaRegiao: "temperado"
    },
    create: {
      tenantId: tenant.id,
      responsavelId: usuario.id,
      nomeBebe: "Caio Emanuel",
      sexo: SexoBebe.MASCULINO,
      dataPrevistaParto: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      temaQuarto: "Safari suave",
      orcamentoTotal: 6500,
      moeda: "BRL",
      shareSlug: "demo-lista",
      climaRegiao: "temperado"
    }
  });

  const projectCategoryCount = await prisma.categoria.count({
    where: { tenantId: tenant.id, projetoId: projeto.id }
  });
  if (projectCategoryCount === 0) {
    const defaults = await prisma.categoria.findMany({
      where: { tenantId: tenant.id, projetoId: null, padrao: true },
      orderBy: { ordem: "asc" }
    });

    await prisma.categoria.createMany({
      data: defaults.map((categoria) => ({
        tenantId: tenant.id,
        projetoId: projeto.id,
        nome: categoria.nome,
        icone: categoria.icone,
        cor: categoria.cor,
        ordem: categoria.ordem,
        prioridade: categoria.prioridade,
        padrao: false
      }))
    });
  }

  const categoriaRoupa = await prisma.categoria.findFirstOrThrow({
    where: { tenantId: tenant.id, projetoId: projeto.id, nome: "Roupas RN" }
  });
  const categoriaHigiene = await prisma.categoria.findFirstOrThrow({
    where: { tenantId: tenant.id, projetoId: projeto.id, nome: "Higiene" }
  });

  const itemCount = await prisma.itemEnxoval.count({ where: { projetoId: projeto.id } });
  if (itemCount === 0) {
    await prisma.itemEnxoval.createMany({
      data: [
        {
          projetoId: projeto.id,
          categoriaId: categoriaRoupa.id,
          nome: "Body RN manga curta",
          tamanho: "RN",
          quantidadeNecessaria: 6,
          quantidadeComprada: 2,
          valorEstimado: 35,
          valorPago: 70,
          prioridade: "ESSENCIAL",
          status: "PARCIAL"
        },
        {
          projetoId: projeto.id,
          categoriaId: categoriaHigiene.id,
          nome: "Fraldas RN",
          tamanho: "NAO_APLICAVEL",
          quantidadeNecessaria: 200,
          quantidadeComprada: 0,
          valorEstimado: 1.1,
          valorPago: 0,
          prioridade: "ESSENCIAL",
          status: "NAO_INICIADO"
        }
      ]
    });
  }

  const checklistCount = await prisma.checklistMaternidadeItem.count({ where: { projetoId: projeto.id } });
  if (checklistCount === 0) {
    await prisma.checklistMaternidadeItem.createMany({
      data: [
        { projetoId: projeto.id, tipo: "BEBE", nome: "Bodies RN", ordem: 1 },
        { projetoId: projeto.id, tipo: "BEBE", nome: "Manta", ordem: 2 },
        { projetoId: projeto.id, tipo: "MAE", nome: "Documentos pessoais", ordem: 1 },
        { projetoId: projeto.id, tipo: "DOCUMENTOS", nome: "Cartao pre-natal", ordem: 1 }
      ]
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
