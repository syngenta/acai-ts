import {Request, Response, ValidationRequirements} from 'acai-ts';

type MiddlewareRequest = Request<Record<string, unknown>>;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {}
};

export const get = async (_request: MiddlewareRequest, _response: MiddlewareResponse): Promise<never> => {
  throw new Error('forced on-error path');
};
