import {Request, Response} from 'acai-ts';
import {MethodRequirements} from '../../utils';

type MiddlewareRequest = Request;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, MethodRequirements> = {
  get: {}
};

export const get = async (_request: MiddlewareRequest, response: MiddlewareResponse): Promise<MiddlewareResponse> => {
  response.body = {
    message: 'after-all route baseline'
  };
  return response;
};
