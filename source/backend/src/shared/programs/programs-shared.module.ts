import { Module } from '@nestjs/common';
import { VersionContentCopier } from './version-content.copier.js';

@Module({
  providers: [VersionContentCopier],
  exports: [VersionContentCopier],
})
export class ProgramsSharedModule {}
