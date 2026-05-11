import { Module } from "@nestjs/common";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ChecklistsModule } from "./modules/checklists/checklists.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { GiftsModule } from "./modules/gifts/gifts.module";
import { ItemsModule } from "./modules/items/items.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    CategoriesModule,
    ItemsModule,
    DashboardModule,
    ChecklistsModule,
    GiftsModule,
    UploadsModule,
    ReportsModule
  ]
})
export class AppModule {}
