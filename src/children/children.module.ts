import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child])],
  providers: [ChildrenService],
})
export class ChildrenModule {}
