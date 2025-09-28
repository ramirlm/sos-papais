import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { Child } from '../children/entities/child.entity';
import { ChildrenService } from '../children/children.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { GeminiAiService } from '../gemini-ai/gemini-ai.service';
import { MenuFactoryService } from './menu-factory.service';
import { ActionsModule } from '../actions/actions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Child]), ActionsModule],
  providers: [
    MenusService,
    MenuFactoryService,
    ParentsService,
    ChildrenService,
    GeminiAiService,
    EmbeddingService,
    KnowledgesService,
  ],
  exports: [MenusService, MenuFactoryService],
})
export class MenusModule {}
