import {Request, Response} from 'acai-ts';
import {MethodRequirements} from '../../utils';

type MiddlewareRequest = Request;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, MethodRequirements> = {
  get: {
    timeout: 5
  }
};

export const get = async (_request: MiddlewareRequest, _response: MiddlewareResponse): Promise<{message: string}> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  return {message: 'timeout should have occurred'};
};
