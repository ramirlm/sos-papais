import { Module } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { ChildrenModule } from '../children/children.module';

@Module({
  imports: [TypeOrmModule.forFeature([Parent]), ChildrenModule],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
