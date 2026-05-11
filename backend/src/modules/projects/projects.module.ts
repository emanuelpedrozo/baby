import { Module } from "@nestjs/common";
import { CategoriesModule } from "../categories/categories.module";
import { ProjectsController } from "./projects.controller";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [CategoriesModule],
  controllers: [ProjectsController],
  providers: [ProjectsRepository, ProjectsService],
  exports: [ProjectsService, ProjectsRepository]
})
export class ProjectsModule {}
