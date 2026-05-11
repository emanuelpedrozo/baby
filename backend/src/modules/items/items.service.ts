import { Injectable } from "@nestjs/common";
import { StatusItem } from "@prisma/client";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { calcularStatusItem } from "./status";
import { CreateItemDto, UpdateItemDto } from "./dto";
import { ItemsRepository } from "./items.repository";
import { SuggestionService } from "./suggestion.service";

@Injectable()
export class ItemsService {
  constructor(
    private readonly repo: ItemsRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly suggestions: SuggestionService
  ) {}

  async list(
    user: AuthenticatedUser,
    projetoId: string,
    params: { page: number; perPage: number; q?: string; status?: StatusItem; categoriaId?: string }
  ) {
    await this.ensureProject(user, projetoId);
    const [total, data] = await this.repo.list(projetoId, params);
    return { data, meta: { total, page: params.page, perPage: params.perPage } };
  }

  async create(user: AuthenticatedUser, projetoId: string, dto: CreateItemDto) {
    await this.ensureProject(user, projetoId);
    const status = calcularStatusItem(dto);
    const item = await this.repo.create(projetoId, dto, status);
    await this.audit.log({ user, entidade: "ItemEnxoval", entidadeId: item.id, acao: "CRIAR", depois: item });
    return item;
  }

  async find(user: AuthenticatedUser, projetoId: string, id: string) {
    await this.ensureProject(user, projetoId);
    return this.repo.findById(projetoId, id);
  }

  async update(user: AuthenticatedUser, projetoId: string, id: string, dto: UpdateItemDto) {
    await this.ensureProject(user, projetoId);
    const before = await this.repo.findById(projetoId, id);
    const status = calcularStatusItem({
      quantidadeComprada: dto.quantidadeComprada ?? before.quantidadeComprada,
      quantidadeGanha: dto.quantidadeGanha ?? before.quantidadeGanha,
      quantidadeNecessaria: dto.quantidadeNecessaria ?? before.quantidadeNecessaria,
      status: dto.status
    });
    const item = await this.repo.update(projetoId, id, dto, status);
    await this.audit.log({ user, entidade: "ItemEnxoval", entidadeId: id, acao: "ALTERAR", antes: before, depois: item });
    return item;
  }

  async remove(user: AuthenticatedUser, projetoId: string, id: string) {
    await this.ensureProject(user, projetoId);
    const before = await this.repo.findById(projetoId, id);
    const item = await this.repo.softDelete(projetoId, id);
    await this.audit.log({ user, entidade: "ItemEnxoval", entidadeId: id, acao: "EXCLUIR", antes: before, depois: item });
    return { id, deletadoEm: item.deletadoEm };
  }

  async suggest(user: AuthenticatedUser, projetoId: string, nome: string) {
    const projeto = await this.ensureProject(user, projetoId);
    return this.suggestions.suggest({ nome, climaRegiao: projeto.climaRegiao, sexo: projeto.sexo });
  }

  private ensureProject(user: AuthenticatedUser, projetoId: string) {
    return this.prisma.projeto.findFirstOrThrow({
      where: { id: projetoId, tenantId: user.tenantId, deletadoEm: null }
    });
  }
}
