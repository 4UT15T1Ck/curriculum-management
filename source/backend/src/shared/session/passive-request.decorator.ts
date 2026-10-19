import { SetMetadata } from '@nestjs/common';

export const IS_PASSIVE_REQUEST_KEY = 'isPassiveRequest';

// Background polls: authenticated, but they neither renew nor count as user activity for the idle limit.
export const PassiveRequest = () => SetMetadata(IS_PASSIVE_REQUEST_KEY, true);
