import {Request, Response, ValidationRequirements} from 'acai-ts';

type MiddlewareRequest = Request<Record<string, unknown>>;
type MiddlewareResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {
    timeout: 5
  }
};

export const get = async (_request: MiddlewareRequest, _response: MiddlewareResponse): Promise<{message: string}> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  return {message: 'timeout should have occurred'};
};
