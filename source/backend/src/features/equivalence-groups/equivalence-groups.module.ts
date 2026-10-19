import { Module } from '@nestjs/common';
import { EquivalenceGroupsController } from './equivalence-groups.controller.js';
import { EquivalenceGroupsService } from './equivalence-groups.service.js';

@Module({
  controllers: [EquivalenceGroupsController],
  providers: [EquivalenceGroupsService],
})
export class EquivalenceGroupsModule {}
