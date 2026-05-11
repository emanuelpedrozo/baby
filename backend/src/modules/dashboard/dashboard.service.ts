import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async resumo(user: AuthenticatedUser, projetoId: string) {
    const projeto = await this.prisma.projeto.findFirstOrThrow({
      where: { id: projetoId, tenantId: user.tenantId, deletadoEm: null }
    });

    const [itens, categorias, checklist] = await Promise.all([
      this.prisma.itemEnxoval.findMany({
        where: { projetoId, deletadoEm: null },
        include: { categoria: true }
      }),
      this.prisma.categoria.findMany({ where: { projetoId, deletadoEm: null } }),
      this.prisma.checklistMaternidadeItem.findMany({ where: { projetoId } })
    ]);

    const custoPrevisto = itens.reduce(
      (sum, item) => sum + Number(item.valorEstimado) * item.quantidadeNecessaria,
      0
    );
    const custoReal = itens.reduce((sum, item) => sum + Number(item.valorPago), 0);
    const totalNecessario = itens.reduce((sum, item) => sum + item.quantidadeNecessaria, 0);
    const totalObtido = itens.reduce((sum, item) => sum + item.quantidadeComprada + item.quantidadeGanha, 0);
    const progressoEnxoval = totalNecessario === 0 ? 0 : Math.min(Math.round((totalObtido / totalNecessario) * 100), 100);
    const checklistConcluido = checklist.filter((item) => item.concluido).length;

    const porCategoria = categorias.map((categoria) => {
      const itensCategoria = itens.filter((item) => item.categoriaId === categoria.id);
      const necessarios = itensCategoria.reduce((sum, item) => sum + item.quantidadeNecessaria, 0);
      const obtidos = itensCategoria.reduce((sum, item) => sum + item.quantidadeComprada + item.quantidadeGanha, 0);
      return {
        id: categoria.id,
        nome: categoria.nome,
        cor: categoria.cor,
        totalItens: itensCategoria.length,
        progresso: necessarios === 0 ? 0 : Math.min(Math.round((obtidos / necessarios) * 100), 100),
        gasto: itensCategoria.reduce((sum, item) => sum + Number(item.valorPago), 0)
      };
    });

    const semanasGestacao = this.calcularSemanaGestacao(projeto.dataPrevistaParto);

    return {
      projeto,
      indicadores: {
        progressoEnxoval,
        totalGasto: custoReal,
        custoPrevisto,
        saldo: Number(projeto.orcamentoTotal) - custoReal,
        economia: Math.max(custoPrevisto - custoReal, 0),
        excedente: Math.max(custoReal - Number(projeto.orcamentoTotal), 0),
        itensRestantes: Math.max(totalNecessario - totalObtido, 0),
        categoriasCompletas: porCategoria.filter((categoria) => categoria.progresso === 100).length,
        checklistMaternidade: checklist.length === 0 ? 0 : Math.round((checklistConcluido / checklist.length) * 100),
        semanasGestacao,
        proximoPasso: this.proximoPasso(semanasGestacao)
      },
      porCategoria
    };
  }

  private calcularSemanaGestacao(dataPrevistaParto: Date) {
    const hoje = new Date();
    const diasParaParto = Math.ceil((dataPrevistaParto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(40, 40 - Math.ceil(diasParaParto / 7)));
  }

  private proximoPasso(semana: number) {
    if (semana < 12) return "Comecar pesquisa de referencias e prioridades.";
    if (semana < 24) return "Comprar roupas RN/P e itens essenciais de higiene.";
    if (semana < 32) return "Montar quarto e revisar compras grandes.";
    return "Preparar mala da maternidade e conferir documentos.";
  }
}
