"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setErrorBody = exports.mergeJsonBody = exports.setJsonBody = exports.ensureRecord = void 0;
/**
 * Ensure the provided value is a shallow-cloned JSON record.
 */
const ensureRecord = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return { ...value };
    }
    return {};
};
exports.ensureRecord = ensureRecord;
/**
 * Set a JSON body on the given response and optionally override the status code.
 */
const setJsonBody = (response, body, status = 200) => {
    response.code = status;
    response.body = body;
    return response;
};
exports.setJsonBody = setJsonBody;
/**
 * Merge additional fields into the existing JSON body.
 */
const mergeJsonBody = (response, fragment) => {
    const current = (0, exports.ensureRecord)(response.rawBody);
    response.body = { ...current, ...fragment };
    return response;
};
exports.mergeJsonBody = mergeJsonBody;
/**
 * Convenience helper for returning an error response with a keyed message.
 */
const setErrorBody = (response, status, key, message) => {
    response.code = status;
    response.setError(key, message);
    return response;
};
exports.setErrorBody = setErrorBody;
//# sourceMappingURL=response.js.map