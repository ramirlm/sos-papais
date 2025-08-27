import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Option } from './entities/option.entity';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { Child } from '../children/entities/child.entity';
import { ChildrenService } from '../children/children.service';
import { OllamaAiService } from '../ollama-ai/ollama-ai.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { KnowledgesService } from 'src/knowledges/knowledges.service';
import { KnowledgeEmbeddingService } from 'src/embedding/knowledge-embedding/knowledge-embedding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Option, Parent, Child])],
  controllers: [MenusController],
  providers: [
    MenusService,
    ParentsService,
    ChildrenService,
    OllamaAiService,
    EmbeddingService,
    KnowledgesService,
    KnowledgeEmbeddingService,
  ],
  exports: [MenusService],
})
export class MenusModule {}
