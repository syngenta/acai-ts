export * from './validation';
export * from './response';

export type {Request, Response} from 'acai-ts';

export type IntegrationHandler<
  TReq extends Request<Record<string, unknown>> = Request<Record<string, unknown>>,
  TRes extends Response<Record<string, unknown>> = Response<Record<string, unknown>>
> = (request: TReq, response: TRes) => Promise<TRes> | TRes;
