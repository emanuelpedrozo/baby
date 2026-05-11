import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, projetoId?: string) {
    return this.prisma.categoria.findMany({
      where: {
        tenantId,
        deletadoEm: null,
        OR: [{ projetoId: projetoId ?? null }, { projetoId: null, padrao: true }]
      },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }]
    });
  }

  create(tenantId: string, projetoId: string | undefined, dto: CreateCategoryDto) {
    return this.prisma.categoria.create({
      data: {
        tenantId,
        projetoId,
        nome: dto.nome,
        icone: dto.icone,
        cor: dto.cor,
        prioridade: dto.prioridade,
        ordem: dto.ordem,
        padrao: dto.padrao
      }
    });
  }

  update(tenantId: string, id: string, dto: UpdateCategoryDto) {
    return this.prisma.categoria.update({
      where: { id, tenantId },
      data: dto
    });
  }

  softDelete(tenantId: string, id: string) {
    return this.prisma.categoria.update({
      where: { id, tenantId },
      data: { deletadoEm: new Date() }
    });
  }

  defaults(tenantId: string) {
    return this.prisma.categoria.findMany({
      where: { tenantId, projetoId: null, padrao: true, deletadoEm: null },
      orderBy: { ordem: "asc" }
    });
  }
}
