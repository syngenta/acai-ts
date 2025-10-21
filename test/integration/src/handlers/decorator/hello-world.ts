import 'reflect-metadata';
import {After, Auth, BaseEndpoint, Before, Request, Response, Validate} from 'acai-ts';
import {ensureRecord, mergeJsonBody, schemaPair, setJsonBody} from '../../utils';

type HelloRequest = Request<Record<string, unknown>>;
type HelloResponse = Response<Record<string, unknown>>;

const decoratorPatchBefore = (request: HelloRequest, response: HelloResponse): void => {
  const mirroredBody = ensureRecord(request.body);
  const existingContext = (request.context as Record<string, unknown> | undefined) || {};
  request.context = {...existingContext, decoratorBeforeEcho: mirroredBody};
  setJsonBody(response, {beforeEcho: mirroredBody});
};

const decoratorPutAfter = (_request: HelloRequest, response: HelloResponse): void => {
  mergeJsonBody(response, {afterHook: 'decorator after hook executed'});
};

const version = 'v1';
const resource = 'decorator-hello-world';

const schema = {
  post: schemaPair(version, resource, 'post'),
  patch: schemaPair(version, resource, 'patch'),
  put: schemaPair(version, resource, 'put')
};

export class HelloWorldDecoratorEndpoint extends BaseEndpoint {
  async get(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response, {
      message: 'decorator hello world',
      route: request.path
    });
    return response;
  }

  @Validate({
    requiredBody: schema.post.request,
    requiredResponse: schema.post.response
  })
  async post(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response, {
      message: 'decorator hello world post',
      received: ensureRecord(request.body)
    });
    return response;
  }

  @Before(decoratorPatchBefore)
  @Validate({
    requiredBody: schema.patch.request,
    requiredResponse: schema.patch.response
  })
  async patch(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    const current = ensureRecord(response.rawBody);
    const contextEcho = (request.context as Record<string, unknown> | undefined)?.decoratorBeforeEcho ?? null;
    mergeJsonBody(response, {
      ...current,
      patched: true,
      contextEcho
    });
    return response;
  }

  @After(decoratorPutAfter)
  @Validate({
    requiredBody: schema.put.request,
    requiredResponse: schema.put.response
  })
  async put(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response, {
      message: 'decorator hello world put',
      payload: ensureRecord(request.body)
    });
    return response;
  }

  @Auth(true)
  @Validate({
    requiredHeaders: ['x-trace-id'],
    requiredQuery: ['purpose'],
    availableQuery: ['purpose', 'mode', 'optional']
  })
  async delete(request: HelloRequest, response: HelloResponse): Promise<HelloResponse> {
    setJsonBody(response, {
      message: 'decorator hello world delete',
      headers: request.headers,
      query: request.queryParams
    });
    return response;
  }
}
