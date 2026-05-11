import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ChecklistsService } from "./checklists.service";
import { CreateChecklistItemDto, UpdateChecklistItemDto } from "./dto";

@ApiTags("checklist maternidade")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projetos/:projetoId/checklist")
export class ChecklistsController {
  constructor(private readonly checklists: ChecklistsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string) {
    return this.checklists.list(user, projetoId);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string, @Body() dto: CreateChecklistItemDto) {
    return this.checklists.create(user, projetoId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projetoId") projetoId: string,
    @Param("id") id: string,
    @Body() dto: UpdateChecklistItemDto
  ) {
    return this.checklists.update(user, projetoId, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string, @Param("id") id: string) {
    return this.checklists.remove(user, projetoId, id);
  }
}
