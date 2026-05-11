import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    user?: AuthenticatedUser;
    entidade: string;
    entidadeId: string;
    acao: string;
    antes?: unknown;
    depois?: unknown;
    ip?: string;
    userAgent?: string;
  }) {
    await this.prisma.logAuditoria.create({
      data: {
        usuarioId: params.user?.sub,
        entidade: params.entidade,
        entidadeId: params.entidadeId,
        acao: params.acao,
        antes: params.antes === undefined ? undefined : (params.antes as object),
        depois: params.depois === undefined ? undefined : (params.depois as object),
        ip: params.ip,
        userAgent: params.userAgent
      }
    });
  }
}
