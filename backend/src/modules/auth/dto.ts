import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  consentimentoLgpd!: boolean;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  senha!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
