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
    handlerPattern: 'src/handlers/**/*.controller.ts'
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

Acai-TS provides powerful decorators for clean, declarative code:

### `@Route(method, path)`

Define HTTP routes for your endpoint:

```typescript
@Route('GET', '/users/{id}')
export class GetUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    const userId = request.pathParameters.id;
    response.body = { id: userId };
    return response;
  }
}
```

### `@Validate(schemaName)`

Validate request body against OpenAPI schema:

```typescript
@Route('POST', '/users')
@Validate('CreateUserRequest') // References #/components/schemas/CreateUserRequest
export class CreateUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    // request.body is validated and typed
    return response;
  }
}
```

### `@Before(middleware)`

Run middleware before handler execution:

```typescript
const authMiddleware = async (request: Request) => {
  if (!request.headers.authorization) {
    throw new ApiError('Unauthorized', 401);
  }
};

@Route('POST', '/users')
@Before(authMiddleware)
export class CreateUserEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    // Runs only if authMiddleware passes
    return response;
  }
}
```

### `@After(middleware)`

Run middleware after handler execution:

```typescript
const loggingMiddleware = async (request: Request, response: Response) => {
  console.log(`Response: ${response.code}`);
};

@Route('GET', '/users')
@After(loggingMiddleware)
export class GetUsersEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    response.body = [{ id: '1' }];
    return response;
  }
}
```

### `@Timeout(milliseconds)`

Set request timeout:

```typescript
@Route('POST', '/heavy-task')
@Timeout(30000) // 30 seconds
export class HeavyTaskEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    await this.processHeavyTask();
    return response;
  }
}
```

### `@Auth(authFunction)`

Authenticate requests:

```typescript
const jwtAuth = async (request: Request) => {
  const token = request.headers.authorization?.split(' ')[1];
  return verifyJWT(token);
};

@Route('GET', '/profile')
@Auth(jwtAuth)
export class ProfileEndpoint extends Endpoint {
  async handler(request: Request, response: Response) {
    response.body = request.context.user; // Populated by auth
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
  basePath?: string;                    // Base path for all routes (e.g., '/api/v1')
  schemaPath?: string;                  // Path to OpenAPI schema file
  handlerPattern?: string;              // Glob pattern for handler files
  endpoints?: Array<typeof Endpoint>;   // Decorator-based endpoints
  autoValidate?: boolean;               // Validate responses (default: false)
  strictValidation?: boolean;           // Strict schema validation (default: false)
  timeout?: number;                     // Default timeout in ms
}
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
