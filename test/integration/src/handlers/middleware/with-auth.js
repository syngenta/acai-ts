"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.requirements = void 0;
exports.requirements = {
    get: {
        requiredAuth: true
    }
};
const get = async (request, response) => {
    response.body = {
        message: 'with-auth route',
        headers: request.headers
    };
    return response;
};
exports.get = get;
//# sourceMappingURL=with-auth.js.map