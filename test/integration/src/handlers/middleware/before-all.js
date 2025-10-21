"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.requirements = void 0;
exports.requirements = {
    get: {}
};
const get = async (request, response) => {
    response.body = {
        message: 'before-all route',
        context: request.context,
        header: request.headers['x-before-all'] ?? null
    };
    return response;
};
exports.get = get;
//# sourceMappingURL=before-all.js.map