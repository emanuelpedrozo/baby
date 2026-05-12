import { BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { GiftsService } from "./gifts.service";

function createService(prisma: Record<string, unknown>) {
  return new GiftsService(prisma as unknown as PrismaService);
}

describe("GiftsService", () => {
  it("reserve rejeita item completo", async () => {
    const prisma = {
      projeto: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "p1" }) },
      reservaPresente: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn() },
      itemEnxoval: {
        findFirstOrThrow: jest.fn().mockResolvedValue({
          id: "i1",
          projetoId: "p1",
          quantidadeComprada: 2,
          quantidadeGanha: 0,
          quantidadeNecessaria: 2,
          deletadoEm: null
        })
      }
    };
    const service = createService(prisma);
    await expect(service.reserve("slug", "i1", { nomeVisitante: "Ana" })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.reservaPresente.create).not.toHaveBeenCalled();
  });

  it("reserve rejeita quando ja existe reserva ativa", async () => {
    const prisma = {
      projeto: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "p1" }) },
      reservaPresente: {
        findFirst: jest.fn().mockResolvedValue({ id: "r1" }),
        create: jest.fn()
      },
      itemEnxoval: { findFirstOrThrow: jest.fn() }
    };
    const service = createService(prisma);
    await expect(service.reserve("slug", "i1", { nomeVisitante: "Ana" })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.itemEnxoval.findFirstOrThrow).not.toHaveBeenCalled();
  });

  it("reserve cria reserva quando disponivel", async () => {
    const prisma = {
      projeto: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "p1" }) },
      reservaPresente: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: "r1" })
      },
      itemEnxoval: {
        findFirstOrThrow: jest.fn().mockResolvedValue({
          id: "i1",
          projetoId: "p1",
          quantidadeComprada: 0,
          quantidadeGanha: 0,
          quantidadeNecessaria: 2,
          deletadoEm: null
        })
      }
    };
    const service = createService(prisma);
    const out = await service.reserve("slug", "i1", { nomeVisitante: "Ana", emailVisitante: "a@b.co" });
    expect(out).toEqual({ id: "r1" });
    expect(prisma.reservaPresente.create).toHaveBeenCalled();
  });

  it("publicList marca disponivelParaReserva conforme reservas e quantidades", async () => {
    const expira = new Date(Date.now() + 3600_000);
    const prisma = {
      projeto: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: "p1",
          nomeBebe: "B",
          temaQuarto: null,
          dataPrevistaParto: new Date()
        })
      },
      itemEnxoval: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "i1",
            nome: "Body",
            quantidadeNecessaria: 1,
            quantidadeComprada: 0,
            quantidadeGanha: 0,
            categoria: { nome: "R" },
            reservas: [{ status: "ATIVA", expiraEm: expira }]
          },
          {
            id: "i2",
            nome: "Meia",
            quantidadeNecessaria: 1,
            quantidadeComprada: 0,
            quantidadeGanha: 0,
            categoria: { nome: "R" },
            reservas: []
          }
        ])
      }
    };
    const service = createService(prisma);
    const list = await service.publicList("slug");
    expect(list.itens).toHaveLength(2);
    expect(list.itens[0].disponivelParaReserva).toBe(false);
    expect(list.itens[1].disponivelParaReserva).toBe(true);
  });
});
