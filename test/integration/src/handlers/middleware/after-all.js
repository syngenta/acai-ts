"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.requirements = void 0;
exports.requirements = {
    get: {}
};
const get = async (_request, response) => {
    response.body = {
        message: 'after-all route baseline'
    };
    return response;
};
exports.get = get;
//# sourceMappingURL=after-all.js.map