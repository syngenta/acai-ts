import {LoggerCallback, Request, Response, ValidationRequirements} from 'acai-ts';

type IntegrationRequest = Request<Record<string, unknown>>;
type IntegrationResponse = Response<Record<string, unknown>>;
type IntegrationRequirements = ValidationRequirements | undefined;

type MiddlewareFn = (request: IntegrationRequest, response: IntegrationResponse, requirements?: IntegrationRequirements) => Promise<void> | void;

type ErrorMiddlewareFn = (request: IntegrationRequest, response: IntegrationResponse, error: Error) => Promise<void> | void;

type TimeoutMiddlewareFn = ErrorMiddlewareFn;

type AuthMiddlewareFn = MiddlewareFn;

type EndpointSlug = 'after-all' | 'before-all' | 'on-error' | 'on-timeout';

const TARGETS: Record<'afterAll' | 'beforeAll' | 'onError' | 'onTimeout', EndpointSlug> = {
  afterAll: 'after-all',
  beforeAll: 'before-all',
  onError: 'on-error',
  onTimeout: 'on-timeout'
};

const matchesEndpoint = (request: IntegrationRequest, slug: EndpointSlug): boolean => {
  const path = request.path || '';
  return path.endsWith(`/${slug}`);
};

const cloneObjectBody = (response: IntegrationResponse): Record<string, unknown> => {
  const current = response.rawBody;
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return {...(current as Record<string, unknown>)};
  }
  return {};
};

export const afterAll: MiddlewareFn = async (request, response) => {
  if (!matchesEndpoint(request, TARGETS.afterAll)) {
    return;
  }

  const nextBody = cloneObjectBody(response);
  nextBody.afterAll = 'afterAll middleware executed';
  response.body = nextBody;
};

export const beforeAll: MiddlewareFn = async (request) => {
  if (!matchesEndpoint(request, TARGETS.beforeAll)) {
    return;
  }

  const existingContext = (request.context as Record<string, unknown> | undefined) || {};
  request.context = {...existingContext, beforeAll: 'beforeAll middleware executed'};

  if (request.event?.headers) {
    request.event.headers['x-before-all'] = 'true';
  }
};

export const loggerCallback: LoggerCallback = ({log}) => {
  console.info('[acai-ts:integration] logger callback invoked', log);
};

export const onError: ErrorMiddlewareFn = async (request, response) => {
  if (!matchesEndpoint(request, TARGETS.onError)) {
    return;
  }

  response.code = 200;
  response.body = {message: 'onError middleware executed'};
};

export const onTimeout: TimeoutMiddlewareFn = async (request, response) => {
  if (!matchesEndpoint(request, TARGETS.onTimeout)) {
    return;
  }

  response.code = 200;
  response.body = {message: 'onTimeout middleware executed'};
};

export const withAuth: AuthMiddlewareFn = async (request, response) => {
  const providedKey = request.headers['x-api-key'];
  const expectedKey = process.env.TEST_API_KEY || 'integration-key';

  if (providedKey !== expectedKey) {
    response.code = 401;
    response.setError('auth', 'invalid api key');
  }
};

export type {IntegrationRequest, IntegrationResponse, IntegrationRequirements};
