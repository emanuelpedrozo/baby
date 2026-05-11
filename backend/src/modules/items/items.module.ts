import { Module } from "@nestjs/common";
import { ItemsController } from "./items.controller";
import { ItemsRepository } from "./items.repository";
import { ItemsService } from "./items.service";
import { SuggestionService } from "./suggestion.service";

@Module({
  controllers: [ItemsController],
  providers: [ItemsRepository, ItemsService, SuggestionService],
  exports: [ItemsService, SuggestionService]
})
export class ItemsModule {}
