import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { StatusItem } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { CreateItemDto, UpdateItemDto } from "./dto";
import { ItemsService } from "./items.service";

@ApiTags("itens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projetos/:projetoId/itens")
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "perPage", required: false })
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "status", enum: StatusItem, required: false })
  @ApiQuery({ name: "categoriaId", required: false })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projetoId") projetoId: string,
    @Query("page") page = "1",
    @Query("perPage") perPage = "20",
    @Query("q") q?: string,
    @Query("status") status?: StatusItem,
    @Query("categoriaId") categoriaId?: string
  ) {
    return this.items.list(user, projetoId, {
      page: Number(page),
      perPage: Math.min(Number(perPage), 500),
      q,
      status,
      categoriaId
    });
  }

  @Get("sugestao")
  @ApiQuery({ name: "nome" })
  suggest(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string, @Query("nome") nome: string) {
    return this.items.suggest(user, projetoId, nome);
  }

  @Get(":id")
  find(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string, @Param("id") id: string) {
    return this.items.find(user, projetoId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string, @Body() dto: CreateItemDto) {
    return this.items.create(user, projetoId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projetoId") projetoId: string,
    @Param("id") id: string,
    @Body() dto: UpdateItemDto
  ) {
    return this.items.update(user, projetoId, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("projetoId") projetoId: string, @Param("id") id: string) {
    return this.items.remove(user, projetoId, id);
  }
}
