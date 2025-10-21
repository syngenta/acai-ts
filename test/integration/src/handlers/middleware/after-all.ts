import {Request, Response, ValidationRequirements} from 'acai-ts';

type MiddlewareRequest = Request<Record<string, unknown>>;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {}
};

export const get = async (_request: MiddlewareRequest, response: MiddlewareResponse): Promise<MiddlewareResponse> => {
  response.body = {
    message: 'after-all route baseline'
  };
  return response;
};
