import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileStorageService } from './file-storage.service.js';

describe('FileStorageService', () => {
  let root: string;
  let storage: FileStorageService;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'ctdt-files-'));
    storage = new FileStorageService({ get: () => root } as never);
  });

  afterEach(() => rm(root, { recursive: true, force: true }));

  async function readAll(stream: AsyncIterable<Buffer>): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  it('writes a file and opens it again with its size', async () => {
    await storage.write('syllabi/s1/a.pdf', Uint8Array.from([1, 2, 3]));

    const { stream, sizeBytes } = await storage.open('syllabi/s1/a.pdf');

    expect(sizeBytes).toBe(3);
    expect([...(await readAll(stream))]).toEqual([1, 2, 3]);
  });

  it('leaves no temporary file behind', async () => {
    await storage.write('a.bin', Uint8Array.from([1]));

    await expect(readFile(path.join(root, 'a.bin.part'))).rejects.toThrow();
  });

  it('answers FILE_MISSING for a path that is not on disk', async () => {
    await expect(storage.open('nope/a.pdf')).rejects.toMatchObject({
      code: 'FILE_MISSING',
    });
  });

  it('refuses a path that leaves the root', async () => {
    await expect(
      storage.write('../outside.txt', Uint8Array.from([1])),
    ).rejects.toThrow('escapes FILES_ROOT');
    await expect(storage.open('../outside.txt')).rejects.toThrow();
  });

  it('does not write over a stale temporary file', async () => {
    await storage.write('a.bin', Uint8Array.from([1]));
    // A stale temp file from a crashed write blocks the next write to that path instead of corrupting it.
    await storage.write('b.bin.part', Uint8Array.from([1]));

    await expect(
      storage.write('b.bin', Uint8Array.from([2])),
    ).rejects.toThrow();
  });

  it('removes a file and does not mind a missing one', async () => {
    await storage.write('a.bin', Uint8Array.from([1]));

    await storage.remove('a.bin');
    await storage.remove('a.bin');

    await expect(storage.open('a.bin')).rejects.toMatchObject({
      code: 'FILE_MISSING',
    });
  });
});
