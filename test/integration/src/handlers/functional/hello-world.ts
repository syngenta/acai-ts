import {AfterMiddleware, BeforeMiddleware, Request, Response} from 'acai-ts';
import {
  defineRequirements,
  ensureRecord,
  mergeJsonBody,
  schemaPair,
  schemaRef,
  setJsonBody,
  withAuthRequirement,
  MethodRequirements
} from '../../utils';

type HelloRequest = Request;
type HelloResponse = Response;

const patchBefore: BeforeMiddleware = (request, response): void => {
  const mirroredBody = ensureRecord(request.body);
  const existingContext = (request.context as Record<string, unknown> | undefined) || {};
  request.context = {...existingContext, functionalBeforeEcho: mirroredBody};
  setJsonBody(response as Response<Record<string, unknown>>, {beforeEcho: mirroredBody});
};

const putAfter: AfterMiddleware = (_request, response): void => {
  mergeJsonBody(response as Response<Record<string, unknown>>, {afterHook: 'functional after hook executed'});
};

const version = 'v1';
const resource = 'functional-hello-world';

const schema = {
  post: schemaPair(version, resource, 'post'),
  patch: schemaPair(version, resource, 'patch'),
  put: schemaPair(version, resource, 'put')
};

export const requirements = defineRequirements<Record<string, MethodRequirements>>({
  post: {
    requiredBody: schema.post.request,
    response: schemaRef(schema.post.response)
  },
  patch: {
    requiredBody: schema.patch.request,
    response: schemaRef(schema.patch.response),
    before: patchBefore
  },
  put: {
    requiredBody: schema.put.request,
    response: schemaRef(schema.put.response),
    after: putAfter
  },
  delete: withAuthRequirement({
    requiredHeaders: ['x-trace-id'],
    requiredQuery: ['purpose'],
    availableQuery: ['purpose', 'mode', 'optional']
  })
});

export const get = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response as Response<Record<string, unknown>>, {
    message: 'functional hello world',
    route: request.path
  });
  return response;
};

export const post = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response as Response<Record<string, unknown>>, {
    message: 'functional hello world post',
    received: ensureRecord(request.body)
  });
  return response;
};

export const patch = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  const current = ensureRecord(response.rawBody);
  const contextEcho = (request.context as Record<string, unknown> | undefined)?.functionalBeforeEcho ?? null;
  mergeJsonBody(response as Response<Record<string, unknown>>, {
    ...current,
    patched: true,
    contextEcho
  });
  return response;
};

export const put = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response as Response<Record<string, unknown>>, {
    message: 'functional hello world put',
    payload: ensureRecord(request.body)
  });
  return response;
};

const deleteHandler = async (request: HelloRequest, response: HelloResponse): Promise<HelloResponse> => {
  setJsonBody(response as Response<Record<string, unknown>>, {
    message: 'functional hello world delete',
    headers: request.headers,
    query: request.queryParams
  });
  return response;
};

export {deleteHandler as delete};
