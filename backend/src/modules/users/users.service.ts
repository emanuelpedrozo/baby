import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  me(user: AuthenticatedUser) {
    return this.prisma.usuario.findUniqueOrThrow({
      where: { id: user.sub },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        tenantId: true,
        consentimentoLgpd: true,
        criadoEm: true
      }
    });
  }

  async exportData(user: AuthenticatedUser) {
    const [usuario, projetos] = await Promise.all([
      this.me(user),
      this.prisma.projeto.findMany({
        where: { tenantId: user.tenantId, deletadoEm: null },
        include: { itens: true, categorias: true, checklist: true, reservas: true }
      })
    ]);
    return { usuario, projetos };
  }

  async deleteAccount(user: AuthenticatedUser) {
    return this.prisma.usuario.update({
      where: { id: user.sub },
      data: { deletadoEm: new Date() },
      select: { id: true, deletadoEm: true }
    });
  }
}
