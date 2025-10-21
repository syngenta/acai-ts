import {Request, Response, ValidationRequirements} from 'acai-ts';
import {
  defineRequirements,
  ensureRecord,
  mergeJsonBody,
  schemaPair,
  setJsonBody,
  withAuthRequirement
} from '../../utils';

type HelloRequest = Request<Record<string, unknown>>;
type HelloResponse = Response<Record<string, unknown>>;

interface HelloValidationRequirements extends ValidationRequirements {
  requiredAuth?: boolean;
  before?: (request: HelloRequest, response: HelloResponse) => Promise<void> | void;
  after?: (request: HelloRequest, response: HelloResponse) => Promise<void> | void;
}

const patchBefore = (request: HelloRequest, response: HelloResponse): void => {
  const mirroredBody = ensureRecord(request.body);
  const existingContext = (request.context as Record<string, unknown> | undefined) || {};
  request.context = {...existingContext, functionalBeforeEcho: mirroredBody};
  setJsonBody(response, {beforeEcho: mirroredBody});
};

const putAfter = (_request: HelloRequest, response: HelloResponse): void => {
  mergeJsonBody(response, {afterHook: 'functional after hook executed'});
};

const version = 'v1';
const resource = 'functional-hello-world';

const schema = {
  post: schemaPair(version, resource, 'post'),
  patch: schemaPair(version, resource, 'patch'),
  put: schemaPair(version, resource, 'put')
};

export const requirements = defineRequirements<Record<string, HelloValidationRequirements>>({
  post: {
    requiredBody: schema.post.request,
    requiredResponse: schema.post.response
  },
  patch: {
    requiredBody: schema.patch.request,
    requiredResponse: schema.patch.response,
    before: patchBefore
  },
  put: {
    requiredBody: schema.put.request,
    requiredResponse: schema.put.response,
    after: putAfter
  },
  delete: withAuthRequirement({
    requiredHeaders: ['x-trace-id'],
    requiredQuery: ['purpose'],
    availableQuery: ['purpose', 'mode', 'optional']
  })
});

export const get = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response, {
    message: 'functional hello world',
    route: request.path
  });
  return response;
};

export const post = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response, {
    message: 'functional hello world post',
    received: ensureRecord(request.body)
  });
  return response;
};

export const patch = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  const current = ensureRecord(response.rawBody);
  const contextEcho = (request.context as Record<string, unknown> | undefined)?.functionalBeforeEcho ?? null;
  mergeJsonBody(response, {
    ...current,
    patched: true,
    contextEcho
  });
  return response;
};

export const put = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response, {
    message: 'functional hello world put',
    payload: ensureRecord(request.body)
  });
  return response;
};

const deleteHandler = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response, {
    message: 'functional hello world delete',
    headers: request.headers,
    query: request.queryParams
  });
  return response;
};

export {deleteHandler as delete};
