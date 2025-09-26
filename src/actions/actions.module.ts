import { Module } from '@nestjs/common';
import { ActionHandlers } from './handlers';

@Module({
    providers: [...ActionHandlers],
    exports: [...ActionHandlers],
})
export class ActionsModule {}
