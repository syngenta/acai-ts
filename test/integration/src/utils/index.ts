export * from './validation';
export * from './response';

import type {IRequest, IResponse} from 'acai-ts';

export type IntegrationHandler<TReq extends IRequest = IRequest, TRes extends IResponse = IResponse> = (
    request: TReq,
    response: TRes
) => Promise<TRes> | TRes;
