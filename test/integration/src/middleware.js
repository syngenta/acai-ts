"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = exports.onTimeout = exports.onError = exports.loggerCallback = exports.beforeAll = exports.afterAll = void 0;
const TARGETS = {
    afterAll: 'after-all',
    beforeAll: 'before-all',
    onError: 'on-error',
    onTimeout: 'on-timeout'
};
const matchesEndpoint = (request, slug) => {
    const path = request.path || '';
    return path.endsWith(`/${slug}`);
};
const cloneObjectBody = (response) => {
    const current = response.rawBody;
    if (current && typeof current === 'object' && !Array.isArray(current)) {
        return { ...current };
    }
    return {};
};
const afterAll = async (request, response) => {
    if (!matchesEndpoint(request, TARGETS.afterAll)) {
        return;
    }
    const nextBody = cloneObjectBody(response);
    nextBody.afterAll = 'afterAll middleware executed';
    response.body = nextBody;
};
exports.afterAll = afterAll;
const beforeAll = async (request) => {
    if (!matchesEndpoint(request, TARGETS.beforeAll)) {
        return;
    }
    const existingContext = request.context || {};
    request.context = { ...existingContext, beforeAll: 'beforeAll middleware executed' };
    if (request.event?.headers) {
        request.event.headers['x-before-all'] = 'true';
    }
};
exports.beforeAll = beforeAll;
const loggerCallback = ({ log }) => {
    console.info('[acai-ts:integration] logger callback invoked', log);
};
exports.loggerCallback = loggerCallback;
const onError = async (request, response) => {
    if (!matchesEndpoint(request, TARGETS.onError)) {
        return;
    }
    response.code = 200;
    response.body = { message: 'onError middleware executed' };
};
exports.onError = onError;
const onTimeout = async (request, response) => {
    if (!matchesEndpoint(request, TARGETS.onTimeout)) {
        return;
    }
    response.code = 200;
    response.body = { message: 'onTimeout middleware executed' };
};
exports.onTimeout = onTimeout;
const withAuth = async (request, response) => {
    const providedKey = request.headers['x-api-key'];
    const expectedKey = process.env.TEST_API_KEY || 'integration-key';
    if (providedKey !== expectedKey) {
        response.code = 401;
        response.setError('auth', 'invalid api key');
    }
};
exports.withAuth = withAuth;
//# sourceMappingURL=middleware.js.map