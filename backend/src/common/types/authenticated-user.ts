import { PapelUsuario } from "@prisma/client";

export type AuthenticatedUser = {
  sub: string;
  tenantId: string;
  email: string;
  papel: PapelUsuario;
};
