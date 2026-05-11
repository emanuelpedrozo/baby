import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  @Post("presigned-url")
  presignedUrl() {
    return {
      message: "Endpoint preparado para S3 compatible storage. Configure provider para gerar URL assinada.",
      provider: "s3-compatible"
    };
  }
}
