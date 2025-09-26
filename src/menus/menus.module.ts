import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { Child } from '../children/entities/child.entity';
import { ChildrenService } from '../children/children.service';
import { OllamaAiService } from '../ollama-ai/ollama-ai.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { KnowledgeEmbeddingService } from '../embedding/knowledge-embedding/knowledge-embedding.service';
import { GeminiAiService } from '../gemini-ai/gemini-ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Child])],
  providers: [
    MenusService,
    ParentsService,
    ChildrenService,
    OllamaAiService,
    GeminiAiService,
    EmbeddingService,
    KnowledgesService,
    KnowledgeEmbeddingService,
  ],
  exports: [MenusService],
})
export class MenusModule {}
