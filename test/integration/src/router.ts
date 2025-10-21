import path from 'node:path';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {Router} from 'acai-ts';

import {afterAll, beforeAll, loggerCallback, onError, onTimeout, withAuth} from './middleware';

const toWorkspaceRelative = (targetPath: string): string => path.relative(process.cwd(), targetPath);

const autoValidate = (process.env.AUTO_VALIDATE ?? 'true').toLowerCase() === 'true';
const validateResponse = (process.env.VALIDATE_RESPONSE ?? 'false').toLowerCase() === 'true';

const router = new Router({
  basePath: 'int-test',
  routesPath: toWorkspaceRelative(path.join(__dirname, 'handlers')),
  schemaPath: toWorkspaceRelative(path.resolve(__dirname, '../openapi.yml')),
  autoValidate,
  validateResponse,
  cache: 'all',
  cacheSize: 100,
  globalLogger: true,
  timeout: 25,
  beforeAll,
  afterAll,
  withAuth,
  loggerCallback,
  onError,
  onTimeout
});

router.autoLoad();

export const handler = async (event: APIGatewayProxyEvent) => router.route(event);
