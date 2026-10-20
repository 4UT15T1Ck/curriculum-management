import { createReadStream } from 'node:fs';
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation.js';
import { AppException } from '../exception/app.exception.js';
import { FILE_ERRORS } from './file.errors.js';

const TEMP_SUFFIX = '.part';

// Paths in the database are relative with '/' separators; the root comes from FILES_ROOT,
// so moving the folder needs no data change.
@Injectable()
export class FileStorageService implements OnModuleInit {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly root: string;

  constructor(config: ConfigService<Env, true>) {
    this.root = path.resolve(config.get('FILES_ROOT', { infer: true }));
  }

  async onModuleInit(): Promise<void> {
    await mkdir(this.root, { recursive: true });
  }

  // Temp-then-rename: a crash never leaves a half-written file under the final name.
  async write(relativePath: string, content: Uint8Array): Promise<void> {
    const target = this.resolve(relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    const temp = `${target}${TEMP_SUFFIX}`;
    await writeFile(temp, content, { flag: 'wx' });
    await rename(temp, target);
  }

  async open(
    relativePath: string,
  ): Promise<{ stream: Readable; sizeBytes: number }> {
    const target = this.resolve(relativePath);
    const info = await stat(target).catch(() => null);
    if (!info?.isFile()) {
      this.logger.error(`Stored file missing: ${relativePath}`);
      throw new AppException(FILE_ERRORS.FILE_MISSING);
    }
    return { stream: createReadStream(target), sizeBytes: info.size };
  }

  async remove(relativePath: string): Promise<void> {
    await rm(this.resolve(relativePath), { force: true });
  }

  private resolve(relativePath: string): string {
    const target = path.resolve(this.root, ...relativePath.split('/'));
    if (!target.startsWith(this.root + path.sep)) {
      throw new Error(`File path escapes FILES_ROOT: ${relativePath}`);
    }
    return target;
  }
}
