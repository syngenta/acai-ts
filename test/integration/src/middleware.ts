import {AfterMiddleware, AuthMiddleware, BeforeMiddleware, ErrorMiddleware, LoggerCallback, TimeoutMiddleware} from 'acai-ts';
import type {IRequest, IResponse} from 'acai-ts';

type IntegrationRequest = IRequest;
type IntegrationResponse = IResponse;

type EndpointSlug = 'after-all' | 'before-all' | 'on-error' | 'on-timeout';

const TARGETS: Record<'afterAll' | 'beforeAll' | 'onError' | 'onTimeout', EndpointSlug> = {
    afterAll: 'after-all',
    beforeAll: 'before-all',
    onError: 'on-error',
    onTimeout: 'on-timeout'
};

const getRequestPath = (request: IntegrationRequest): string => {
    if ('path' in request && typeof (request as Record<string, unknown>).path === 'string') {
        return (request as Record<string, string>).path;
    }
    if ('resource' in request && typeof request.resource === 'string') {
        return request.resource;
    }
    return '';
};

const matchesEndpoint = (request: IntegrationRequest, slug: EndpointSlug): boolean => {
    const path = getRequestPath(request);
    return path.endsWith(`/${slug}`);
};

const cloneObjectBody = (response: IntegrationResponse): Record<string, unknown> => {
    const current = response.rawBody;
    if (current && typeof current === 'object' && !Array.isArray(current)) {
        return {...(current as Record<string, unknown>)};
    }
    return {};
};

export const afterAll: AfterMiddleware = async (request, response) => {
    if (!matchesEndpoint(request, TARGETS.afterAll)) {
        return;
    }

    const nextBody = cloneObjectBody(response);
    nextBody.afterAll = 'afterAll middleware executed';
    response.body = nextBody;
};

export const beforeAll: BeforeMiddleware = async (request) => {
    if (!matchesEndpoint(request, TARGETS.beforeAll)) {
        return;
    }

    const wrapper = request as unknown as {context?: Record<string, unknown>};
    const existingContext = wrapper.context ?? {};
    wrapper.context = {
        ...existingContext,
        beforeAll: 'beforeAll middleware executed'
    };

    const eventHeaders = (request as unknown as {event?: {headers?: Record<string, string>}}).event?.headers;
    if (eventHeaders) {
        eventHeaders['x-before-all'] = 'true';
    }
};

export const loggerCallback: LoggerCallback = ({log}) => {
    console.info('[acai-ts:integration] logger callback invoked', log);
};

export const onError: ErrorMiddleware = async (request, response) => {
    if (!matchesEndpoint(request, TARGETS.onError)) {
        return;
    }

    response.code = 200;
    response.body = {message: 'onError middleware executed'};
};

export const onTimeout: TimeoutMiddleware = async (request, response) => {
    if (!matchesEndpoint(request, TARGETS.onTimeout)) {
        return;
    }

    response.code = 200;
    response.body = {message: 'onTimeout middleware executed'};
};

export const withAuth: AuthMiddleware = async (request, response) => {
    const providedKey = request.headers['x-api-key'];
    const expectedKey = process.env.TEST_API_KEY || 'integration-key';

    if (providedKey !== expectedKey) {
        response.code = 401;
        response.setError('auth', 'invalid api key');
    }
};
