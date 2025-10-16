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
export class CreateUserEndpoint extends BaseEndpoint {
  @Validate({ requiredBody: 'CreateUserRequest' })
  async post(request: Request, response: Response): Promise<Response> {
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

### API Gateway Handler with Class-Based Decorators

```typescript
import 'reflect-metadata';
import { Router, BaseEndpoint, Before, After, Timeout, Validate, Response, Request } from 'acai-ts';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// File: src/handlers/users.ts
// The router maps this file to /users based on file structure

// Define middleware
const authMiddleware = async (request: Request, response: Response) => {
  if (!request.headers.authorization) {
    response.code = 401;
    response.setError('auth', 'Unauthorized');
  }
};

// Define your endpoint class with method decorators
export class UsersEndpoint extends BaseEndpoint {
  @Before(authMiddleware)
  @Validate({ requiredBody: 'CreateUserSchema' })
  @Timeout(5000)
  async post(request: Request, response: Response): Promise<Response> {
    // Create user logic
    response.body = {
      id: '123',
      email: request.body.email,
      name: request.body.name
    };
    return response;
  }

  @Before(authMiddleware)
  async get(request: Request, response: Response): Promise<Response> {
    // Get users logic
    response.body = { users: [] };
    return response;
  }
}

// Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const router = new Router({
    basePath: '/api/v1',
    routesPath: './src/handlers/**/*.ts',
    schemaPath: './openapi.yml' // Optional: OpenAPI validation
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
import {Event} from 'acai-ts/dynamodb';
import {DynamoDBStreamEvent} from 'aws-lambda';

export const handler = async (event: DynamoDBStreamEvent) => {
  // Basic pattern - synchronous access
  const ddbEvent = new Event(event, {
    operations: ['create', 'update'], // Filter by operation type
    globalLogger: true
  });

  // Direct access to records (no middleware)
  for (const record of ddbEvent.records) {
    console.log('New item:', record.body);        // New image
    console.log('Old item:', record.oldBody);     // Old image (updates/deletes)
    console.log('Operation:', record.operation);  // 'create', 'update', or 'delete'
    console.log('Keys:', record.keys);
  }
};
```

### Processing S3 Events

```typescript
import {Event} from 'acai-ts/s3';
import {S3Event} from 'aws-lambda';

export const handler = async (event: S3Event) => {
  const s3Event = new Event(event, {
    getObject: true,  // Auto-fetch S3 objects
    isJSON: true,     // Parse as JSON
    requiredBody: 'DataSchema', // Validate against schema
    schemaPath: './schemas/openapi.yml',
    operations: ['create'] // Only process ObjectCreated events
  });

  // Must use process() when using getObject, validation, or middleware
  await s3Event.process();

  for (const record of s3Event.records) {
    console.log('Bucket:', record.bucket);  // Bucket object with name, arn, etc
    console.log('Key:', record.key);
    console.log('Parsed content:', record.body);
    console.log('Operation:', record.operation); // 'create' or 'delete'
  }
};
```

### Processing SQS Messages

```typescript
import {Event} from 'acai-ts/sqs';
import {SQSEvent} from 'aws-lambda';

export const handler = async (event: SQSEvent) => {
  const sqsEvent = new Event(event, {
    globalLogger: true
  });

  // Direct access to records (body is automatically parsed if JSON)
  for (const record of sqsEvent.records) {
    console.log('Message ID:', record.messageId);
    console.log('Body:', record.body);
    console.log('Attributes:', record.attributes);
    console.log('Receipt Handle:', record.receiptHandle);
  }
};
```

---

## 📡 Event Processing Patterns

Acai-TS provides a unified `Event` class for processing DynamoDB Streams, S3 Events, and SQS Messages. Import from submodules for better tree-shaking:

```typescript
import {Event} from 'acai-ts/dynamodb';  // DynamoDB Streams
import {Event} from 'acai-ts/sqs';       // SQS Messages
import {Event} from 'acai-ts/s3';        // S3 Events
```

### Pattern 1: Basic (Synchronous)

For simple processing without middleware or validation:

```typescript
import {Event} from 'acai-ts/dynamodb';
import {DynamoDBStreamEvent} from 'aws-lambda';

export const handler = async (event: DynamoDBStreamEvent) => {
  // No middleware - direct synchronous access
  const ddbEvent = new Event(event, {
    operations: ['create', 'update']  // Optional filtering
  });

  // Synchronous access - no await needed
  const records = ddbEvent.records;

  for (const record of records) {
    console.log(record.body);
  }
};
```

### Pattern 2: Middleware (Asynchronous)

For pre-processing, validation, or operation filtering with middleware:

```typescript
import {Event} from 'acai-ts/dynamodb';
import {DynamoDBStreamEvent} from 'aws-lambda';

export const handler = async (event: DynamoDBStreamEvent) => {
  const ddbEvent = new Event(event, {
    // Before middleware runs before processing
    before: async (records: any[]) => {
      console.log(`Received ${records.length} records`);
      // Can transform or enrich records here
    },

    // Filter by operation type
    operations: ['create'],

    // Schema validation
    requiredBody: 'RecordSchema',
    schemaPath: './schemas/openapi.yml'
  });

  // Must call process() when using middleware, validation, or getObject
  await ddbEvent.process();

  // Then access records
  const records = ddbEvent.records;

  for (const record of records) {
    // Records are validated and filtered
    console.log(record.body);
  }
};
```

### Pattern 3: Function Wrappers (Event Handler "Decorators")

> **⚠️ Important**: The `@Before`/`@After` decorators from acai-ts are for **Router/API Gateway endpoints only**. For event handlers, use function wrapper patterns:

```typescript
import {Event} from 'acai-ts/sqs';
import {SQSEvent} from 'aws-lambda';

// Define handler type
type HandlerFunction = (event: SQSEvent) => Promise<any>;

// Create wrapper functions (like decorators)
function withLogging(handler: HandlerFunction): HandlerFunction {
  return async (event: SQSEvent) => {
    console.log('START: Processing event');
    const result = await handler(event);
    console.log('END: Processing complete');
    return result;
  };
}

function withValidation(handler: HandlerFunction): HandlerFunction {
  return async (event: SQSEvent) => {
    if (!event.Records || event.Records.length === 0) {
      throw new Error('No records to process');
    }
    return await handler(event);
  };
}

// Core handler logic
async function processMessages(event: SQSEvent) {
  const sqsEvent = new Event(event, {});

  for (const record of sqsEvent.records) {
    console.log('Message:', record.body);
  }

  return { statusCode: 200 };
}

// Apply wrappers (execute in order: validation → logging → handler)
export const handler = withLogging(
  withValidation(
    processMessages
  )
);
```

### Complete Examples by Event Type

#### DynamoDB Streams

```typescript
import {Event} from 'acai-ts/dynamodb';
import {DynamoDBStreamEvent} from 'aws-lambda';

export const handler = async (event: DynamoDBStreamEvent) => {
  const ddbEvent = new Event(event, {
    operations: ['create', 'update'],  // Filter operations
    before: async (records: any[]) => {
      console.log(`Processing ${records.length} records`);
    }
  });

  await ddbEvent.process();

  for (const record of ddbEvent.records) {
    console.log('Keys:', record.keys);
    console.log('New data:', record.body);        // NewImage
    console.log('Old data:', record.oldBody);     // OldImage (for updates/deletes)
    console.log('Operation:', record.operation);   // 'create', 'update', 'delete'
    console.log('Event ID:', record.id);
    console.log('Event name:', record.name);       // 'INSERT', 'MODIFY', 'REMOVE'
    console.log('Source ARN:', record.sourceARN);
  }

  return { statusCode: 200 };
};
```

**Available Operations:**
- `'create'` - Maps to DynamoDB INSERT events
- `'update'` - Maps to DynamoDB MODIFY events
- `'delete'` - Maps to DynamoDB REMOVE events

#### SQS Messages

```typescript
import {Event} from 'acai-ts/sqs';
import {SQSEvent} from 'aws-lambda';

export const handler = async (event: SQSEvent) => {
  const sqsEvent = new Event(event, {
    before: async (records: any[]) => {
      console.log(`Processing ${records.length} messages`);
    }
  });

  await sqsEvent.process();

  for (const record of sqsEvent.records) {
    console.log('Message ID:', record.messageId);
    console.log('Body:', record.body);              // Auto-parsed if JSON
    console.log('Attributes:', record.attributes);   // Message attributes
    console.log('Receipt:', record.receiptHandle);
    console.log('Source:', record.source);           // 'aws:sqs'
  }

  return { statusCode: 200 };
};
```

**Batch Processing:**
```typescript
// SQS can send up to 10 messages per invocation
const sqsEvent = new Event(event, {});
console.log(`Batch size: ${sqsEvent.records.length}`); // Up to 10
```

#### S3 Events

```typescript
import {Event} from 'acai-ts/s3';
import {S3Event} from 'aws-lambda';

export const handler = async (event: S3Event) => {
  const s3Event = new Event(event, {
    operations: ['create'],      // Only ObjectCreated events
    getObject: true,              // Fetch S3 object content
    isJSON: true,                 // Parse as JSON
    before: async (records: any[]) => {
      console.log(`Processing ${records.length} S3 events`);
    }
  });

  await s3Event.process();  // Required when using getObject

  for (const record of s3Event.records) {
    console.log('Bucket:', record.bucket);         // Bucket object with name, arn
    console.log('Key:', record.key);
    console.log('Event:', record.eventName);       // 'ObjectCreated:Put', etc.
    console.log('Operation:', record.operation);   // 'create' or 'delete'
    console.log('Size:', record.size);
    console.log('Content:', record.body);          // Parsed JSON content
  }

  return { statusCode: 200 };
};
```

**Available Operations:**
- `'create'` - Maps to ObjectCreated:* events (Put, Post, Copy, CompleteMultipartUpload)
- `'delete'` - Maps to ObjectRemoved:* events (Delete, DeleteMarkerCreated)

**S3 Object Fetching:**
```typescript
// Without getObject - just event metadata
const s3Event = new Event(event, {});
record.body;  // undefined

// With getObject - fetches object content
const s3Event = new Event(event, { getObject: true });
await s3Event.process();
record.body;  // Buffer or string

// With JSON parsing
const s3Event = new Event(event, { getObject: true, isJSON: true });
await s3Event.process();
record.body;  // Parsed object

// With CSV parsing
const s3Event = new Event(event, { getObject: true, isCSV: true });
await s3Event.process();
record.body;  // Array of parsed rows
```

### Custom Data Classes

Transform records into custom classes with type-safe methods:

```typescript
import {Event} from 'acai-ts/dynamodb';

class UserRecord {
  id: string;
  email: string;
  name: string;

  constructor(record: any) {
    this.id = record.body.id;
    this.email = record.body.email;
    this.name = record.body.name;
  }

  sendWelcomeEmail() {
    console.log(`Sending email to ${this.email}`);
    // Email sending logic
  }

  validate() {
    return this.email.includes('@');
  }
}

export const handler = async (event: DynamoDBStreamEvent) => {
  const ddbEvent = new Event<UserRecord>(event, {
    dataClass: UserRecord,
    operations: ['create']
  });

  await ddbEvent.process();

  for (const user of ddbEvent.records) {
    // TypeScript knows these are UserRecord instances
    if (user.validate()) {
      user.sendWelcomeEmail();  // Type-safe method access!
    }
  }
};
```

### Sync vs Async Access

**When to use synchronous access (`.records`):**
- No middleware configured
- No validation needed
- No S3 `getObject` needed
- Simple operation filtering only

**When to use asynchronous access (`await .process()` then `.records`):**
- Using `before` middleware
- Schema validation with `requiredBody`
- S3 object fetching with `getObject`
- Any advanced processing

```typescript
// ✅ Sync - OK
const event = new Event(rawEvent, { operations: ['create'] });
const records = event.records;

// ❌ Sync - ERROR: Must use process()
const event = new Event(rawEvent, {
  before: async (r) => console.log(r.length)
});
const records = event.records;  // Error thrown!

// ✅ Async - Correct
const event = new Event(rawEvent, {
  before: async (r) => console.log(r.length)
});
await event.process();
const records = event.records;  // Works!
```

---

## 🎨 Decorators

Acai-TS provides powerful method decorators for clean, declarative API Gateway endpoints using the class-based pattern.

> **⚠️ Important**: The `@Before`, `@After`, `@Timeout`, and `@Validate` decorators are for **Router/API Gateway endpoints only** and work on **class methods** (not classes or standalone functions).
>
> For **event handlers** (DynamoDB, S3, SQS), these decorators will not work. Instead, use:
> - **Function wrapper patterns** (see Event Processing Patterns section)
> - **Configuration options** like `before` in the Event constructor
>
> See the [Event Processing Patterns](#-event-processing-patterns) section for event handler examples.

### Two Patterns for API Gateway Endpoints

Acai-TS supports two patterns for defining API Gateway endpoints:

#### Pattern 1: Requirements Object (Simple)

Best for simple endpoints with basic validation:

```typescript
// File: src/handlers/users.ts
export const requirements = {
  get: {
    before: [authMiddleware],
    requiredHeaders: ['x-api-key']
  },
  post: {
    requiredBody: 'CreateUserRequest'
  }
};

export const get = async (request: Request, response: Response) => {
  response.body = { users: [] };
  return response;
};

export const post = async (request: Request, response: Response) => {
  response.body = { id: '123', ...request.body };
  return response;
};
```

#### Pattern 2: Class-Based Decorators (Advanced)

Best for complex endpoints with multiple methods and middleware:

```typescript
// File: src/handlers/users.ts
import { BaseEndpoint, Before, After, Timeout, Validate } from 'acai-ts';

export class UsersEndpoint extends BaseEndpoint {
  @Before(authMiddleware)
  @Validate({ requiredHeaders: ['x-api-key'] })
  async get(request: Request, response: Response): Promise<Response> {
    response.body = { users: [] };
    return response;
  }

  @Before(authMiddleware)
  @Validate({ requiredBody: 'CreateUserRequest' })
  @Timeout(5000)
  async post(request: Request, response: Response): Promise<Response> {
    response.body = { id: '123', ...request.body };
    return response;
  }

  @Before(authMiddleware)
  async put(request: Request, response: Response): Promise<Response> {
    response.body = { updated: true };
    return response;
  }
}
```

### Available Decorators

All decorators are applied to **class methods** (get, post, put, patch, delete) in classes that extend `BaseEndpoint`.

#### `@Before(middleware1, middleware2, ...)`

Run middleware before method execution. Multiple middlewares execute in order:

```typescript
const authCheck = async (request: Request, response: Response) => {
  if (!request.headers['x-api-key']) {
    response.code = 401;
    response.setError('auth', 'API key required');
  }
};

const rateLimiter = async (request: Request, response: Response) => {
  // Rate limiting logic
};

export class ProtectedEndpoint extends BaseEndpoint {
  @Before(rateLimiter, authCheck)  // Executes: rateLimiter → authCheck → get()
  async get(request: Request, response: Response): Promise<Response> {
    response.body = { message: 'Authenticated and rate-limited!' };
    return response;
  }
}
```

#### `@After(middleware1, middleware2, ...)`

Run middleware after method execution. Multiple middlewares execute in order:

```typescript
const addTimestamp = async (request: Request, response: Response) => {
  response.body.timestamp = new Date().toISOString();
};

const addVersion = async (request: Request, response: Response) => {
  response.body.version = '1.0';
};

export class DataEndpoint extends BaseEndpoint {
  @After(addTimestamp, addVersion)  // Executes: get() → addTimestamp → addVersion
  async get(request: Request, response: Response): Promise<Response> {
    response.body = { data: 'value' };
    return response;
  }
}
```

#### `@Timeout(milliseconds)`

Set request timeout for the method:

```typescript
export class HeavyTaskEndpoint extends BaseEndpoint {
  @Timeout(30000)  // 30 seconds
  async post(request: Request, response: Response): Promise<Response> {
    await this.processHeavyTask();
    response.body = { completed: true };
    return response;
  }
}
```

#### `@Validate(validationConfig)`

Validate request data against schemas or requirements:

```typescript
export class UsersEndpoint extends BaseEndpoint {
  // Validate using OpenAPI schema
  @Validate({ requiredBody: 'CreateUserRequest' })
  async post(request: Request, response: Response): Promise<Response> {
    response.body = { id: '123', ...request.body };
    return response;
  }

  // Validate headers
  @Validate({ requiredHeaders: ['x-api-key', 'authorization'] })
  async get(request: Request, response: Response): Promise<Response> {
    response.body = { users: [] };
    return response;
  }

  // Validate query parameters
  @Validate({ requiredQuery: ['page', 'limit'] })
  async get(request: Request, response: Response): Promise<Response> {
    const page = parseInt(request.queryParameters.page);
    response.body = { page, users: [] };
    return response;
  }

  // Validate using JSON schema
  @Validate({
    body: {
      type: 'object',
      required: ['email', 'name'],
      properties: {
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 2 }
      }
    }
  })
  async post(request: Request, response: Response): Promise<Response> {
    response.body = { id: '123', ...request.body };
    return response;
  }
}
```

### Combining Decorators

Stack multiple decorators on a single method. They execute in a specific order:

```typescript
export class UsersEndpoint extends BaseEndpoint {
  @Before(authMiddleware, rateLimiter)  // Runs first
  @Validate({ requiredBody: 'CreateUserRequest' })  // Validates request
  @Timeout(5000)  // Sets timeout
  @After(addTimestamp, logResponse)  // Runs last
  async post(request: Request, response: Response): Promise<Response> {
    // Your business logic here
    response.body = { id: '123', ...request.body };
    return response;
  }
}
```

**Execution Order:**
1. `@Before` middleware (in order: rateLimiter → authMiddleware)
2. `@Validate` validation
3. Method execution with `@Timeout`
4. `@After` middleware (in order: addTimestamp → logResponse)

### Multiple HTTP Methods in One Class

Define all HTTP methods for a resource in a single class:

```typescript
export class UsersEndpoint extends BaseEndpoint {
  // GET /users
  @Before(authMiddleware)
  async get(request: Request, response: Response): Promise<Response> {
    response.body = { users: [] };
    return response;
  }

  // POST /users
  @Before(authMiddleware)
  @Validate({ requiredBody: 'CreateUserRequest' })
  @Timeout(5000)
  async post(request: Request, response: Response): Promise<Response> {
    response.body = { id: '123', ...request.body };
    return response;
  }

  // PUT /users (if your routing supports it)
  @Before(authMiddleware)
  @Validate({ requiredBody: 'UpdateUserRequest' })
  async put(request: Request, response: Response): Promise<Response> {
    response.body = { updated: true };
    return response;
  }

  // DELETE /users
  @Before(authMiddleware)
  async delete(request: Request, response: Response): Promise<Response> {
    response.code = 204;
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
  autoValidate: true,        // Validate requests against OpenAPI schema
  validateResponse: true     // Also validate responses
});
```

### Custom Error Handling

```typescript
import { ApiError } from 'acai-ts';

export class GetUserEndpoint extends BaseEndpoint {
  async get(request: Request, response: Response): Promise<Response> {
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
  callback: (log) => {
    // Custom logging logic (e.g., send to CloudWatch, Datadog, etc.)
    console.log('Custom handler:', log);
  },
  minLevel: 'INFO'
});

// Use in your code
const logger = new Logger();
logger.log('Processing request');
logger.error('Something went wrong');

// Or use global logger if set up
global.logger?.info('Using global logger');
```

### Event Middleware

Process events with middleware for validation, enrichment, etc:

```typescript
import {Event} from 'acai-ts/dynamodb';

const enrichRecord = async (records: any[]) => {
  for (const record of records) {
    record.metadata = await fetchMetadata(record.id);
  }
};

const ddbEvent = new Event(event, {
  before: enrichRecord,
  operations: ['create'],  // Use normalized operations: 'create', 'update', 'delete'
  requiredBody: 'RecordSchema',
  schemaPath: './schemas/openapi.yml'
});

await ddbEvent.process();
```

### Custom Data Classes

Transform records into custom classes:

```typescript
import {Event} from 'acai-ts/dynamodb';

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

const ddbEvent = new Event<User>(event, {
  dataClass: User,
  operations: ['create']  // Use normalized operations
});

await ddbEvent.process();

for (const user of ddbEvent.records) {
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
  cache?: 'all' | 'none' | 'route';    // Cache mode for route resolution
  autoValidate?: boolean;               // Validate requests against OpenAPI schema (default: false)
  validateResponse?: boolean;           // Validate responses against schema (default: false)
  timeout?: number;                     // Default timeout in ms
  outputError?: boolean;                // Output detailed error messages (default: false)
  globalLogger?: boolean;               // Enable global logging (default: false)
  loggerCallback?: LoggerCallback;      // Custom logger callback function
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
  hasErrors: boolean;                  // Whether response has errors
  errors: ErrorObject[];               // Array of error objects

  // Methods
  setHeader(key: string, value: string): void;
  setHeaders(headers: Record<string, string>): void;
  setError(key: string, message: string): void;
  setErrors(errors: ErrorObject[]): void;
  addBodyProperty(key: string, value: unknown): void;
  addBodyProperties(properties: Record<string, unknown>): void;
  compress(): void;                    // Enable gzip compression
}
```

### BaseEndpoint

**Class for defining API Gateway endpoints with method decorators:**

```typescript
import { BaseEndpoint, Before, After, Timeout, Validate } from 'acai-ts';

export class UsersEndpoint extends BaseEndpoint {
  // Implement HTTP methods: get, post, put, patch, delete

  async get(request: Request, response: Response): Promise<Response> {
    // GET handler implementation
    return response;
  }

  async post(request: Request, response: Response): Promise<Response> {
    // POST handler implementation
    return response;
  }

  async put(request: Request, response: Response): Promise<Response> {
    // PUT handler implementation
    return response;
  }

  async patch(request: Request, response: Response): Promise<Response> {
    // PATCH handler implementation
    return response;
  }

  async delete(request: Request, response: Response): Promise<Response> {
    // DELETE handler implementation
    return response;
  }
}
```

**Supported HTTP Methods:**
- `get(request, response)` - Handles GET requests
- `post(request, response)` - Handles POST requests
- `put(request, response)` - Handles PUT requests
- `patch(request, response)` - Handles PATCH requests
- `delete(request, response)` - Handles DELETE requests

**Method Decorators:**

All decorators are applied to the individual HTTP methods (not the class itself):

```typescript
export class UsersEndpoint extends BaseEndpoint {
  @Before(authMiddleware)           // Runs before the method
  @Validate({ requiredBody: 'UserSchema' })  // Validates request
  @Timeout(5000)                    // Sets 5-second timeout
  @After(loggingMiddleware)         // Runs after the method
  async post(request: Request, response: Response): Promise<Response> {
    response.body = { id: '123', ...request.body };
    return response;
  }
}
```

**File Structure:**
- Place endpoint classes in handler files: `src/handlers/users.ts`
- Export the class: `export class UsersEndpoint extends BaseEndpoint { ... }`
- Router automatically discovers and instantiates the class
- Route is determined by file path: `src/handlers/users.ts` → `/users`

### Event Classes

**Submodule Imports:**

```typescript
// Import Event from submodules for better tree-shaking
import {Event} from 'acai-ts/dynamodb';  // For DynamoDB Streams
import {Event} from 'acai-ts/sqs';       // For SQS Messages
import {Event} from 'acai-ts/s3';        // For S3 Events

// Or import from main module (less optimal for tree-shaking)
import {Event as DDBEvent} from 'acai-ts';
```

**Event Configuration:**

All event types use the same `IEventConfig<T>` interface:

```typescript
interface IEventConfig<T> {
  // Operation filtering (normalized across all event types)
  operations?: OperationType[];         // ['create', 'update', 'delete']
  operationError?: boolean;            // Throw error on wrong operation (default: false)

  // Middleware
  before?: (records: any[]) => void | Promise<void>;  // Pre-process middleware

  // Data transformation
  dataClass?: new (record: any) => T;  // Transform to custom class

  // Validation
  requiredBody?: string | object;      // Schema validation
  schemaPath?: string;                 // Path to OpenAPI schema
  validationError?: boolean;           // Throw on validation error (default: true)
  strictValidation?: boolean;          // Strict schema validation
  autoValidate?: boolean;              // Auto-validate with OpenAPI

  // S3-specific options
  getObject?: boolean;                 // Auto-fetch S3 objects (S3 only)
  isJSON?: boolean;                    // Parse S3 object as JSON (requires getObject)
  isCSV?: boolean;                     // Parse S3 object as CSV (requires getObject)

  // Logging
  globalLogger?: boolean;              // Enable global logging
  loggerCallback?: (log: any) => void; // Custom logger callback
}
```

**Operation Types:**

Operations are normalized across all event types:

```typescript
type OperationType = 'create' | 'update' | 'delete';

// DynamoDB mapping:
// 'create' = INSERT
// 'update' = MODIFY
// 'delete' = REMOVE

// S3 mapping:
// 'create' = ObjectCreated:* (Put, Post, Copy, CompleteMultipartUpload)
// 'delete' = ObjectRemoved:* (Delete, DeleteMarkerCreated)

// SQS: No operation filtering (all messages treated as 'create')
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

**Cause:** Using `@` decorator syntax on exported const declarations or on class declarations.

**Solution:** Use decorators on class methods only:

```typescript
// ❌ Wrong: @ syntax on const/function
@Before(middleware)
export const get = async (request, response) => { ... };

// ❌ Wrong: Decorators on the class itself
@Route('GET', '/users')
export class UsersEndpoint extends BaseEndpoint { ... }

// ✅ Correct: Decorators on class methods
export class UsersEndpoint extends BaseEndpoint {
  @Before(middleware)
  async get(request: Request, response: Response): Promise<Response> {
    // handler code
  }
}

// ✅ Alternative: Use requirements pattern for function-based handlers
export const requirements = {
  get: {
    before: [middleware]
  }
};
export const get = async (request, response) => { ... };
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

1. **For requirements pattern, ensure proper structure:**
   ```typescript
   // ✅ Correct
   export const requirements = {
     get: {
       before: [authMiddleware, rateLimiter],  // Array of middleware
       after: [loggingMiddleware]
     }
   };
   export const get = async (request, response) => { ... };
   ```

2. **For class-based decorators, ensure they're on methods (not class):**
   ```typescript
   // ✅ Correct: Decorators on methods
   export class UsersEndpoint extends BaseEndpoint {
     @Before(authMiddleware)
     @After(loggingMiddleware)
     async get(request: Request, response: Response): Promise<Response> {
       // handler code
     }
   }

   // ❌ Wrong: Decorators on the class
   @Before(authMiddleware)
   export class UsersEndpoint extends BaseEndpoint { ... }
   ```

3. **Verify middleware signature:**
   ```typescript
   // ✅ Correct signature
   const middleware: BeforeMiddleware = async (request: Request, response: Response) => {
     // Your logic
   };

   // ❌ Wrong - missing parameters
   const middleware = async () => { ... };
   ```

4. **Check that your class extends BaseEndpoint:**
   ```typescript
   // ✅ Correct
   export class UsersEndpoint extends BaseEndpoint { ... }

   // ❌ Wrong - missing extends
   export class UsersEndpoint { ... }
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

### Event Handler Decorators Not Working

**Problem:** Using `@Before`/`@After` decorators on event handlers causes errors or doesn't execute.

**Cause:** The `@Before`, `@After`, `@Auth`, and `@Timeout` decorators are for **Router/API Gateway endpoints only**, not for event handlers (DynamoDB, S3, SQS).

**Solutions:**

1. **Use function wrapper patterns:**
   ```typescript
   import {Event} from 'acai-ts/sqs';
   import {SQSEvent} from 'aws-lambda';

   type HandlerFunction = (event: SQSEvent) => Promise<any>;

   function withLogging(handler: HandlerFunction): HandlerFunction {
     return async (event: SQSEvent) => {
       console.log('Processing event...');
       const result = await handler(event);
       console.log('Complete!');
       return result;
     };
   }

   async function processEvent(event: SQSEvent) {
     const sqsEvent = new Event(event, {});
     // Process records
     return { statusCode: 200 };
   }

   export const handler = withLogging(processEvent);
   ```

2. **Use the `before` configuration option:**
   ```typescript
   const ddbEvent = new Event(event, {
     before: async (records: any[]) => {
       console.log(`Processing ${records.length} records`);
     }
   });
   await ddbEvent.process();
   ```

See the [Event Processing Patterns](#-event-processing-patterns) section for complete examples.

### Module Resolution Warnings

**Error Message:**
```
Cannot find module 'acai-ts/dynamodb' or its corresponding type declarations.
There are types at '.../node_modules/acai-ts/dist/esm/dynamodb/index.d.ts', but this
result could not be resolved under your current 'moduleResolution' setting.
Consider updating to 'node16', 'nodenext', or 'bundler'.
```

**Cause:** TypeScript `moduleResolution` is set to `'node'` (legacy) instead of a modern setting that supports package subpath exports.

**Solutions:**

1. **Update tsconfig.json (Recommended):**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node16"  // or "nodenext" or "bundler"
     }
   }
   ```

2. **Use main module import (less optimal for tree-shaking):**
   ```typescript
   // Instead of:
   import {Event} from 'acai-ts/dynamodb';

   // Use:
   import {Event as DDBEvent} from 'acai-ts';
   ```

**Note:** Submodule imports (`acai-ts/dynamodb`, `acai-ts/sqs`, `acai-ts/s3`) are preferred for better tree-shaking and smaller bundle sizes.

### Event.process() vs .records Access Error

**Error Message:**
```
Must use Event.process() with these params & await the records
```

**Cause:** Trying to use synchronous `.records` access when middleware, validation, or S3 `getObject` is configured.

**Solution:**

The access pattern depends on your configuration:

```typescript
// ✅ Sync access (no middleware) - OK
const event = new Event(rawEvent, {
  operations: ['create']  // Simple filtering only
});
const records = event.records;  // Direct access

// ❌ Sync access with middleware - ERROR
const event = new Event(rawEvent, {
  before: async (r: any[]) => console.log(r.length),
  operations: ['create']
});
const records = event.records;  // Throws error!

// ✅ Async access with middleware - Correct
const event = new Event(rawEvent, {
  before: async (r: any[]) => console.log(r.length),
  operations: ['create']
});
await event.process();  // Required!
const records = event.records;  // Now works
```

**Requires `await .process()`:**
- When using `before` middleware
- When using `requiredBody` validation
- When using S3 `getObject`
- Any advanced processing

**Direct `.records` access OK:**
- Simple operation filtering only (`operations: ['create']`)
- No middleware
- No validation
- No S3 object fetching

### Wrong Operations Type Error

**Error Message:**
```
record is operation: insert; only allowed create,update,delete
```

**Cause:** Using AWS event names (`'INSERT'`, `'MODIFY'`, `'REMOVE'`, `'ObjectCreated:Put'`) instead of normalized operation types.

**Solution:**

Always use the normalized operation types:

```typescript
// ❌ Wrong: AWS event names
operations: ['INSERT', 'MODIFY']  // DynamoDB
operations: ['ObjectCreated:Put']  // S3

// ✅ Correct: Normalized types
operations: ['create', 'update']  // Works for all event types
operations: ['create']  // Filter creates only
```

**Operation Mappings:**

**DynamoDB:**
- `'create'` → INSERT
- `'update'` → MODIFY
- `'delete'` → REMOVE

**S3:**
- `'create'` → ObjectCreated:* (Put, Post, Copy, CompleteMultipartUpload)
- `'delete'` → ObjectRemoved:* (Delete, DeleteMarkerCreated)

**SQS:**
- No operation filtering (all messages are treated as events)

### Property Names Don't Match Documentation

**Problem:** Following examples but properties like `.newImage`, `.bucketName`, `.messageAttributes` don't exist.

**Cause:** Using incorrect or outdated property names.

**Solution:**

Use these correct property names:

**DynamoDB Records:**
```typescript
record.id          // Event ID
record.name        // Event name: 'INSERT', 'MODIFY', 'REMOVE'
record.operation   // Normalized: 'create', 'update', 'delete'
record.keys        // DynamoDB keys
record.body        // New image (NewImage)
record.oldBody     // Old image (OldImage) - for updates/deletes
record.size        // Approximate size
record.sourceARN   // Stream ARN
record.sequencer   // Sequence number
```

**S3 Records:**
```typescript
record.bucket      // Bucket object with .name, .arn, .ownerIdentity
record.key         // Object key/path
record.eventName   // Full event name: 'ObjectCreated:Put'
record.operation   // Normalized: 'create' or 'delete'
record.size        // Object size in bytes
record.eTag        // Object ETag
record.body        // Object content (if getObject: true)
record.source      // 'aws:s3'
```

**SQS Records:**
```typescript
record.messageId      // Message ID
record.body           // Message body (auto-parsed if JSON)
record.attributes     // Message attributes (NOT messageAttributes!)
record.receiptHandle  // Receipt handle for deletion
record.source         // 'aws:sqs'
```

**Common Mistakes:**
```typescript
// ❌ Wrong
record.newImage        // Use: record.body
record.oldImage        // Use: record.oldBody
record.bucketName      // Use: record.bucket (it's an object!)
record.messageAttributes  // Use: record.attributes
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
