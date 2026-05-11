import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ReserveGiftDto } from "./dto";
import { GiftsService } from "./gifts.service";

@ApiTags("lista publica de presentes")
@Controller("publico/listas/:shareSlug")
export class GiftsController {
  constructor(private readonly gifts: GiftsService) {}

  @Get()
  list(@Param("shareSlug") shareSlug: string) {
    return this.gifts.publicList(shareSlug);
  }

  @Post("itens/:itemId/reservas")
  reserve(@Param("shareSlug") shareSlug: string, @Param("itemId") itemId: string, @Body() dto: ReserveGiftDto) {
    return this.gifts.reserve(shareSlug, itemId, dto);
  }
}
