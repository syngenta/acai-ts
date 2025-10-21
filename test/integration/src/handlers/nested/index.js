"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.requirements = void 0;
exports.requirements = {
    get: {}
};
const get = async (request, response) => {
    response.body = {
        message: 'nested index',
        path: request.path
    };
    return response;
};
exports.get = get;
//# sourceMappingURL=index.js.map