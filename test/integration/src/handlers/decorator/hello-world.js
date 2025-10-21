"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldDecoratorEndpoint = void 0;
require("reflect-metadata");
const acai_ts_1 = require("acai-ts");
const utils_1 = require("../../utils");
const decoratorPatchBefore = (request, response) => {
    const mirroredBody = (0, utils_1.ensureRecord)(request.body);
    const existingContext = request.context || {};
    request.context = { ...existingContext, decoratorBeforeEcho: mirroredBody };
    (0, utils_1.setJsonBody)(response, { beforeEcho: mirroredBody });
};
const decoratorPutAfter = (_request, response) => {
    (0, utils_1.mergeJsonBody)(response, { afterHook: 'decorator after hook executed' });
};
const version = 'v1';
const resource = 'decorator-hello-world';
const schema = {
    post: (0, utils_1.schemaPair)(version, resource, 'post'),
    patch: (0, utils_1.schemaPair)(version, resource, 'patch'),
    put: (0, utils_1.schemaPair)(version, resource, 'put')
};
class HelloWorldDecoratorEndpoint extends acai_ts_1.BaseEndpoint {
    async get(request, response) {
        (0, utils_1.setJsonBody)(response, {
            message: 'decorator hello world',
            route: request.path
        });
        return response;
    }
    async post(request, response) {
        (0, utils_1.setJsonBody)(response, {
            message: 'decorator hello world post',
            received: (0, utils_1.ensureRecord)(request.body)
        });
        return response;
    }
    async patch(request, response) {
        const current = (0, utils_1.ensureRecord)(response.rawBody);
        const contextEcho = request.context?.decoratorBeforeEcho ?? null;
        (0, utils_1.mergeJsonBody)(response, {
            ...current,
            patched: true,
            contextEcho
        });
        return response;
    }
    async put(request, response) {
        (0, utils_1.setJsonBody)(response, {
            message: 'decorator hello world put',
            payload: (0, utils_1.ensureRecord)(request.body)
        });
        return response;
    }
    async delete(request, response) {
        (0, utils_1.setJsonBody)(response, {
            message: 'decorator hello world delete',
            headers: request.headers,
            query: request.queryParams
        });
        return response;
    }
}
exports.HelloWorldDecoratorEndpoint = HelloWorldDecoratorEndpoint;
__decorate([
    (0, acai_ts_1.Validate)({
        requiredBody: schema.post.request,
        requiredResponse: schema.post.response
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelloWorldDecoratorEndpoint.prototype, "post", null);
__decorate([
    (0, acai_ts_1.Before)(decoratorPatchBefore),
    (0, acai_ts_1.Validate)({
        requiredBody: schema.patch.request,
        requiredResponse: schema.patch.response
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelloWorldDecoratorEndpoint.prototype, "patch", null);
__decorate([
    (0, acai_ts_1.After)(decoratorPutAfter),
    (0, acai_ts_1.Validate)({
        requiredBody: schema.put.request,
        requiredResponse: schema.put.response
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelloWorldDecoratorEndpoint.prototype, "put", null);
__decorate([
    (0, acai_ts_1.Auth)(true),
    (0, acai_ts_1.Validate)({
        requiredHeaders: ['x-trace-id'],
        requiredQuery: ['purpose'],
        availableQuery: ['purpose', 'mode', 'optional']
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HelloWorldDecoratorEndpoint.prototype, "delete", null);
//# sourceMappingURL=hello-world.js.map