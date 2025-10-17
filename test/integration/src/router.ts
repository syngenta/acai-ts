import {APIGatewayProxyEvent} from 'aws-lambda';
import {Router} from 'acai-ts';

import {afterAll, beforeAll, loggerCallback, onError, onTimeout, withAuth} from './middleware';

const router = new Router({
    basePath: '/acai-ts-int-test',
    routesPath: 'src/handlers/**/*.ts',
    buildOutputDir: '.build',
    schemaPath: './openapi.yml',
    autoValidate: Boolean(process.env.AUTO_VALIDATE),
    validateResponse: Boolean(process.env.VALIDATE_RESPONSE),
    cache: 'all',
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
