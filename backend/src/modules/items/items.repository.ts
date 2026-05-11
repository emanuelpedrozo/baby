import { Injectable } from "@nestjs/common";
import { Prisma, StatusItem } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateItemDto, UpdateItemDto } from "./dto";

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(projetoId: string, params: { page: number; perPage: number; q?: string; status?: StatusItem; categoriaId?: string }) {
    const where: Prisma.ItemEnxovalWhereInput = {
      projetoId,
      deletadoEm: null,
      ...(params.categoriaId ? { categoriaId: params.categoriaId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { nome: { contains: params.q, mode: "insensitive" } },
              { descricao: { contains: params.q, mode: "insensitive" } },
              { categoria: { nome: { contains: params.q, mode: "insensitive" } } }
            ]
          }
        : {})
    };
    return this.prisma.$transaction([
      this.prisma.itemEnxoval.count({ where }),
      this.prisma.itemEnxoval.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
        skip: (params.page - 1) * params.perPage,
        take: params.perPage
      })
    ]);
  }

  create(projetoId: string, dto: CreateItemDto, status: StatusItem) {
    return this.prisma.itemEnxoval.create({
      data: { ...dto, projetoId, status },
      include: { categoria: true }
    });
  }

  findById(projetoId: string, id: string) {
    return this.prisma.itemEnxoval.findFirstOrThrow({
      where: { id, projetoId, deletadoEm: null },
      include: { categoria: true, reservas: true, movimentacoes: true }
    });
  }

  update(projetoId: string, id: string, dto: UpdateItemDto, status: StatusItem) {
    return this.prisma.itemEnxoval.update({
      where: { id, projetoId },
      data: { ...dto, status },
      include: { categoria: true }
    });
  }

  softDelete(projetoId: string, id: string) {
    return this.prisma.itemEnxoval.update({
      where: { id, projetoId },
      data: { deletadoEm: new Date() }
    });
  }
}
