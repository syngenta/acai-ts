import {Request, Response} from 'acai-ts';
import {MethodRequirements} from '../../utils';

type MiddlewareRequest = Request;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, MethodRequirements> = {
  get: {
    requiredAuth: true,
    auth: true
  }
};

export const get = async (request: MiddlewareRequest, response: MiddlewareResponse): Promise<MiddlewareResponse> => {
  response.body = {
    message: 'with-auth route',
    headers: request.headers
  };
  return response;
};
