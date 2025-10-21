"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.requirements = void 0;
exports.requirements = {
    get: {
        timeout: 5
    }
};
const get = async (_request, _response) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { message: 'timeout should have occurred' };
};
exports.get = get;
//# sourceMappingURL=on-timeout.js.map