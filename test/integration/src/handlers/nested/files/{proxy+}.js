"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.requirements = void 0;
exports.requirements = {
    get: {}
};
const get = async (request, response) => {
    response.body = {
        message: 'nested proxy route',
        proxy: request.pathParams.proxy,
        route: request.route
    };
    return response;
};
exports.get = get;
//# sourceMappingURL=%7Bproxy+%7D.js.map