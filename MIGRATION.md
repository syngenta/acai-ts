# Migration Guide: acai-js to acai-ts

This guide helps you migrate from acai-js to acai-ts, the TypeScript-native rewrite of the acai library.

**📖 For the complete migration guide, visit: [https://syngenta.github.io/acai-ts-docs/changes/](https://syngenta.github.io/acai-ts-docs/changes/)**

## Overview

acai-ts is a complete TypeScript rewrite of acai-js that provides:
- Full TypeScript support with comprehensive type definitions
- Both CommonJS and ES Module compatibility
- Decorator support for cleaner, more declarative code
- Improved API with better type safety
- Enhanced validation and error handling
- All the DRY, configurable, and declarative features you love from acai-js

## Installation

### Uninstall acai-js
```bash
npm uninstall acai-js
```

### Install acai-ts
```bash
npm install acai-ts
```

**Important:** Ensure your project uses TypeScript 5.0+ and Node.js 18.18.2+.

## Breaking Changes

### 1. Import Paths

**acai-js:**
```javascript
const acai = require('acai-js');
const Router = acai.apigateway.Router;
const Logger = acai.logger.Logger;
```

**acai-ts (CommonJS):**
```typescript
import { Router, Logger } from 'acai-ts';
// Or for backward compatibility:
import { apigateway, logger } from 'acai-ts';
const Router = apigateway.Router;
const Logger = logger.Logger;
```

**acai-ts (ES Modules):**
```typescript
import { Router, Logger } from 'acai-ts';
```

### 2. TypeScript Configuration Required

acai-ts requires TypeScript with decorator support. Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

### 3. Router Configuration Changes

**acai-js:**
```javascript
const router = new Router({
  base: '/api',
  inputType: 'json',
  outputType: 'json'
});
```

**acai-ts:**
```typescript
const router = new Router({
  mode: 'pattern',           // 'pattern' | 'directory' | 'list'
  routesPath: './routes',
  schemaPath: './schema.yaml',
  autoValidate: true,
  timeout: 30000,
  outputError: true
});
```

Key changes:
- `base`, `inputType`, `outputType` removed (use OpenAPI schema instead)
- New `mode` property for routing strategy
- Explicit `routesPath` and `schemaPath`
- Built-in validation with `autoValidate`

### 4. Logger Configuration Changes

**acai-js:**
```javascript
const logger = new Logger({
  logLevel: 'info',
  globalLogger: true
});
```

**acai-ts:**
```typescript
const logger = new Logger({
  minLevel: 'info',          // Changed from 'logLevel' to 'minLevel'
  callback: (log) => {       // Optional custom handler
    console.log(log);
  }
});
```

### 5. Route Handler Signatures

**acai-js:**
```javascript
module.exports.handler = async (request, response) => {
  const data = request.body;
  response.setBody({ success: true });
};
```

**acai-ts:**
```typescript
import { Request, Response } from 'acai-ts';

export const handler = async (request: Request, response: Response): Promise<void> => {
  const data = request.body;
  response.setBody({ success: true });
};
```

### 6. Decorators (New Feature)

acai-ts introduces decorators for cleaner route definitions:

**Without decorators (still supported):**
```typescript
export const handler = async (request: Request, response: Response) => {
  // Handler logic
};
```

**With decorators:**
```typescript
import { Route, Validate, Auth, Timeout } from 'acai-ts';

export class UserController {
  @Route('POST', '/users')
  @Validate({
    body: {
      type: 'object',
      required: ['email', 'name']
    }
  })
  @Auth(async (request) => {
    // Custom auth logic
    return request.headers['authorization'] === 'Bearer token';
  })
  @Timeout(5000)
  async createUser(request: Request, response: Response) {
    const user = await createUser(request.body);
    response.setBody(user);
  }
}
```

## Feature Mapping

### Router

| acai-js | acai-ts | Notes |
|---------|---------|-------|
| `Router.route()` | `Router.route()` | Same API, improved types |
| `Router.autoLoad()` | `Router.autoLoad()` | Now supports multiple routing modes |
| N/A | `Router.beforeAll()` | New: global before middleware |
| N/A | `Router.afterAll()` | New: global after middleware |

### Request

| acai-js | acai-ts | Notes |
|---------|---------|-------|
| `request.body` | `request.body` | Same |
| `request.params` | `request.params` | Same |
| `request.query` | `request.query` | Same |
| `request.headers` | `request.headers` | Same |
| `request.method` | `request.method` | Same |
| `request.path` | `request.path` | Same |
| N/A | `request.auth` | New: parsed auth context |

### Response

| acai-js | acai-ts | Notes |
|---------|---------|-------|
| `response.setBody()` | `response.setBody()` | Same |
| `response.setStatus()` | `response.setStatus()` | Same |
| `response.setHeader()` | `response.setHeader()` | Same |
| N/A | `response.setError()` | New: structured error responses |

### Logger

| acai-js | acai-ts | Notes |
|---------|---------|-------|
| `Logger.info()` | `Logger.info()` | Same |
| `Logger.debug()` | `Logger.debug()` | Same |
| `Logger.warn()` | `Logger.warn()` | Same |
| `Logger.error()` | `Logger.error()` | Same |
| `Logger.setup()` | `Logger.setUpGlobal()` | Renamed |

### Events (DynamoDB, S3, SQS)

| acai-js | acai-ts | Notes |
|---------|---------|-------|
| `Event` class | `Event` class | Same API, better types |
| `Record` class | `Record` class | Separate imports for each service |

## Step-by-Step Migration

### Step 1: Update Dependencies

```bash
npm uninstall acai-js
npm install acai-ts
npm install --save-dev typescript @types/node
```

### Step 2: Configure TypeScript

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Rename Files

Rename all `.js` files to `.ts`:

```bash
find src -name "*.js" -exec sh -c 'mv "$0" "${0%.js}.ts"' {} \;
```

### Step 4: Update Imports

**Before:**
```javascript
const acai = require('acai-js');
const Router = acai.apigateway.Router;
```

**After:**
```typescript
import { Router } from 'acai-ts';
```

### Step 5: Update Router Configuration

**Before:**
```javascript
const router = new Router({
  base: '/api/v1',
  inputType: 'json',
  outputType: 'json'
});
```

**After:**
```typescript
const router = new Router({
  mode: 'pattern',
  routesPath: './routes',
  schemaPath: './openapi.yaml',
  autoValidate: true
});
```

### Step 6: Update Logger Configuration

**Before:**
```javascript
const logger = new Logger({
  logLevel: 'info',
  globalLogger: true
});
```

**After:**
```typescript
const logger = new Logger({
  minLevel: 'info'
});
Logger.setUpGlobal(); // If you need global logger
```

### Step 7: Add Type Annotations

Add types to your route handlers:

```typescript
import { Request, Response } from 'acai-ts';

export const handler = async (
  request: Request,
  response: Response
): Promise<void> => {
  // Your logic here
};
```

### Step 8: (Optional) Adopt Decorators

For new routes or major refactors, consider using decorators:

```typescript
import { Route, Validate, Timeout } from 'acai-ts';

export class MyController {
  @Route('GET', '/users/:id')
  @Timeout(5000)
  async getUser(request: Request, response: Response) {
    // Your logic here
  }
}
```

### Step 9: Update OpenAPI Schema

If you're using validation, ensure your OpenAPI schema is compatible with JSON Schema 2020-12 (used by acai-ts).

### Step 10: Test Thoroughly

```bash
npm run build
npm test
```

## Common Migration Issues

### Issue: Module not found errors

**Problem:** `Cannot find module 'acai-ts'`

**Solution:** Ensure you've installed acai-ts and TypeScript is properly configured with `moduleResolution: "node"`.

### Issue: Decorator errors

**Problem:** `Decorators are not valid here`

**Solution:** Enable decorators in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Issue: Type errors in route handlers

**Problem:** `Type 'Request' is not assignable to type 'any'`

**Solution:** Import types from acai-ts:
```typescript
import type { IRequest, IResponse } from 'acai-ts';
```

### Issue: Logger not working

**Problem:** Logger configuration changed

**Solution:** Update from `logLevel` to `minLevel`:
```typescript
const logger = new Logger({ minLevel: 'info' });
```

## Benefits of Migration

After migrating to acai-ts, you'll gain:

1. **Type Safety:** Catch errors at compile time instead of runtime
2. **Better IDE Support:** IntelliSense, autocomplete, and inline documentation
3. **Decorators:** Cleaner, more declarative route definitions
4. **Modern JavaScript:** Use async/await, optional chaining, and other ES2020+ features
5. **Dual Module Support:** Works with both CommonJS and ES Modules
6. **Improved Validation:** Better schema validation with JSON Schema 2020-12
7. **Enhanced Error Handling:** Structured error responses and better stack traces

## Need Help?

- **📖 Documentation:** [https://syngenta.github.io/acai-ts-docs/](https://syngenta.github.io/acai-ts-docs/)
- **💻 Examples:** [https://github.com/syngenta/acai-ts-docs/tree/main/examples](https://github.com/syngenta/acai-ts-docs/tree/main/examples)
- **🐛 Issues:** [GitHub Issues](https://github.com/syngenta/acai-ts/issues)

## Backward Compatibility

acai-ts maintains backward compatibility through namespace exports:

```typescript
import { apigateway, logger, dynamodb, s3, sqs } from 'acai-ts';

// These work just like acai-js:
const router = new apigateway.Router();
const loggerInstance = new logger.Logger();
```

This allows for gradual migration without breaking existing code.
