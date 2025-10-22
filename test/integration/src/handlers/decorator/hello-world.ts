import 'reflect-metadata';
import {After, Auth, BaseEndpoint, Before, Request, Response, Validate} from 'acai-ts';
import type {AfterMiddleware, BeforeMiddleware} from 'acai-ts';
import {ensureRecord, mergeJsonBody, schemaPair, schemaRef, setJsonBody} from '../../utils';

type HelloRequest = Request;
type HelloResponse = Response;

const decoratorPatchBefore: BeforeMiddleware = (request, response): void => {
  const mirroredBody = ensureRecord(request.body);
  const existingContext = (request.context as Record<string, unknown> | undefined) || {};
  request.context = {...existingContext, decoratorBeforeEcho: mirroredBody};
  setJsonBody(response as Response<Record<string, unknown>>, {beforeEcho: mirroredBody});
};

const decoratorPutAfter: AfterMiddleware = (_request, response): void => {
  mergeJsonBody(response as Response<Record<string, unknown>>, {afterHook: 'decorator after hook executed'});
};

const version = 'v1';
const resource = 'decorator-hello-world';

const schema = {
  post: schemaPair(version, resource, 'post'),
  patch: schemaPair(version, resource, 'patch'),
  put: schemaPair(version, resource, 'put')
};

const RequireAuth = (required = true): MethodDecorator => (_target, _propertyKey, descriptor) => {
  if (!descriptor || typeof descriptor.value !== 'function') {
    return;
  }

  Auth(required)(descriptor.value as unknown as Function);
};

export class HelloWorldDecoratorEndpoint extends BaseEndpoint {
  async get(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response as Response<Record<string, unknown>>, {
      message: 'decorator hello world',
      route: request.path
    });
    return response;
  }

  @Validate({
    requiredBody: schema.post.request,
    response: schemaRef(schema.post.response)
  })
  async post(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response as Response<Record<string, unknown>>, {
      message: 'decorator hello world post',
      received: ensureRecord(request.body)
    });
    return response;
  }

  @Before(decoratorPatchBefore)
  @Validate({
    requiredBody: schema.patch.request,
    response: schemaRef(schema.patch.response)
  })
  async patch(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    const current = ensureRecord(response.rawBody);
    const contextEcho = (request.context as Record<string, unknown> | undefined)?.decoratorBeforeEcho ?? null;
    mergeJsonBody(response as Response<Record<string, unknown>>, {
      ...current,
      patched: true,
      contextEcho
    });
    return response;
  }

  @After(decoratorPutAfter)
  @Validate({
    requiredBody: schema.put.request,
    response: schemaRef(schema.put.response)
  })
  async put(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response as Response<Record<string, unknown>>, {
      message: 'decorator hello world put',
      payload: ensureRecord(request.body)
    });
    return response;
  }

  @RequireAuth(true)
  @Validate({
    requiredHeaders: ['x-trace-id'],
    requiredQuery: ['purpose'],
    availableQuery: ['purpose', 'mode', 'optional']
  })
  async delete(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response as Response<Record<string, unknown>>, {
      message: 'decorator hello world delete',
      headers: request.headers,
      query: request.queryParams
    });
    return response;
  }
}
