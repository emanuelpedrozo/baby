import { ApiProperty, PartialType } from "@nestjs/swagger";
import { PrioridadeItem, StatusItem, TamanhoItem } from "@prisma/client";
import { Transform } from "class-transformer";
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

  @ApiProperty({ required: false, description: "URL do produto; protocolo https sera assumido se omitido." })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === "") return undefined;
    const s = String(value).trim();
    if (!s) return undefined;
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  })
  @IsUrl({ require_protocol: true })
  linkCompra?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagem?: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}
