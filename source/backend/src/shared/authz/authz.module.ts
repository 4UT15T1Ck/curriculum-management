import { Global, Module } from '@nestjs/common';
import { ScopeSourceReader } from './scope-source.reader.js';
import { ScopeService } from './scope.service.js';

@Global()
@Module({
  providers: [ScopeService, ScopeSourceReader],
  exports: [ScopeService],
})
export class AuthzModule {}
