import { ApiProperty, PartialType } from "@nestjs/swagger";
import { PrioridadeItem, StatusItem, TamanhoItem } from "@prisma/client";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  categoriaId!: string;

  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ enum: TamanhoItem, default: TamanhoItem.NAO_APLICAVEL })
  @IsEnum(TamanhoItem)
  tamanho!: TamanhoItem;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(0)
  quantidadeNecessaria!: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  quantidadeComprada!: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  quantidadeGanha!: number;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  valorEstimado!: number;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  valorPago!: number;

  @ApiProperty({ enum: PrioridadeItem, default: PrioridadeItem.MEDIA })
  @IsEnum(PrioridadeItem)
  prioridade!: PrioridadeItem;

  @ApiProperty({ enum: StatusItem, required: false })
  @IsOptional()
  @IsEnum(StatusItem)
  status?: StatusItem;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkCompra?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagem?: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}
