import {HttpStatusCode, Response} from 'acai-ts';

export type JsonRecord = Record<string, unknown>;

/**
 * Ensure the provided value is a shallow-cloned JSON record.
 */
export const ensureRecord = (value: unknown): JsonRecord => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return {...(value as JsonRecord)};
    }
    return {};
};

/**
 * Set a JSON body on the given response and optionally override the status code.
 */
export const setJsonBody = <TBody extends JsonRecord>(
    response: Response<JsonRecord>,
    body: TBody,
    status: HttpStatusCode = 200
): Response<JsonRecord> => {
    response.code = status;
    response.body = body;
    return response;
};

/**
 * Merge additional fields into the existing JSON body.
 */
export const mergeJsonBody = (response: Response<JsonRecord>, fragment: JsonRecord): Response<JsonRecord> => {
    const current = ensureRecord(response.rawBody);
    response.body = {...current, ...fragment};
    return response;
};

/**
 * Convenience helper for returning an error response with a keyed message.
 */
export const setErrorBody = (
    response: Response<JsonRecord>,
    status: HttpStatusCode,
    key: string,
    message: string
): Response<JsonRecord> => {
    response.code = status;
    response.setError(key, message);
    return response;
};
