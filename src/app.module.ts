import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgesModule } from './knowledges/knowledges.module';
import { KnowledgesService } from './knowledges/knowledges.service';
import { EmbeddingService } from './embedding/embedding.service';
import { OllamaAiService } from './ollama-ai/ollama-ai.service';
import { KnowledgeEmbeddingService } from './embedding/knowledge-embedding/knowledge-embedding.service';
import { WhatsappWebService } from './whatsapp-web/whatsapp-web.service';
import { MessageHandlerService } from './message-handler/message-handler.service';
import { ConfigModule } from '@nestjs/config';
import { ParentsModule } from './parents/parents.module';
import { MenusModule } from './menus/menus.module';
import { ChildrenModule } from './children/children.module';
import { environments } from './common/constants/environments';
import { typeormConfigs } from './configs/typeorm';
import { GeminiAiService } from './gemini-ai/gemini-ai.service';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfigs[process.env.NODE_ENV || environments.DEVELOPMENT]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KnowledgesModule,
    ParentsModule,
    MenusModule,
    ChildrenModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    KnowledgesService,
    EmbeddingService,
    OllamaAiService,
    KnowledgeEmbeddingService,
    WhatsappWebService,
    MessageHandlerService,
    GeminiAiService,
  ],
})
export class AppModule {}
