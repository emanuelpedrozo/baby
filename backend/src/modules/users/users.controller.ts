import { Controller, Delete, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { UsersService } from "./users.service";

@ApiTags("usuarios")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("usuarios")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.me(user);
  }

  @Get("exportacao-lgpd")
  exportData(@CurrentUser() user: AuthenticatedUser) {
    return this.users.exportData(user);
  }

  @Delete("conta")
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.users.deleteAccount(user);
  }
}
