import type { Request } from 'express';
import type { Session } from 'express-session';

export async function startSession(
  request: Request,
  userId: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    request.session.regenerate((error: unknown) =>
      error ? reject(error) : resolve(),
    ),
  );
  request.session.userId = userId;
  await new Promise<void>((resolve, reject) =>
    request.session.save((error: unknown) =>
      error ? reject(error) : resolve(),
    ),
  );
}

export async function endSession(session: Session | undefined): Promise<void> {
  if (!session) return;
  await new Promise<void>((resolve, reject) =>
    session.destroy((error: unknown) => (error ? reject(error) : resolve())),
  );
}
