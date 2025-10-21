import {Request, Response, ValidationRequirements} from 'acai-ts';

type MiddlewareRequest = Request<Record<string, unknown>>;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {
    requiredAuth: true
  }
};

export const get = async (request: MiddlewareRequest, response: MiddlewareResponse): Promise<MiddlewareResponse> => {
  response.body = {
    message: 'with-auth route',
    headers: request.headers
  };
  return response;
};
