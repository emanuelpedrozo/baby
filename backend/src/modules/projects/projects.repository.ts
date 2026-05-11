import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto";

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, responsavelId: string, shareSlug: string, dto: CreateProjectDto) {
    return this.prisma.projeto.create({
      data: {
        tenantId,
        responsavelId,
        shareSlug,
        nomeBebe: dto.nomeBebe,
        sexo: dto.sexo,
        dataPrevistaParto: new Date(dto.dataPrevistaParto),
        temaQuarto: dto.temaQuarto,
        orcamentoTotal: dto.orcamentoTotal,
        moeda: dto.moeda,
        climaRegiao: dto.climaRegiao,
        fotoQuarto: dto.fotoQuarto
      }
    });
  }

  list(tenantId: string) {
    return this.prisma.projeto.findMany({
      where: { tenantId, deletadoEm: null },
      orderBy: { criadoEm: "desc" }
    });
  }

  findById(tenantId: string, id: string) {
    return this.prisma.projeto.findFirstOrThrow({
      where: { id, tenantId, deletadoEm: null },
      include: { categorias: true }
    });
  }

  update(tenantId: string, id: string, dto: UpdateProjectDto) {
    return this.prisma.projeto.update({
      where: { id, tenantId },
      data: {
        ...dto,
        dataPrevistaParto: dto.dataPrevistaParto ? new Date(dto.dataPrevistaParto) : undefined
      }
    });
  }

  softDelete(tenantId: string, id: string) {
    return this.prisma.projeto.update({
      where: { id, tenantId },
      data: { deletadoEm: new Date() }
    });
  }
}
