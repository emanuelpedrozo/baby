import { BadRequestException, Injectable } from "@nestjs/common";
import { StatusReserva } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { ReserveGiftDto } from "./dto";

@Injectable()
export class GiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async publicList(shareSlug: string) {
    const projeto = await this.prisma.projeto.findUniqueOrThrow({
      where: { shareSlug },
      select: { id: true, nomeBebe: true, temaQuarto: true, dataPrevistaParto: true }
    });

    const itens = await this.prisma.itemEnxoval.findMany({
      where: { projetoId: projeto.id, deletadoEm: null },
      include: {
        categoria: true,
        reservas: { where: { status: StatusReserva.ATIVA, expiraEm: { gt: new Date() } } }
      },
      orderBy: { nome: "asc" }
    });

    return {
      projeto,
      itens: itens.map((item) => ({
        ...item,
        disponivelParaReserva: item.reservas.length === 0 && item.quantidadeComprada + item.quantidadeGanha < item.quantidadeNecessaria
      }))
    };
  }

  async reserve(shareSlug: string, itemId: string, dto: ReserveGiftDto) {
    const projeto = await this.prisma.projeto.findUniqueOrThrow({ where: { shareSlug } });
    const ativa = await this.prisma.reservaPresente.findFirst({
      where: { itemId, status: StatusReserva.ATIVA, expiraEm: { gt: new Date() } }
    });
    if (ativa) {
      throw new BadRequestException("Item ja reservado.");
    }

    const item = await this.prisma.itemEnxoval.findFirstOrThrow({
      where: { id: itemId, projetoId: projeto.id, deletadoEm: null }
    });
    if (item.quantidadeComprada + item.quantidadeGanha >= item.quantidadeNecessaria) {
      throw new BadRequestException("Item ja completo.");
    }

    return this.prisma.reservaPresente.create({
      data: {
        projetoId: projeto.id,
        itemId,
        nomeVisitante: dto.nomeVisitante,
        emailVisitante: dto.emailVisitante,
        telefone: dto.telefone,
        expiraEm: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    });
  }
}
