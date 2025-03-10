import { Global, Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigController } from "./config.controller";
import { ConfigService } from "./config.service";

@Global()
@Module({
  providers: [
    {
      provide: "CONFIG_VARIABLES",
      useFactory: async (prisma: PrismaService) => {
        return await prisma.config.findMany();
      },
      inject: [PrismaService],
    },
    ConfigService,
  ],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class ConfigModule {}
