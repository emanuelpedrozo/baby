import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "../types/authenticated-user";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AuthenticatedUser }>();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Token ausente.");
    }

    try {
      request.user = jwt.verify(token, this.env("JWT_ACCESS_SECRET")) as AuthenticatedUser;
      return true;
    } catch {
      throw new UnauthorizedException("Token invalido.");
    }
  }

  private env(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Variavel de ambiente ausente: ${key}`);
    }
    return value;
  }
}
