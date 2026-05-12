import "reflect-metadata";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { rateLimit } from "express-rate-limit";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });

  app.setGlobalPrefix("api");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  app.use(cookieParser());
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  const publicPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Muitas requisicoes. Aguarde e tente novamente." }
  });
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/publico") && req.method === "POST") {
      return publicPostLimiter(req, res, next);
    }
    return next();
  });

  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));
  app.enableCors({
    origin: process.env.PUBLIC_APP_URL ?? "http://localhost:3000",
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Baby Enxoval API")
      .setDescription("API RESTful para controle de enxoval de bebe.")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  await app.listen(3333);
}

void bootstrap();
