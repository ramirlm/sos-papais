import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgesModule } from './knowledges/knowledges.module';
import { KnowledgesService } from './knowledges/knowledges.service';
import { EmbeddingService } from './embedding/embedding.service';
import { ConfigModule } from '@nestjs/config';
import { GeminiAiService } from './gemini-ai/gemini-ai.service';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      logging: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KnowledgesModule,
  ],
  controllers: [AppController],
  providers: [AppService, KnowledgesService, EmbeddingService, GeminiAiService],
})
export class AppModule {}
