import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateChecklistItemDto, UpdateChecklistItemDto } from "./dto";

@Injectable()
export class ChecklistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async list(user: AuthenticatedUser, projetoId: string) {
    await this.ensureProject(user, projetoId);
    const items = await this.prisma.checklistMaternidadeItem.findMany({
      where: { projetoId },
      orderBy: [{ tipo: "asc" }, { ordem: "asc" }]
    });
    const concluidos = items.filter((item) => item.concluido).length;
    return {
      data: items,
      progresso: items.length === 0 ? 0 : Math.round((concluidos / items.length) * 100)
    };
  }

  async create(user: AuthenticatedUser, projetoId: string, dto: CreateChecklistItemDto) {
    await this.ensureProject(user, projetoId);
    const item = await this.prisma.checklistMaternidadeItem.create({ data: { ...dto, projetoId } });
    await this.audit.log({ user, entidade: "ChecklistMaternidadeItem", entidadeId: item.id, acao: "CRIAR", depois: item });
    return item;
  }

  async update(user: AuthenticatedUser, projetoId: string, id: string, dto: UpdateChecklistItemDto) {
    await this.ensureProject(user, projetoId);
    const before = await this.prisma.checklistMaternidadeItem.findFirstOrThrow({ where: { id, projetoId } });
    const item = await this.prisma.checklistMaternidadeItem.update({ where: { id }, data: dto });
    await this.audit.log({ user, entidade: "ChecklistMaternidadeItem", entidadeId: id, acao: "ALTERAR", antes: before, depois: item });
    return item;
  }

  async remove(user: AuthenticatedUser, projetoId: string, id: string) {
    await this.ensureProject(user, projetoId);
    const before = await this.prisma.checklistMaternidadeItem.findFirstOrThrow({ where: { id, projetoId } });
    await this.prisma.checklistMaternidadeItem.delete({ where: { id } });
    await this.audit.log({ user, entidade: "ChecklistMaternidadeItem", entidadeId: id, acao: "EXCLUIR", antes: before });
    return { id };
  }

  private ensureProject(user: AuthenticatedUser, projetoId: string) {
    return this.prisma.projeto.findFirstOrThrow({
      where: { id: projetoId, tenantId: user.tenantId, deletadoEm: null }
    });
  }
}
