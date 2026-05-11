import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";

const uploadDir = join(process.cwd(), "uploads");

function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
}

function filename(_req: unknown, file: { originalname: string }, cb: (error: Error | null, filename: string) => void) {
  const ext = extname(file.originalname).toLowerCase();
  cb(null, `${randomUUID()}${ext}`);
}

function imageFilter(_req: unknown, file: { mimetype: string }, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (!file.mimetype.startsWith("image/")) {
    cb(new BadRequestException("Envie apenas arquivos de imagem."), false);
    return;
  }
  cb(null, true);
}

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  @Post("imagem")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, uploadDir);
        },
        filename
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  )
  uploadImage(@UploadedFile() file?: { filename: string; mimetype: string; size: number }) {
    if (!file) {
      throw new BadRequestException("Arquivo de imagem obrigatorio.");
    }
    const publicBaseUrl = process.env.PUBLIC_API_URL ?? "http://localhost:3333";
    return {
      url: `${publicBaseUrl}/uploads/${file.filename}`,
      mimeType: file.mimetype,
      tamanhoBytes: file.size
    };
  }

  @Post("presigned-url")
  presignedUrl() {
    return {
      message: "Endpoint preparado para S3 compatible storage. Configure provider para gerar URL assinada.",
      provider: "s3-compatible"
    };
  }
}
