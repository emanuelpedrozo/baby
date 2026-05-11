import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { CreateProjectDto, UpdateProjectDto } from "./dto";
import { ProjectsService } from "./projects.service";

@ApiTags("projetos")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projetos")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.projects.list(user);
  }

  @Get(":id")
  find(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.projects.find(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProjectDto) {
    return this.projects.create(user, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(user, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.projects.remove(user, id);
  }
}
