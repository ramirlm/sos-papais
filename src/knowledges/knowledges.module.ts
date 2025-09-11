import { Module } from '@nestjs/common';
import { KnowledgesService } from './knowledges.service';

@Module({
  providers: [KnowledgesService],
  exports: [KnowledgesService],
})
export class KnowledgesModule {}
