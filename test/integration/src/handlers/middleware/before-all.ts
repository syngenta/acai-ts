import {Request, Response, ValidationRequirements} from 'acai-ts';

type MiddlewareRequest = Request<Record<string, unknown>>;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {}
};

export const get = async (request: MiddlewareRequest, response: MiddlewareResponse): Promise<MiddlewareResponse> => {
  response.body = {
    message: 'before-all route',
    context: request.context,
    header: request.headers['x-before-all'] ?? null
  };
  return response;
};
