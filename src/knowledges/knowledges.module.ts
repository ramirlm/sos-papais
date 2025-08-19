import { Module } from '@nestjs/common';
import { KnowledgesService } from './knowledges.service';

@Module({
  providers: [KnowledgesService],
})
export class KnowledgesModule {}
