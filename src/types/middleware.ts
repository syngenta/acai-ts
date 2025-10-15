/**
 * Middleware types for request/response processing
 */

import {IRequest} from './request';
import {IResponse} from './response';

/**
 * Generic middleware function signature
 */
export type Middleware<Req = IRequest, Res = IResponse> = (request: Req, response: Res, requirements?: unknown) => Promise<void> | void;

/**
 * Before middleware - runs before endpoint execution
 */
export type BeforeMiddleware = Middleware;

/**
 * After middleware - runs after endpoint execution
 */
export type AfterMiddleware = Middleware;

/**
 * Auth middleware - runs for authenticated routes
 */
export type AuthMiddleware = Middleware;

/**
 * Error handler middleware
 */
export type ErrorMiddleware<Req = IRequest, Res = IResponse> = (
    request: Req,
    response: Res,
    error: Error
) => Promise<void> | void;

/**
 * Timeout handler middleware
 */
export type TimeoutMiddleware<Req = IRequest, Res = IResponse> = (
    request: Req,
    response: Res,
    error: Error
) => Promise<void> | void;
