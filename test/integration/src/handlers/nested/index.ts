import {Request, Response, ValidationRequirements} from 'acai-ts';

type NestedRequest = Request<Record<string, unknown>>;
type NestedResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {}
};

export const get = async (request: NestedRequest, response: NestedResponse): Promise<NestedResponse> => {
  response.body = {
    message: 'nested index',
    path: request.path
  };
  return response;
};
