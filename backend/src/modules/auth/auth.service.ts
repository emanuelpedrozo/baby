import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PapelUsuario } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { PrismaService } from "../../database/prisma.service";
import { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.consentimentoLgpd) {
      throw new BadRequestException("Consentimento LGPD e obrigatorio.");
    }

    const existing = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException("Email ja cadastrado.");
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        nome: `Familia de ${dto.nome}`,
        slug: `${dto.email.split("@")[0]}-${randomBytes(3).toString("hex")}`.toLowerCase()
      }
    });

    const usuario = await this.prisma.usuario.create({
      data: {
        tenantId: tenant.id,
        nome: dto.nome,
        email: dto.email.toLowerCase(),
        senhaHash: await bcrypt.hash(dto.senha, 12),
        papel: PapelUsuario.RESPONSAVEL,
        consentimentoLgpd: true
      }
    });

    return this.issueTokens(usuario.id);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!usuario || usuario.deletadoEm) {
      throw new UnauthorizedException("Credenciais invalidas.");
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException("Credenciais invalidas.");
    }

    return this.issueTokens(usuario.id);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revogadoEm: null,
        expiraEm: { gt: new Date() }
      }
    });

    if (!stored) {
      throw new UnauthorizedException("Refresh token invalido.");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revogadoEm: new Date() }
    });

    return this.issueTokens(stored.usuarioId);
  }

  private async issueTokens(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: { id: true, tenantId: true, email: true, nome: true, papel: true }
    });

    const payload = {
      sub: usuario.id,
      tenantId: usuario.tenantId,
      email: usuario.email,
      papel: usuario.papel
    };

    const expiresIn = (process.env.JWT_ACCESS_TTL ?? "15m") as SignOptions["expiresIn"];
    const accessToken = jwt.sign(payload, this.env("JWT_ACCESS_SECRET"), { expiresIn });
    const refreshToken = randomBytes(48).toString("base64url");
    const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: this.hashToken(refreshToken),
        expiraEm
      }
    });

    return { accessToken, refreshToken, usuario };
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private env(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Variavel de ambiente ausente: ${key}`);
    }
    return value;
  }
}
