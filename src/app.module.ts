import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgesModule } from './knowledges/knowledges.module';
import { KnowledgesService } from './knowledges/knowledges.service';
import 'dotenv/config';
import { EmbeddingService } from './embedding/embedding.service';

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
  providers: [AppService, KnowledgesService, EmbeddingService],
})
export class AppModule {}
