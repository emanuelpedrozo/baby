import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { AuditService } from "../audit/audit.service";
import { CategoriesService } from "../categories/categories.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto";
import { ProjectsRepository } from "./projects.repository";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projects: ProjectsRepository,
    private readonly categories: CategoriesService,
    private readonly audit: AuditService
  ) {}

  list(user: AuthenticatedUser) {
    return this.projects.list(user.tenantId);
  }

  find(user: AuthenticatedUser, id: string) {
    return this.projects.findById(user.tenantId, id);
  }

  async create(user: AuthenticatedUser, dto: CreateProjectDto) {
    const project = await this.projects.create(user.tenantId, user.sub, randomBytes(8).toString("hex"), dto);
    await this.categories.cloneDefaultsToProject(user.tenantId, project.id);
    await this.audit.log({ user, entidade: "Projeto", entidadeId: project.id, acao: "CRIAR", depois: project });
    return project;
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateProjectDto) {
    const before = await this.projects.findById(user.tenantId, id);
    const project = await this.projects.update(user.tenantId, id, dto);
    await this.audit.log({ user, entidade: "Projeto", entidadeId: id, acao: "ALTERAR", antes: before, depois: project });
    return project;
  }

  async remove(user: AuthenticatedUser, id: string) {
    const before = await this.projects.findById(user.tenantId, id);
    const project = await this.projects.softDelete(user.tenantId, id);
    await this.audit.log({ user, entidade: "Projeto", entidadeId: id, acao: "EXCLUIR", antes: before, depois: project });
    return { id, deletadoEm: project.deletadoEm };
  }
}
