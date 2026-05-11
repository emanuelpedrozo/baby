import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";

@ApiTags("categorias")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("categorias")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiQuery({ name: "projetoId", required: false })
  list(@CurrentUser() user: AuthenticatedUser, @Query("projetoId") projetoId?: string) {
    return this.categories.list(user, projetoId);
  }

  @Post()
  @ApiQuery({ name: "projetoId", required: false })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCategoryDto, @Query("projetoId") projetoId?: string) {
    return this.categories.create(user, dto, projetoId);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(user, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.categories.remove(user, id);
  }
}
