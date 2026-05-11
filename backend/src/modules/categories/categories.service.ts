import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";

const DEFAULT_CATEGORIES = [
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

@Injectable()
export class CategoriesService {
  constructor(
    private readonly repo: CategoriesRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async ensureDefaults(tenantId: string) {
    const count = await this.prisma.categoria.count({
      where: { tenantId, projetoId: null, padrao: true }
    });
    if (count > 0) {
      return;
    }

    await this.prisma.categoria.createMany({
      data: DEFAULT_CATEGORIES.map(([nome, icone, cor], ordem) => ({
        tenantId,
        nome,
        icone,
        cor,
        ordem,
        prioridade: ordem < 5 ? 10 : 5,
        padrao: true
      }))
    });
  }

  async cloneDefaultsToProject(tenantId: string, projetoId: string) {
    await this.ensureDefaults(tenantId);
    const defaults = await this.repo.defaults(tenantId);
    await this.prisma.categoria.createMany({
      data: defaults.map((categoria) => ({
        tenantId,
        projetoId,
        nome: categoria.nome,
        icone: categoria.icone,
        cor: categoria.cor,
        prioridade: categoria.prioridade,
        ordem: categoria.ordem,
        padrao: false
      })),
      skipDuplicates: true
    });
  }

  list(user: AuthenticatedUser, projetoId?: string) {
    return this.repo.list(user.tenantId, projetoId);
  }

  async create(user: AuthenticatedUser, dto: CreateCategoryDto, projetoId?: string) {
    const categoria = await this.repo.create(user.tenantId, projetoId, dto);
    await this.audit.log({ user, entidade: "Categoria", entidadeId: categoria.id, acao: "CRIAR", depois: categoria });
    return categoria;
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateCategoryDto) {
    const before = await this.prisma.categoria.findFirstOrThrow({ where: { id, tenantId: user.tenantId } });
    const categoria = await this.repo.update(user.tenantId, id, dto);
    await this.audit.log({ user, entidade: "Categoria", entidadeId: id, acao: "ALTERAR", antes: before, depois: categoria });
    return categoria;
  }

  async remove(user: AuthenticatedUser, id: string) {
    const before = await this.prisma.categoria.findFirstOrThrow({ where: { id, tenantId: user.tenantId } });
    const categoria = await this.repo.softDelete(user.tenantId, id);
    await this.audit.log({ user, entidade: "Categoria", entidadeId: id, acao: "EXCLUIR", antes: before, depois: categoria });
    return { id, deletadoEm: categoria.deletadoEm };
  }
}
