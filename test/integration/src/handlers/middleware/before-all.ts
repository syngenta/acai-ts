import {Request, Response} from 'acai-ts';
import {MethodRequirements} from '../../utils';

type MiddlewareRequest = Request;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, MethodRequirements> = {
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
