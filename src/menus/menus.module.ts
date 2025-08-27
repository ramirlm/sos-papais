import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Option } from './entities/option.entity';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Option, Parent])],
  controllers: [MenusController],
  providers: [MenusService, ParentsService],
  exports: [MenusService],
})
export class MenusModule {}
