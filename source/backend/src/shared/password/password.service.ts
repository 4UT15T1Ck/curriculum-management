import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

const DUMMY_PASSWORD = 'dummy-password-for-unknown-usernames';

@Injectable()
export class PasswordService {
  private readonly dummyHash = this.hash(DUMMY_PASSWORD);

  hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async verifyAgainstDummy(password: string): Promise<false> {
    await argon2.verify(await this.dummyHash, password);
    return false;
  }
}
