import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgesModule } from './knowledges/knowledges.module';
import { KnowledgesService } from './knowledges/knowledges.service';
import { EmbeddingService } from './embedding/embedding.service';
import { OllamaAiService } from './ollama-ai/ollama-ai.service';
import { KnowledgeEmbeddingService } from './embedding/knowledge-embedding/knowledge-embedding.service';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      logging: true,
    }),
    KnowledgesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    KnowledgesService,
    EmbeddingService,
    OllamaAiService,
    KnowledgeEmbeddingService,
  ],
})
export class AppModule {}
