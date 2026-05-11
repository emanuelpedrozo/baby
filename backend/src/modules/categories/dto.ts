import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsHexColor, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icone?: string;

  @ApiProperty({ required: false, example: "#8aa38b" })
  @IsOptional()
  @IsHexColor()
  cor?: string;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  prioridade!: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  ordem!: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  padrao!: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
