import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import { CSRF_HEADER, CSRF_HEADER_VALUE, CsrfGuard } from './csrf.guard.js';

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();
  function context(method: string, header?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          get: (name: string) => (name === CSRF_HEADER ? header : undefined),
        }),
      }),
    } as never;
  }

  it('allows safe methods', () =>
    expect(guard.canActivate(context('GET'))).toBe(true));
  it('rejects writes without the required header', () => {
    expect(() => guard.canActivate(context('POST'))).toThrow(AppException);
    try {
      guard.canActivate(context('POST'));
    } catch (error) {
      expect((error as AppException).code).toBe(
        COMMON_ERRORS.CSRF_HEADER_MISSING.code,
      );
    }
  });
  it('allows writes with the required header', () =>
    expect(guard.canActivate(context('POST', CSRF_HEADER_VALUE))).toBe(true));
});
