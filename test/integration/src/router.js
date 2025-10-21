"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const node_path_1 = __importDefault(require("node:path"));
const acai_ts_1 = require("acai-ts");
const middleware_1 = require("./middleware");
const toWorkspaceRelative = (targetPath) => node_path_1.default.relative(process.cwd(), targetPath);
const autoValidate = (process.env.AUTO_VALIDATE ?? 'true').toLowerCase() === 'true';
const validateResponse = (process.env.VALIDATE_RESPONSE ?? 'false').toLowerCase() === 'true';
const router = new acai_ts_1.Router({
    basePath: 'int-test',
    routesPath: toWorkspaceRelative(node_path_1.default.join(__dirname, 'handlers')),
    schemaPath: toWorkspaceRelative(node_path_1.default.resolve(__dirname, '../openapi.yml')),
    autoValidate,
    validateResponse,
    cache: 'all',
    cacheSize: 100,
    globalLogger: true,
    timeout: 25,
    beforeAll: middleware_1.beforeAll,
    afterAll: middleware_1.afterAll,
    withAuth: middleware_1.withAuth,
    loggerCallback: middleware_1.loggerCallback,
    onError: middleware_1.onError,
    onTimeout: middleware_1.onTimeout
});
router.autoLoad();
const handler = async (event) => router.route(event);
exports.handler = handler;
//# sourceMappingURL=router.js.map