import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("relatorios")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projetos/:projetoId/relatorios")
export class ReportsController {
  @Get(":tipo")
  generate(@Param("projetoId") projetoId: string, @Param("tipo") tipo: string) {
    return {
      projetoId,
      tipo,
      status: "preparado",
      formatos: ["json", "pdf"],
      message: "Relatorios em PDF devem ser conectados ao renderer na proxima iteracao."
    };
  }
}
