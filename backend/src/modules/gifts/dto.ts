import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class ReserveGiftDto {
  @ApiProperty()
  @IsString()
  nomeVisitante!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  emailVisitante?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefone?: string;
}
