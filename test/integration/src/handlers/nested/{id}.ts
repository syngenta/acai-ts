import {Request, Response, ValidationRequirements} from 'acai-ts';

type NestedRequest = Request<Record<string, unknown>>;
type NestedResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, ValidationRequirements> = {
  get: {
    requiredPath: '/nested/{id}'
  }
};

export const get = async (request: NestedRequest, response: NestedResponse): Promise<NestedResponse> => {
  response.body = {
    message: 'nested dynamic',
    id: request.pathParams.id,
    route: request.route
  };
  return response;
};
