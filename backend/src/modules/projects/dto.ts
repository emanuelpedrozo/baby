import { ApiProperty, PartialType } from "@nestjs/swagger";
import { SexoBebe, StatusProjeto } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  nomeBebe!: string;

  @ApiProperty({ enum: SexoBebe })
  @IsEnum(SexoBebe)
  sexo!: SexoBebe;

  @ApiProperty()
  @IsDateString()
  dataPrevistaParto!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temaQuarto?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  orcamentoTotal!: number;

  @ApiProperty({ default: "BRL" })
  @IsString()
  moeda!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  climaRegiao?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ enum: StatusProjeto, required: false })
  @IsOptional()
  @IsEnum(StatusProjeto)
  status?: StatusProjeto;
}
