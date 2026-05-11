import { ApiProperty, PartialType } from "@nestjs/swagger";
import { TipoChecklist } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsString, Min } from "class-validator";

export class CreateChecklistItemDto {
  @ApiProperty({ enum: TipoChecklist })
  @IsEnum(TipoChecklist)
  tipo!: TipoChecklist;

  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  concluido!: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  ordem!: number;
}

export class UpdateChecklistItemDto extends PartialType(CreateChecklistItemDto) {}
