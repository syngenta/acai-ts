/**
 * Middleware types for request/response processing
 */

import {IRequest} from './request';
import {IResponse} from './response';

// Import concrete classes for middleware signatures
type Request = import('../apigateway/request').Request;
type Response = import('../apigateway/response').Response;

/**
 * Generic middleware function signature
 */
export type Middleware<Req = IRequest, Res = IResponse> = (request: Req, response: Res, requirements?: unknown) => Promise<void> | void;

/**
 * Before middleware - runs before endpoint execution
 */
export type BeforeMiddleware = (request: Request, response: Response, requirements?: unknown) => Promise<void> | void;

/**
 * After middleware - runs after endpoint execution
 */
export type AfterMiddleware = (request: Request, response: Response, requirements?: unknown) => Promise<void> | void;

/**
 * Auth middleware - runs for authenticated routes
 */
export type AuthMiddleware = (request: Request, response: Response, requirements?: unknown) => Promise<void> | void;

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
