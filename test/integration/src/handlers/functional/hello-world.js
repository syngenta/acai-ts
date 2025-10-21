"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete = exports.put = exports.patch = exports.post = exports.get = exports.requirements = void 0;
const utils_1 = require("../../utils");
const patchBefore = (request, response) => {
    const mirroredBody = (0, utils_1.ensureRecord)(request.body);
    const existingContext = request.context || {};
    request.context = { ...existingContext, functionalBeforeEcho: mirroredBody };
    (0, utils_1.setJsonBody)(response, { beforeEcho: mirroredBody });
};
const putAfter = (_request, response) => {
    (0, utils_1.mergeJsonBody)(response, { afterHook: 'functional after hook executed' });
};
const version = 'v1';
const resource = 'functional-hello-world';
const schema = {
    post: (0, utils_1.schemaPair)(version, resource, 'post'),
    patch: (0, utils_1.schemaPair)(version, resource, 'patch'),
    put: (0, utils_1.schemaPair)(version, resource, 'put')
};
exports.requirements = (0, utils_1.defineRequirements)({
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
    delete: (0, utils_1.withAuthRequirement)({
        requiredHeaders: ['x-trace-id'],
        requiredQuery: ['purpose'],
        availableQuery: ['purpose', 'mode', 'optional']
    })
});
const get = async (request, response) => {
    (0, utils_1.setJsonBody)(response, {
        message: 'functional hello world',
        route: request.path
    });
    return response;
};
exports.get = get;
const post = async (request, response) => {
    (0, utils_1.setJsonBody)(response, {
        message: 'functional hello world post',
        received: (0, utils_1.ensureRecord)(request.body)
    });
    return response;
};
exports.post = post;
const patch = async (request, response) => {
    const current = (0, utils_1.ensureRecord)(response.rawBody);
    const contextEcho = request.context?.functionalBeforeEcho ?? null;
    (0, utils_1.mergeJsonBody)(response, {
        ...current,
        patched: true,
        contextEcho
    });
    return response;
};
exports.patch = patch;
const put = async (request, response) => {
    (0, utils_1.setJsonBody)(response, {
        message: 'functional hello world put',
        payload: (0, utils_1.ensureRecord)(request.body)
    });
    return response;
};
exports.put = put;
const deleteHandler = async (request, response) => {
    (0, utils_1.setJsonBody)(response, {
        message: 'functional hello world delete',
        headers: request.headers,
        query: request.queryParams
    });
    return response;
};
exports.delete = deleteHandler;
//# sourceMappingURL=hello-world.js.map