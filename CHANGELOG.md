# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Router Configuration**: Fixed parameter mapping issue where `routesPath` was not properly passed to resolver constructors
  - Added `basePath` parameter to `IRouterConfig` interface for stripping request prefixes (e.g., API Gateway stage or service names)
  - Updated `RouteResolver` to map `routesPath` to resolver-specific parameters (`handlerPath` for directory mode, `handlerPattern` for pattern mode)
  - Updated `DirectoryResolver` and `PatternResolver` to accept both legacy parameter names and new unified `routesPath`
  - Resolves "Handlers path not set" error when using directory or pattern routing modes

### Added
- **basePath Configuration**: New `basePath` option in Router configuration to strip prefixes from incoming requests
  - Useful for API Gateway custom domains, stage names, or service prefixes (e.g., `/api`, `/acai-example`)
  - Works with all routing modes (directory, pattern, list)
- **Response Body Modification Methods**: New methods for safely modifying response body in middleware
  - `addBodyProperty(key, value)` - Add a single property to response body
  - `addBodyProperties(properties)` - Add multiple properties at once
  - Designed for use in after middleware to augment responses without overwriting existing data
- **statusCode Alias**: Added `statusCode` property as an alias for `code` in Response class for improved API consistency

## [1.0.0] - 2025-10-15

### Added

#### Core Features
- **Full TypeScript Support**: Complete rewrite in TypeScript with comprehensive type definitions
- **Dual Module System**: Support for both CommonJS and ES Modules
- **Decorator Support**: New decorators for declarative route configuration
  - `@Route` - Define HTTP routes
  - `@Validate` - Add schema validation
  - `@Auth` - Add authentication requirements
  - `@Before` - Add before middleware
  - `@After` - Add after middleware
  - `@Timeout` - Configure route-specific timeouts

#### API Gateway Module
- **Router Class**: Enhanced routing with multiple resolution strategies
  - Pattern-based routing (default)
  - Directory-based routing
  - List-based routing
- **Request Class**: Type-safe request handling with AWS Lambda integration
- **Response Class**: Fluent API for building responses
- **Endpoint Class**: Handler wrapper with middleware support
- **Route Resolvers**:
  - `RouteResolver` - Base resolver with caching
  - `PatternResolver` - Pattern-based route matching
  - `DirectoryResolver` - File system-based routing
  - `ListResolver` - Explicit route list handling
  - `ImportManager` - Dynamic module loading
  - `ResolverCache` - Performance optimization

#### Error Handling
- **ApiError**: Structured API error responses
- **ApiTimeout**: Timeout-specific error handling
- Global error middleware support
- Stack trace sanitization in production

#### Validation
- **Schema Class**: OpenAPI/JSON Schema support
  - JSON Schema 2020-12 support
  - Schema composition with `allOf`
  - Reference resolution
  - YAML and JSON support
- **Validator Class**: Request/response validation
  - Header validation
  - Query parameter validation
  - Path parameter validation
  - Body validation
  - Response validation

#### Common Utilities
- **Logger**: Structured logging with levels
  - `info`, `debug`, `warn`, `error` methods
  - Global logger support
  - Custom callback support
  - Minimum log level filtering
- **Timer**: Performance measurement utilities
- **Event**: Generic AWS event wrapper

#### AWS Service Support
- **DynamoDB Module**:
  - `Event` - DynamoDB Stream event wrapper
  - `Record` - DynamoDB record with type conversion
- **S3 Module**:
  - `Event` - S3 event wrapper
  - `Record` - S3 record with CSV, JSON, text parsing
- **SQS Module**:
  - `Event` - SQS event wrapper
  - `Record` - SQS message record

#### Type System
- Comprehensive TypeScript interfaces for all components
- Type definitions for AWS Lambda events and responses
- Generic types for request/response bodies
- Middleware type definitions
- Routing mode enums
- Cache mode enums
- Log level types

#### Developer Experience
- **TypeDoc Integration**: Automated API documentation generation
- **ESLint Configuration**: Code quality enforcement
- **Prettier Integration**: Consistent code formatting
- **Jest Testing**: Unit test framework setup
- **Source Maps**: Full debugging support

#### Build System
- Dual compilation (ESM + CJS)
- Automated post-build ESM import fixing
- Type declaration generation
- Module type markers for Node.js

#### Documentation
- Comprehensive README with examples
- Migration guide from acai-js
- Full documentation website at [https://syngenta.github.io/acai-ts-docs/](https://syngenta.github.io/acai-ts-docs/)
- API documentation (TypeDoc)
- Examples directory with working samples at [https://github.com/syngenta/acai-ts-docs/tree/main/examples](https://github.com/syngenta/acai-ts-docs/tree/main/examples)

### Changed

#### Breaking Changes
- **Router Configuration**: Removed `base`, `inputType`, `outputType` in favor of OpenAPI schema-based configuration
- **Logger Configuration**: Changed `logLevel` property to `minLevel`
- **Logger Setup**: Renamed `Logger.setup()` to `Logger.setUpGlobal()`
- **Module Imports**: Changed from namespace imports to named exports
  ```typescript
  // Old (acai-js)
  const acai = require('acai-js');
  const Router = acai.apigateway.Router;

  // New (acai-ts)
  import { Router } from 'acai-ts';
  ```
- **TypeScript Required**: Project now requires TypeScript 5.0+ and Node.js 18.18.2+

#### Enhanced
- **Validation**: Upgraded from JSON Schema draft-07 to 2020-12
- **Error Messages**: More descriptive error messages with better context
- **Performance**: Route resolution caching for faster lookups
- **Type Safety**: All APIs now have strong typing

### Fixed
- ESM import resolution issues with directory imports
- Module type detection in hybrid CommonJS/ESM environments
- JSON Schema reference resolution in complex schemas
- Memory leaks in route caching
- Request body parsing edge cases

### Dependencies

#### Runtime Dependencies
- `@apideck/reva@^0.2.1` - Schema validation
- `@aws-sdk/client-dynamodb@^3.911.0` - DynamoDB support
- `@aws-sdk/client-s3@^3.911.0` - S3 support
- `@aws-sdk/util-dynamodb@^3.911.0` - DynamoDB utilities
- `@types/aws-lambda@^8.10.145` - AWS Lambda types
- `ajv@^8.17.1` - JSON Schema validation
- `csv-parse@^6.1.0` - CSV parsing
- `glob@^11.0.3` - File pattern matching
- `js-yaml@^4.1.0` - YAML support
- `json-schema-merge-allof@^0.8.1` - Schema composition
- `json-schema-ref-parser@^9.0.9` - Schema reference resolution
- `reflect-metadata@^0.2.2` - Decorator metadata
- `xml2js@^0.6.2` - XML parsing

#### Development Dependencies
- TypeScript 5.7.2
- Jest 30.2.0
- ESLint 8.57.1
- Prettier 3.4.2
- TypeDoc 0.28.14

### Backward Compatibility

Maintained backward compatibility through namespace exports:
```typescript
import { apigateway, logger, dynamodb, s3, sqs } from 'acai-ts';
```

This allows gradual migration from acai-js without breaking changes.

### Migration

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions from acai-js, or visit the [online migration guide](https://syngenta.github.io/acai-ts-docs/changes/).

## Pre-1.0.0 (acai-js)

This changelog documents acai-ts (TypeScript version). For acai-js history, see the [acai-js repository](https://github.com/wparad/acai-js).

---

## Version History

- **1.0.0** (2025-10-15) - Initial TypeScript release

[1.0.0]: https://github.com/anthropics/acai-ts/releases/tag/v1.0.0
