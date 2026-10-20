declare module 'express-session' {
  interface SessionData {
    userId: string;
    // Epoch ms of the last non-passive request: the idle clock (the rolling cookie is renewed by polls too).
    lastActivityAt: number;
  }
}

export {};
