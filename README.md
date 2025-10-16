# 🫐 Acai-TS

**Auto-loading, self-validating, minimalist TypeScript framework for Amazon Web Service Lambdas**

[![CircleCI](https://circleci.com/gh/syngenta/acai-ts.svg?style=shield)](https://circleci.com/gh/syngenta/acai-ts)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=syngenta_acai-ts&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=syngenta_acai-ts)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=syngenta_acai-ts&metric=bugs)](https://sonarcloud.io/summary/new_code?id=syngenta_acai-ts)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=syngenta_acai-ts&metric=coverage)](https://sonarcloud.io/summary/new_code?id=syngenta_acai-ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue)](https://www.typescriptlang.org/)
[![npm package](https://img.shields.io/npm/v/acai-ts?color=blue&label=npm%20package)](https://www.npmjs.com/package/acai-ts)
[![License](https://img.shields.io/badge/license-apache2.0-blue)](LICENSE)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-blue.svg?style=flat)](https://github.com/syngenta/acai-ts/issues)

A DRY, configurable, declarative TypeScript library for working with AWS Lambdas that encourages **Happy Path Programming** — where inputs are validated before processing, eliminating the need for nested try/catch blocks and mid-level exceptions.

## 📖 Documentation

**[Full Documentation](https://syngenta.github.io/acai-ts-docs/)** | **[Examples](https://github.com/syngenta/acai-ts-docs/tree/main/examples)**

For comprehensive guides, API references, and advanced usage patterns, visit our [official documentation site](https://syngenta.github.io/acai-ts-docs/).

---

## 🎯 Why Acai-TS?

Building AWS Lambda functions shouldn't require mountains of boilerplate code. Acai-TS provides:

- **🚀 Zero Boilerplate**: Auto-loading router that maps URLs to handlers automatically
- **✅ Built-in Validation**: OpenAPI schema validation with zero configuration
- **🎨 Decorator Support**: Clean, declarative API using TypeScript decorators
- **🔄 Event Processing**: Simplified DynamoDB, S3, and SQS event handling with type safety
- **📝 Type-Safe**: Full TypeScript support with comprehensive type definitions
- **🧪 Easy Testing**: Lightweight design makes unit testing straightforward
- **⚡ Performance**: Efficient routing and validation with minimal overhead

### Happy Path Programming Philosophy

Acai-TS embraces **Happy Path Programming (HPP)** — a design pattern where validation happens upfront, ensuring your business logic runs on the "happy path" without defensive coding:

```typescript
// ❌ Without Acai-TS: Defensive coding everywhere
export const handler = async (event: any) => {
  try {
    if (!event.body) throw new Error('No body');
    const body = JSON.parse(event.body);
    if (!body.email) throw new Error('Email required');
    if (!isValidEmail(body.email)) throw new Error('Invalid email');
    // Finally, business logic...
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error }) };
  }
};

// ✅ With Acai-TS: Validation handled, focus on logic
@Route('POST', '/users')
@Validate('CreateUserRequest')
export class CreateUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    // Body is already validated - just write business logic!
    const user = await this.userService.create(request.body);
    response.body = user;
    return response;
  }
}
```

---

## 📦 Installation

```bash
npm install acai-ts reflect-metadata
```

### Requirements

- **Node.js**: >= 18.18.2
- **TypeScript**: >= 5.0

> **Note**: `reflect-metadata` is required for decorator support.

---

## 🚀 Quick Start

### API Gateway Handler with Decorators

```typescript
import 'reflect-metadata';
import { Router, Endpoint, Route, Validate, Response, Request } from 'acai-ts';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Define your endpoint with decorators
@Route('POST', '/users')
@Validate('CreateUserSchema')
export class CreateUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    response.body = {
      id: '123',
      email: request.body.email,
      name: request.body.name
    };
    return response;
  }
}

// Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const router = new Router({
    basePath: '/api/v1',
    schemaPath: './openapi.yml', // Optional: OpenAPI validation
    endpoints: [CreateUserEndpoint]
  });

  return await router.route(event);
};
```

### Pattern-Based Routing (Convention over Configuration)

No decorators? No problem! Use file-based routing:

```typescript
import { Router } from 'acai-ts';

export const handler = async (event) => {
  const router = new Router({
    basePath: '/api/v1',
    routesPath: './src/handlers/**/*.ts'  // Smart path - works in dev AND production!
  });

  return await router.route(event);
};

// File: src/handlers/users.controller.ts
export const requirements = {
  post: {
    requiredBody: 'CreateUserRequest'
  }
};

export const post = async (request, response) => {
  response.body = { id: '123', ...request.body };
  return response;
};
```

**Smart Path Detection**: Acai-TS automatically detects and transforms TypeScript source paths to build output paths! Specify `./src/handlers/**/*.ts` and it will automatically find `.build/src/handlers/**/*.js`, `dist/src/handlers/**/*.js`, etc.

The router automatically maps:
- `POST /api/v1/users` → `src/handlers/users.controller.ts` (post function)
- `GET /api/v1/users/{id}` → `src/handlers/users/{id}.controller.ts` (get function)

### Processing DynamoDB Streams

```typescript
import { Event as DynamoDBEvent, DynamoDBRecord } from 'acai-ts';
import { DynamoDBStreamEvent } from 'aws-lambda';

export const handler = async (event: DynamoDBStreamEvent) => {
  const dynamodb = new DynamoDBEvent(event, {
    operations: ['INSERT', 'MODIFY'], // Only process inserts & updates
    globalLogger: true
  });

  for (const record of dynamodb.records) {
    console.log('New item:', record.newImage);
    console.log('Old item:', record.oldImage);
    console.log('Operation:', record.operation); // 'create', 'update', or 'delete'
  }
};
```

### Processing S3 Events

```typescript
import { Event as S3Event } from 'acai-ts';
import { S3Event as AWSS3Event } from 'aws-lambda';

export const handler = async (event: AWSS3Event) => {
  const s3Event = new S3Event(event, {
    getObject: true, // Auto-fetch S3 objects
    isJSON: true,    // Parse as JSON
    requiredBody: 'DataSchema', // Validate against schema
    schemaPath: './schemas/openapi.yml'
  });

  await s3Event.process();

  for (const record of s3Event.records) {
    console.log('Bucket:', record.bucketName);
    console.log('Key:', record.key);
    console.log('Parsed content:', record.body);
  }
};
```

### Processing SQS Messages

```typescript
import { Event as SQSEvent } from 'acai-ts';
import { SQSEvent as AWSSQSEvent } from 'aws-lambda';

export const handler = async (event: AWSSQSEvent) => {
  const sqsEvent = new SQSEvent(event);

  for (const record of sqsEvent.records) {
    // Body is automatically parsed from JSON
    console.log('Message:', record.body);
    console.log('Attributes:', record.messageAttributes);
  }
};
```

---

## 🎨 Decorators

Acai-TS provides powerful decorators for clean, declarative code. Decorators can be used with **both classes and functions**:

### Function-Based Decorators (Recommended)

For a functional programming style, wrap your handler functions with decorators:

```typescript
import 'reflect-metadata';
import { Route, Before, After } from 'acai-ts';

// Before middleware
const authMiddleware = async (request, response) => {
  if (!request.headers.authorization) {
    response.code = 401;
    response.setError('auth', 'Unauthorized');
  }
};

// After middleware
const loggingMiddleware = async (request, response) => {
  console.log(`Response: ${response.code}`);
};

// Function with decorators - use wrapped pattern
export const get = Before(authMiddleware)(
  After(loggingMiddleware)(
    Route('GET', '/users')(async (request, response) => {
      response.body = [{ id: '1', name: 'John' }];
      return response;
    })
  )
);

// POST endpoint with validation
export const post = Route('POST', '/users')(async (request, response) => {
  response.body = { id: '123', ...request.body };
  return response;
});
```

### Class-Based Decorators

For an object-oriented style, use decorators on class methods:

```typescript
import { Route, Endpoint, Before, After, Auth, Timeout } from 'acai-ts';

@Route('POST', '/users')
@Before(authMiddleware)
export class CreateUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    response.body = { id: '123', ...request.body };
    return response;
  }
}
```

### Available Decorators

#### `@Route(method, path)`

Define HTTP routes:

```typescript
// Function style
export const get = Route('GET', '/users/{id}')(async (request, response) => {
  response.body = { id: request.pathParameters.id };
  return response;
});

// Class style
@Route('GET', '/users/{id}')
export class GetUserEndpoint extends Endpoint {
  async handler(request, response) {
    response.body = { id: request.pathParameters.id };
    return response;
  }
}
```

#### `@Before(middleware)`

Run middleware before handler execution:

```typescript
const authCheck = async (request, response) => {
  if (!request.headers['x-api-key']) {
    response.code = 401;
    response.setError('auth', 'API key required');
  }
};

export const get = Before(authCheck)(
  Route('GET', '/protected')(async (request, response) => {
    response.body = { message: 'Authenticated!' };
    return response;
  })
);
```

#### `@After(middleware)`

Run middleware after handler execution:

```typescript
const addTimestamp = async (request, response) => {
  response.body.timestamp = new Date().toISOString();
};

export const get = After(addTimestamp)(
  Route('GET', '/data')(async (request, response) => {
    response.body = { data: 'value' };
    return response;
  })
);
```

#### `@Timeout(milliseconds)`

Set request timeout (use with class-based endpoints):

```typescript
@Route('POST', '/heavy-task')
@Timeout(30000) // 30 seconds
export class HeavyTaskEndpoint extends Endpoint {
  async handler(request, response) {
    await this.processHeavyTask();
    return response;
  }
}
```

#### `@Auth(authFunction)`

Authenticate requests (use with class-based endpoints):

```typescript
@Route('GET', '/profile')
@Auth(async (request) => {
  const token = request.headers.authorization?.split(' ')[1];
  return verifyJWT(token);
})
export class ProfileEndpoint extends Endpoint {
  async handler(request, response) {
    response.body = request.context.user;
    return response;
  }
}
```

---

## 🔧 Advanced Features

### OpenAPI Schema Validation

Validate requests and responses against OpenAPI 3.0 schemas:

```typescript
const router = new Router({
  basePath: '/api/v1',
  schemaPath: './openapi.yml',
  autoValidate: true,        // Validate responses too
  strictValidation: true     // Fail on unknown properties
});
```

### Custom Error Handling

```typescript
import { ApiError } from 'acai-ts';

@Route('GET', '/users/{id}')
export class GetUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    const user = await this.userRepo.findById(request.pathParameters.id);

    if (!user) {
      throw new ApiError('User not found', 404, 'user_id');
    }

    response.body = user;
    return response;
  }
}
```

### Logger Integration

```typescript
import { Logger } from 'acai-ts';

// Global logger setup
Logger.setUpGlobal(true, {
  callback: (level, ...args) => {
    // Custom logging logic (e.g., send to CloudWatch, Datadog, etc.)
  }
});

// Use in your code
Logger.log('Processing request');
Logger.error('Something went wrong');
```

### Event Middleware

Process events with middleware for validation, enrichment, etc:

```typescript
const enrichRecord = async (records) => {
  for (const record of records) {
    record.metadata = await fetchMetadata(record.id);
  }
};

const dynamodb = new DynamoDBEvent(event, {
  before: enrichRecord,
  operations: ['INSERT'],
  requiredBody: 'RecordSchema',
  schemaPath: './schemas/openapi.yml'
});

await dynamodb.process();
```

### Custom Data Classes

Transform records into custom classes:

```typescript
class User {
  id: string;
  email: string;

  constructor(record: any) {
    this.id = record.body.id;
    this.email = record.body.email;
  }

  sendWelcomeEmail() {
    // Custom method
  }
}

const dynamodb = new DynamoDBEvent<User>(event, {
  dataClass: User,
  operations: ['INSERT']
});

await dynamodb.process();

for (const user of dynamodb.records) {
  user.sendWelcomeEmail(); // Type-safe method access!
}
```

---

## 📚 API Reference

### Router

**Constructor Options:**

```typescript
interface RouterConfig {
  basePath?: string;                    // Base path to strip from requests (e.g., '/api/v1')
  schemaPath?: string;                  // Path to OpenAPI schema file
  routesPath: string;                   // Path to handler files with smart build detection
                                        // Examples: './src/handlers/**/*.ts', 'src/handlers'
                                        // Automatically transforms to build output (.js files)
                                        // If no glob pattern (*) detected, '**/*.ts' is auto-appended
  buildOutputDir?: string;              // Build output directory (e.g., '.build', 'dist')
                                        // Optional: Auto-detects common directories if not specified
                                        // Checked in order: .build, build, dist, .dist
  endpoints?: Array<typeof Endpoint>;   // Decorator-based endpoints (class-based)
  autoValidate?: boolean;               // Validate responses (default: false)
  strictValidation?: boolean;           // Strict schema validation (default: false)
  timeout?: number;                     // Default timeout in ms
  outputError?: boolean;                // Output detailed error messages (default: false)
  globalLogger?: boolean;               // Enable global logging (default: false)
  beforeAll?: BeforeMiddleware;         // Global before middleware
  afterAll?: AfterMiddleware;           // Global after middleware
  withAuth?: AuthMiddleware;            // Global auth middleware
  onError?: ErrorMiddleware;            // Global error handler
  onTimeout?: TimeoutMiddleware;        // Global timeout handler
}
```

**Smart Path Detection:**

Acai-TS automatically detects and transforms TypeScript source paths to JavaScript build output:

```typescript
// ✅ Recommended: Use source paths
const router = new Router({
  routesPath: './src/handlers/**/*.ts'
});
// Automatically finds: ./.build/src/handlers/**/*.js (or build/, dist/, .dist/)

// ✅ Explicit build directory
const router = new Router({
  routesPath: './src/handlers/**/*.ts',
  buildOutputDir: '.build'
});
// Uses: ./.build/src/handlers/**/*.js

// ✅ Also works: Direct path to build output
const router = new Router({
  routesPath: '.build/src/handlers/**/*.js'
});
```

### Request

**Properties:**

```typescript
interface Request {
  path: string;                         // Request path
  method: string;                       // HTTP method
  headers: Record<string, string>;      // Request headers
  queryParameters: Record<string, any>; // Query string params
  pathParameters: Record<string, any>;  // Path params (e.g., {id})
  body: any;                           // Parsed request body
  rawBody: string;                     // Raw request body string
  context: any;                        // Custom context (set by middleware)
}
```

### Response

**Properties & Methods:**

```typescript
interface Response {
  body: any;                           // Response body
  code: number;                        // HTTP status code (default: 200)
  headers: Record<string, string>;     // Response headers

  // Methods
  setHeader(key: string, value: string): void;
  setCookie(name: string, value: string, options?: CookieOptions): void;
}
```

### Event Classes

**DynamoDB Event:**

```typescript
interface DynamoDBEventConfig<T> {
  operations?: OperationType[];        // ['create', 'update', 'delete']
  operationError?: boolean;           // Throw error on wrong operation
  before?: (records: any[]) => void;  // Pre-process middleware
  dataClass?: new (record: any) => T; // Transform to custom class
  requiredBody?: string | object;     // Schema validation
  schemaPath?: string;                // Path to OpenAPI schema
  validationError?: boolean;          // Throw on validation error
  globalLogger?: boolean;             // Enable logging
}
```

**S3 Event:**

```typescript
interface S3EventConfig<T> {
  getObject?: boolean;                // Auto-fetch S3 objects
  isJSON?: boolean;                   // Parse as JSON
  isCSV?: boolean;                    // Parse as CSV
  before?: (records: any[]) => void;
  dataClass?: new (record: any) => T;
  requiredBody?: string | object;
  schemaPath?: string;
  validationError?: boolean;
  globalLogger?: boolean;
}
```

**SQS Event:**

```typescript
interface SQSEventConfig<T> {
  before?: (records: any[]) => void;
  dataClass?: new (record: any) => T;
  requiredBody?: string | object;
  schemaPath?: string;
  validationError?: boolean;
  globalLogger?: boolean;
}
```

---

## 🧪 Testing

Run tests with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 🏗️ Project Structure

Recommended project structure for pattern-based routing:

```
my-lambda/
├── src/
│   ├── handlers/
│   │   ├── users/
│   │   │   ├── index.controller.ts       # GET/POST /users
│   │   │   └── {id}.controller.ts        # GET/PUT/DELETE /users/{id}
│   │   └── products.controller.ts         # /products
│   ├── schemas/
│   │   └── openapi.yml
│   └── index.ts                           # Lambda entry point
├── test/
├── tsconfig.json
└── package.json
```

For decorator-based routing:

```
my-lambda/
├── src/
│   ├── endpoints/
│   │   ├── users/
│   │   │   ├── create-user.endpoint.ts
│   │   │   ├── get-user.endpoint.ts
│   │   │   └── update-user.endpoint.ts
│   │   └── index.ts                       # Export all endpoints
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── logging.ts
│   ├── schemas/
│   │   └── openapi.yml
│   └── index.ts                           # Lambda entry point
├── test/
├── tsconfig.json
└── package.json
```

---

## 🔑 Key Concepts

### Happy Path Programming

Happy Path Programming (HPP) is a design philosophy where validation happens **upfront**, ensuring your core business logic operates on the "happy path" without defensive coding:

1. **Validate Early**: All inputs are validated before processing
2. **Fail Fast**: Invalid inputs are rejected immediately with clear errors
3. **Clean Logic**: Business logic doesn't need nested try/catch or null checks
4. **Type Safety**: TypeScript ensures compile-time safety, Acai-TS ensures runtime safety

### DRY Principle

Acai-TS eliminates boilerplate through:
- **Auto-loading**: File-based routing discovers handlers automatically
- **Convention over Configuration**: Sensible defaults reduce config
- **Decorators**: Declarative metadata instead of imperative setup
- **Shared Validation**: Define schemas once, use everywhere

---

## 🆚 Comparison with Other Frameworks

| Feature | Acai-TS | Lambda API | Serverless Express | AWS SDK |
|---------|---------|------------|-------------------|---------|
| TypeScript-First | ✅ | ❌ | ❌ | ✅ |
| Decorator Support | ✅ | ❌ | ❌ | ❌ |
| Auto-loading Router | ✅ | ✅ | ❌ | ❌ |
| OpenAPI Validation | ✅ | ❌ | ❌ | ❌ |
| Event Processing (DDB/S3/SQS) | ✅ | ❌ | ❌ | ✅ |
| Happy Path Programming | ✅ | ❌ | ❌ | ❌ |
| Zero Boilerplate | ✅ | ✅ | ❌ | ❌ |
| Minimal Dependencies | ✅ | ✅ | ❌ | ✅ |

---

## 🔧 Troubleshooting

### Build Path Not Found Error

**Error Message:**
```
BuildPathNotFoundError: Build output path not found for "./src/handlers/**/*.ts".
Attempted paths: ./.build/src/handlers/**/*.js, ./build/src/handlers/**/*.js,
./dist/src/handlers/**/*.js, ./.dist/src/handlers/**/*.js
```

**Cause:** Acai-TS cannot find compiled JavaScript files in any of the common build directories.

**Solutions:**

1. **Verify your build output exists:**
   ```bash
   # Check if your build directory exists
   ls -la .build/  # or dist/, build/, .dist/
   ```

2. **Specify explicit build directory:**
   ```typescript
   const router = new Router({
     routesPath: './src/handlers/**/*.ts',
     buildOutputDir: 'dist'  // or '.build', 'build', etc.
   });
   ```

3. **Use direct path to compiled files:**
   ```typescript
   const router = new Router({
     routesPath: './dist/src/handlers/**/*.js'
   });
   ```

4. **Ensure TypeScript is compiling correctly:**
   ```bash
   npm run build
   ls -la .build/src/handlers/  # Verify .js files exist
   ```

### Decorator Type Errors

**Error Message:**
```
Decorators are not valid here
```

**Cause:** Using `@` decorator syntax on exported const declarations.

**Solution:** Use the wrapped function pattern:

```typescript
// ❌ Wrong: @ syntax on const
@Route('GET', '/users')
export const get = async (request, response) => { ... };

// ✅ Correct: Wrapped pattern
export const get = Route('GET', '/users')(async (request, response) => {
  // handler code
});
```

### Endpoint Not Found (404)

**Problem:** Router returns 404 for existing handlers.

**Checks:**

1. **Verify file naming convention:**
   ```
   ✅ users.controller.ts    → /users
   ✅ users/{id}.controller.ts → /users/{id}
   ❌ usersController.ts     → Won't match
   ```

2. **Check basePath configuration:**
   ```typescript
   // If basePath is '/api/v1'
   // Request: GET /api/v1/users
   // Maps to: src/handlers/users.controller.ts

   const router = new Router({
     basePath: '/api/v1',  // Must match your API Gateway stage/path
     routesPath: './src/handlers/**/*.ts'
   });
   ```

3. **Verify exported method names:**
   ```typescript
   // File: users.controller.ts
   export const get = async (request, response) => { ... };   // ✅ GET /users
   export const post = async (request, response) => { ... };  // ✅ POST /users
   export const Get = async (request, response) => { ... };   // ❌ Case-sensitive!
   ```

### TypeScript Compilation Issues

**Problem:** TypeScript files in development but `.js` files not found in production.

**Solution:**

Ensure your build process compiles TypeScript before deployment:

```json
// package.json
{
  "scripts": {
    "build": "tsc",
    "prepack": "npm run build",
    "deploy": "npm run build && serverless deploy"
  }
}
```

### Runtime Module Not Found

**Error:** `Cannot find module 'acai-ts'`

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install acai-ts reflect-metadata
   ```

2. **For serverless deployments, ensure `node_modules` is included:**
   ```yaml
   # serverless.yml
   package:
     patterns:
       - '!node_modules/**'
       - 'node_modules/acai-ts/**'
       - 'node_modules/reflect-metadata/**'
   ```

### Validation Always Failing

**Problem:** Schema validation fails even with correct data.

**Checks:**

1. **Verify schema path:**
   ```typescript
   const router = new Router({
     schemaPath: './openapi.yml',  // Relative to execution directory
     autoValidate: true
   });
   ```

2. **Check schema references match:**
   ```typescript
   // In handler
   export const requirements = {
     post: {
       requiredBody: 'CreateUserRequest'  // Must match schema name exactly
     }
   };
   ```

3. **Validate your OpenAPI schema:**
   ```bash
   # Use a validator
   npx @apidevtools/swagger-cli validate openapi.yml
   ```

### Middleware Not Executing

**Problem:** Before/After middleware doesn't run.

**Solutions:**

1. **For function decorators, ensure proper wrapping order:**
   ```typescript
   // ✅ Correct order: outer decorators run first
   export const get = Before(auth)(
     After(logging)(
       Route('GET', '/users')(handler)
     )
   );

   // Execution order: Before → Route → Handler → After
   ```

2. **For class decorators, ensure they're above the class:**
   ```typescript
   // ✅ Correct
   @Route('POST', '/users')
   @Before(authMiddleware)
   export class CreateUserEndpoint extends Endpoint { ... }

   // ❌ Wrong order
   @Before(authMiddleware)
   @Route('POST', '/users')  // Route should be first
   export class CreateUserEndpoint extends Endpoint { ... }
   ```

3. **Verify middleware signature:**
   ```typescript
   // ✅ Correct signature
   const middleware = async (request, response) => {
     // Your logic
   };

   // ❌ Wrong - missing parameters
   const middleware = async () => { ... };
   ```

### Performance Issues

**Problem:** Slow response times or high memory usage.

**Optimizations:**

1. **Enable caching:**
   ```typescript
   const router = new Router({
     routesPath: './src/handlers/**/*.ts',
     cache: 'all'  // Cache route resolutions
   });
   ```

2. **Reduce handler file scanning:**
   ```typescript
   // ✅ Specific pattern
   routesPath: './src/handlers/users/**/*.ts'

   // ❌ Too broad
   routesPath: './src/**/*.ts'
   ```

3. **Use lazy loading for heavy dependencies:**
   ```typescript
   // Inside handler, not at module level
   export const post = async (request, response) => {
     const heavyLib = await import('heavy-library');
     // Use heavyLib
   };
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/acai-ts.git
cd acai-ts

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📄 License

Apache 2.0 © [Paul Cruse III](https://github.com/paulcruse3)

---

## 🙏 Acknowledgments

Acai-TS is the TypeScript evolution of [acai-js](https://github.com/syngenta/acai-js), originally developed by Syngenta. Special thanks to the original contributors for establishing the Happy Path Programming philosophy and building the foundation this library builds upon.

---

## 💬 Support & Community

- **📖 Documentation**: [https://syngenta.github.io/acai-ts-docs/](https://syngenta.github.io/acai-ts-docs/)
- **💻 Examples**: [https://github.com/syngenta/acai-ts-docs/tree/main/examples](https://github.com/syngenta/acai-ts-docs/tree/main/examples)
- **🐛 Issues**: [GitHub Issues](https://github.com/syngenta/acai-ts/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/syngenta/acai-ts/discussions)

---

Made with 💙 by developers who believe AWS Lambda development should be enjoyable.
