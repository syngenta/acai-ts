import {Request, Response} from 'acai-ts';
import {MethodRequirements} from '../../utils';

type NestedRequest = Request;
type NestedResponse = Response<Record<string, unknown>>;

export const requirements: Record<string, MethodRequirements> = {
  get: {}
};

export const get = async (request: NestedRequest, response: NestedResponse): Promise<NestedResponse> => {
  response.body = {
    message: 'nested dynamic',
    id: request.pathParams.id,
    route: request.route
  };
  return response;
};
